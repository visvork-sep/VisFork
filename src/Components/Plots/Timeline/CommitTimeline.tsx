import {useRef, useEffect, useState, useMemo, useCallback} from "react";
import { select } from "d3-selection";
import { brush } from "d3-brush";
import type { D3BrushEvent } from "d3-brush";
import {
    graphStratify,
    grid,
    tweakFlip,
    laneGreedy,
    MutGraph,
    MutGraphNode,
} from "d3-dag";

import { TimelineProps, TimelineDetails as Commit } from "@VisInterfaces/TimelineData";
import { GroupedNode, NodeSelection } from "./timelineUtils";
import * as utils from "./timelineUtils";
import * as c from "./timelineConstants"; 


function CommitTimeline({ commitData, handleTimelineSelection }: TimelineProps) {
    const [merged, setMerged] = useState(false); // state for merged view
    const [selectAll, setSelectAll] = useState(false); // state for selection

    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null); // parent container

    const colorMap = utils.buildRepoColorMap(commitData);

    // precompute both views, update only when data changes
    const builder = graphStratify();
    const dagMerged = useMemo(() => {
        try {
            return builder(utils.groupNodes(commitData) as GroupedNode[]);
        } catch (error) {
            console.error("Error building merged DAG:", error);
            return null;
        }
    }, [commitData]);
  
    const dagFull = useMemo(() => {
        try {
            return builder(commitData as Commit[]);
        } catch (error) {
            console.error("Error building full DAG:", error);
            return null;
        }
    }, [commitData]);

    const drawGraph = useCallback(() => {
        if (!svgRef.current || !commitData.length || !dagMerged || !dagFull) return;

        // clear previous visualization
        select(svgRef.current).selectAll("*").remove();
        select("#dag-legends").selectAll("*").remove();

        let dag: MutGraph<Commit | GroupedNode, undefined> | null = null;
        dag = merged ? dagMerged as MutGraph<Commit | GroupedNode, undefined>: 
        dagFull as MutGraph<Commit | GroupedNode, undefined>; 

        const layout = grid()
            .nodeSize([c.NODE_RADIUS * 2, c.NODE_RADIUS * 2])
            .gap([5, 5])
            .tweaks([tweakFlip("diagonal")])
            .rank(utils.dateRankOperator)
            .lane(laneGreedy().topDown(true).compressed(false));

        // initial dimensions, height will be overwritten
        let { width, height } = layout(dag);

        width = Math.max(width + c.MARGIN.left + c.MARGIN.right, 
            containerRef.current?.clientWidth ?? 0);
        const svg = select(svgRef.current)
            .attr("width", width)
            .attr("height", height + c.MARGIN.top + c.MARGIN.bottom)
            .attr("viewBox", `0 0 ${width} ${height + c.MARGIN.top + c.MARGIN.bottom}`);
        const g = svg.append("g")
            .attr("transform", `translate(${c.MARGIN.left},${c.MARGIN.top})`);

        // sort nodes by date
        const sortedNodes = Array.from(dag.nodes()).sort((a, b) => {
            return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
        });

        // apply custom layout 
        const { lanes, totalHeight } = utils.assignUniqueLanes(sortedNodes);
        height = totalHeight + c.MARGIN.top + c.MARGIN.bottom;
        // adjust height to custom layout
        select(svgRef.current).attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);
        

        // lane shading and author labels
        utils.drawLanes(g, lanes, width);

        // month/year labels
        if (!merged) {
            utils.drawTimelineMarkers(g, sortedNodes, totalHeight);
        }

        // selection overlay for selectAll
        if (selectAll) {
            g.append("rect")
                .attr("class", "selection-overlay")
                .attr("x", 0).attr("y", c.MARGIN.top)
                .attr("width", width).attr("height", totalHeight - c.MARGIN.bottom - c.MARGIN.top)
                .style("fill", "#777")
                .style("fill-opacity", "0.3");
        } else {
            g.select(".selection-overlay").remove();
        }

        let brushSelection: [[number, number], [number, number]] = [[0, 0], [0, 0]];

        const brushStart = (event: D3BrushEvent<unknown>) => {
            setSelectAll(false);
            if (event.sourceEvent && event.sourceEvent.type !== "end") {
                brushSelection = [[0, 0], [0, 0]];
            } 
        };

        function brushEnd(event: D3BrushEvent<unknown>) {
            if (event.selection === null || !event.sourceEvent) return; // exit if no selection

            brushSelection = event.selection as [[number, number], [number, number]];
            const [x0, y0] = brushSelection[0];
            const [x1, y1] = brushSelection[1];

            const selectedCommits = sortedNodes.filter((node) => {
                const x = node.x + c.NODE_RADIUS; 
                const y = node.y + c.NODE_RADIUS;
                return x >= x0 && x <= x1 && y >= y0 && y <= y1;
            })
                .flatMap(node =>
                    merged ? (node as MutGraphNode<GroupedNode, unknown>).data.nodes : [node.data.id]);

            console.log("Selected Commits:", selectedCommits);
            handleTimelineSelection(selectedCommits);
        }

        const timelineBrush = brush<unknown>()
            .extent([
                [-c.MARGIN.left, 0],
                [width - c.MARGIN.left, totalHeight],
            ])
            .on("start", brushStart)
            .on("end", brushEnd);
            
        // create edges 
        g.append("g")
            .selectAll("path")
            .data(dag.links())
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", c.EDGE_STROKE_COLOR)
            .attr("stroke-width", c.EDGE_WIDTH)
            .attr("d", utils.drawEdgeCurve);

        g.call(timelineBrush);

        // create tooltip
        const tooltip = select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", c.TOOLTIP_BG_COLOR)
            .style("padding", c.TOOLTIP_PADDING)
            .style("border", c.TOOLTIP_BORDER)
            .style("border-radius", c.TOOLTIP_BORDER_RADIUS)
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("font", c.TOOLTIP_FONT);

        // draw nodes depending on view
        if (merged) {
            const mergedNodes = sortedNodes as unknown as MutGraphNode<GroupedNode, undefined>[];
            const {circles, squares, triangles} = utils.drawMergedNodes(g, colorMap, mergedNodes);

            applyToolTip(circles as NodeSelection);
            applyToolTip(triangles as NodeSelection);
            applyToolTip(squares as unknown as NodeSelection);

        } else {
            const {circles} = utils.drawNormalNodes(g, colorMap, sortedNodes);

            // apply tooltips
            applyToolTip(circles as NodeSelection);
        }

        function applyToolTip(selection: NodeSelection) {
            selection
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(c.TOOLTIP_MOUSEOVER_DUR).style("opacity", 0.9);
                    let content = "";
                    if (!merged) {
                        // full view
                        const commitData = d.data as Commit;
                        content = `
                        <strong>Commit</strong>: ${commitData.id}<br>
                        <strong>Repo</strong>: ${commitData.repo}<br>
                        <strong>Branch</strong>: ${commitData.branch}<br>
                        <strong>Date</strong>: ${commitData.date}`;
                    } else {
                        // merged view (linter issues for indenting)
                        const mergedData = d.data as GroupedNode;
                        content = `
                        <strong>Type of Commit</strong>: ${mergedData.branch}<br>
                        <strong>Repo</strong>: ${mergedData.repo}<br>
                         ${mergedData.nodes.length > 1
        ? `<strong>Number of Commits</strong>: ${mergedData.nodes.length}<br>
                                <strong>Date of First Commit</strong>: ${mergedData.date}<br>
                                <strong>Date of Last Commit</strong>: ${mergedData.end_date}`
        : `<strong>Date</strong>: ${mergedData.date}`
}
                        `;
                    }
                    tooltip.html(content)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px");
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(c.TOOLTIP_MOUSEOUT_DUR).style("opacity", 0);
                })
                .on("click", (_event, d) => {
                    window.open(d.data.url);
                });
        }

        
        // display legends for the colors in #dag-legends
        const legend = select("#dag-legends")
            .style("display", "flex")
            .style("align-items", "flex-start");

        utils.drawLegends(merged, legend, colorMap); 

        return () => {
            tooltip.remove();
        };
    }, [commitData, merged, selectAll]);

    useEffect(() => {
        drawGraph();
        window.addEventListener("resize", drawGraph);
        return () => window.removeEventListener("resize", drawGraph);
    }, [drawGraph]);

    return (
        <div ref={containerRef} style={{width: "100%", height: "100%"}}>
            {/* button at the top */}
            <div
                style={{
                    padding: "10px",
                    background: "#fff",
                    borderBottom: "1px solid #ccc",
                    textAlign: "left",
                }}
                
            >
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => setMerged(!merged)}
                        style={c.BUTTON_STYLE}
                        onMouseEnter={utils.onHover}
                        onMouseLeave={utils.onLeave}
                    >{merged? "Full View" : "Merged View"}</button>

                    <button
                        onClick={() => {
                            const selectedCommits = !selectAll
                                ? commitData.map(n => n.id) // select all
                                : []; //deselect all
                            handleTimelineSelection(!selectAll ? selectedCommits : []);
                            setSelectAll(!selectAll);
                        }}
                        style={c.BUTTON_STYLE}
                        onMouseEnter={utils.onHover}
                        onMouseLeave={utils.onLeave}
                    >{selectAll ? "Deselect All" : "Select All"}</button>

                </div>
            </div>

      
            {/* scrollable container for the SVG */}
            <div
                style={{
                    overflow: "auto",
                }}
            >
                <svg ref={svgRef}></svg>
            </div>
      
            {/* legends at the bottom */}
            <div
                id="dag-legends"
                style={{
                    padding: "10px",
                    background: "transparent",
                    borderTop: "1px solid #ccc",
                }}
            >
            </div>
        </div>
    );
      
      
      
};

export default CommitTimeline;
