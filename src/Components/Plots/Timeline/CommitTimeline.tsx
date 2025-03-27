import {useRef, useEffect, useState, useMemo} from "react";
import * as d3 from "d3";
import * as d3dag from "d3-dag";

import { TimelineProps, TimelineDetails as Commit } from "@VisInterfaces/TimelineData";
import { GroupedNode, NodeSelection } from "./timelineUtils";
import * as utils from "./timelineUtils";
import * as c from "./timelineConstants"; 


function CommitTimeline({ commitData,
    c_width, c_height,
    defaultBranches,
    handleTimelineSelection }: TimelineProps) {

    const svgRef = useRef<SVGSVGElement>(null);
    const [merged, setMerged] = useState(false); // state for merged view
    const [selectAll, setSelectAll] = useState(false); // state for selection
    const colorMap = utils.buildRepoColorMap(commitData);

    // precompute both views, update only when data changes
    const builder = d3dag.graphStratify();
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
  

    useEffect(() => {
        if (!svgRef.current || !commitData.length) return;

        // clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();
        d3.select("#dag-legends").selectAll("*").remove();

        let dag: d3dag.MutGraph<Commit | GroupedNode, undefined> | null = null;
        dag = merged ? dagMerged as d3dag.MutGraph<Commit | GroupedNode, undefined>: 
        dagFull as d3dag.MutGraph<Commit | GroupedNode, undefined>; 

        const layout = d3dag.grid()
            .nodeSize([c.NODE_RADIUS * 2, c.NODE_RADIUS * 2])
            .gap([5, 5])
            .tweaks([d3dag.tweakFlip("diagonal")])
            .rank(utils.dateRankOperator)
            .lane(d3dag.laneGreedy().topDown(true).compressed(false));

        // initial dimensions, height will be overwritten
        const { width, height } = layout(dag);

        const svgWidth = Math.max(width + c.MARGIN.left + c.MARGIN.right, c_width ?? 0);
        const svg = d3.select(svgRef.current)
            .attr("width", svgWidth)
            .attr("height", height + c.MARGIN.top + c.MARGIN.bottom);
        const g = svg.append("g")
            .attr("transform", `translate(${c.MARGIN.left},${c.MARGIN.top})`);

        // sort nodes by date
        const sortedNodes = Array.from(dag.nodes()).sort((a, b) => {
            return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
        });

        // apply custom layout 
        const { lanes, totalHeight } = utils.assignUniqueLanes(sortedNodes);
        // adjust height to custom layout
        d3.select(svgRef.current).attr("height", totalHeight + c.MARGIN.top + c.MARGIN.bottom);

        // lane shading and author labels
        utils.drawLanes(g, lanes, width, c_width);

        // month/year labels
        if (!merged) {
            utils.drawTimelineMarkers(g, sortedNodes, totalHeight);
        }

        // selection overlay for selectAll
        if (selectAll) {
            g.append("rect")
                .attr("class", "selection-overlay")
                .attr("x", 0).attr("y", c.MARGIN.top)
                .attr("width", svgWidth).attr("height", totalHeight - c.MARGIN.bottom - c.MARGIN.top)
                .style("fill", "#777")
                .style("fill-opacity", "0.3");
        } else {
            g.select(".selection-overlay").remove();
        }

        let brushSelection: [[number, number], [number, number]] = [[0, 0], [0, 0]];

        const brushStart = (event: d3.D3BrushEvent<unknown>) => {
            setSelectAll(false);
            if (event.sourceEvent && event.sourceEvent.type !== "end") {
                brushSelection = [[0, 0], [0, 0]];
            } 
        };

        function brushEnd(event: d3.D3BrushEvent<unknown>) {
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
                    merged ? (node as d3dag.MutGraphNode<GroupedNode, unknown>).data.nodes : [node.data.id]);

            console.log("Selected Commits:", selectedCommits);
            handleTimelineSelection(selectedCommits);
        }

        const brush = d3
            .brush()
            .extent([
                [-c.MARGIN.left, 0],                      
                [svgWidth - c.MARGIN.left, totalHeight]   
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

        g.call(brush);

        // create tooltip
        const tooltip = d3.select("body")
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
            const mergedNodes = sortedNodes as unknown as d3dag.MutGraphNode<GroupedNode, undefined>[];
            const {circles, squares, triangles} = utils.drawMergedNodes(g, colorMap, mergedNodes);

            applyToolTip(circles as NodeSelection);
            applyToolTip(triangles as NodeSelection);
            applyToolTip(squares as unknown as NodeSelection);

        } else {
            const {circles, triangles} = utils.drawNormalNodes(g, colorMap, sortedNodes, defaultBranches);

            // apply tooltips
            applyToolTip(circles as NodeSelection);
            applyToolTip(triangles as NodeSelection);
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
        const legend = d3
            .select("#dag-legends")
            .style("display", "flex")
            .style("align-items", "flex-start");

        utils.drawLegends(merged, legend, colorMap); 

        return () => {
            tooltip.remove();
        };

    }, [commitData, merged, c_width, selectAll]);

    return (
        <div style={{ width: c_width }}>
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
                    height: Math.min(
                        c_height,
                        (svgRef.current?.getBoundingClientRect().height ?? 0) +c.DATE_LABEL_HEIGHT
                    ),
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
