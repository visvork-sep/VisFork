import { useRef, useEffect, useState, useMemo, useCallback, memo } from "react";
import { select } from "d3-selection";
import { brush } from "d3-brush";
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
import * as graphics from "./timelineGraphics";
import * as c from "./timelineConstants";
import { themeGet, useTheme } from "@primer/react";
import { interpolateRainbow } from "d3";

function CommitTimeline({
    commitData,
    handleTimelineSelection,
}: TimelineProps) {
    const [merged, setMerged] = useState(false); // State for merged view
    const [selectAll, setSelectAll] = useState(false); // State for selection

    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null); // Parent container

    // Color controls
    const { colorMode, theme } = useTheme();
    const isDarkMode = colorMode === "dark";
    const colorScheme = {
        neutralLaneColor: themeGet("colors.neutral.muted")({ theme }),
        accentedLaneColor: themeGet("colors.accent.muted")({ theme }),
        markerColor: themeGet("colors.fg.subtle")({ theme }),
        overlayColor: themeGet("colors.fg.muted")({ theme }),
    };

    // Buttons style and hover/leave design
    const BUTTON_STYLE: React.CSSProperties = {
        width: "120px", height: "40px", padding: "5px 10px",
        color: `${isDarkMode ? "white" : "black"}`,
        cursor: "pointer", backgroundColor: "transparent",
        border: `2px solid ${colorScheme.markerColor}`, display: "flex",
        alignItems: "center", justifyContent: "center",
        transition: "background-color 0.3s",
    };

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor =
            e.type === "mouseenter" ? colorScheme.accentedLaneColor : "transparent";
    };
    
    // Memoize the color map, map each repo to a unique color 
    const colorMap = useMemo(() => {
        const repos = Array.from(new Set(commitData.map(c => c.repo)));
        const map = new Map<string, string>();
          
        // Note: these colors don't get updated by colorblind mode or theme changes
        for (let i = 0; i < repos.length; i++) {
            const repo = repos[i];
            map.set(repo, interpolateRainbow(i / repos.length));
        }

        return map;
    }, [commitData]);

    // Precompute both views, update only when data changes
    const builder = graphStratify(); // builder remains the same regardless of data
    const { dagMerged, dagFull } = useMemo(() => {
        let dagMerged = null, dagFull = null;
        try {
            // Merged View takes the grouped nodes directly 
            dagMerged = builder(utils.groupNodes(commitData) as GroupedNode[]);
        } catch (error) {
            console.error("Error building merged timeline:", error);
        }
        try {
            dagFull = builder(commitData as Commit[]);
        } catch (error) {
            console.error("Error building full timeline:", error);
        }
        return { dagMerged, dagFull };
    }, [commitData]); // update the views if the data changes

    // Draw the graph
    const drawGraph = useCallback(() => {
        if (!svgRef.current || !commitData.length || !dagMerged || !dagFull) return;

        // Clear previous visualization
        select(svgRef.current).selectAll("*").remove();
        select("#dag-legends").selectAll("*").remove();

        // The current view
        const dag = merged
            ? (dagMerged as MutGraph<Commit | GroupedNode, undefined>)
            : (dagFull as MutGraph<Commit | GroupedNode, undefined>);

        // Initial layout, will be overwritten 
        const layout = grid()
            .nodeSize([c.NODE_RADIUS * 2, c.NODE_RADIUS * 2])
            .gap([5, 5])
            .tweaks([tweakFlip("diagonal")])
            .rank(utils.dateRankOperator)
            .lane(laneGreedy().topDown(true).compressed(false));

        // Initial dimensions, will be overwritten
        let { width, height } = layout(dag);

        // Make sure that the graph covers the container if there isn't much data 
        width = Math.max(
            width + c.MARGIN.left + c.MARGIN.right,
            containerRef.current?.clientWidth ?? 0
        );

        const svg = select(svgRef.current)
            .attr("width", width)
            .attr("height", height + c.MARGIN.top + c.MARGIN.bottom)
            .attr("viewBox", `0 0 ${width} ${height + c.MARGIN.top + c.MARGIN.bottom}`);
        const g = svg
            .append("g")
            .attr("transform", `translate(${c.MARGIN.left},${c.MARGIN.top})`);

        // Sort nodes by date
        const sortedNodes =
            Array.from(dag.nodes()).sort((a, b) => {
                return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
            });

        // Apply custom layout
        const { lanes, totalHeight } = utils.assignUniqueLanes(sortedNodes);
        height = totalHeight + c.MARGIN.top + c.MARGIN.bottom; // the height is larger due to the lanes

        // Adjust height to custom layout
        select(svgRef.current)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        // Lane shading and author labels
        graphics.drawLanes(g, lanes, width, isDarkMode, colorScheme.neutralLaneColor, colorScheme.accentedLaneColor);

        // Selection overlay for selectAll
        if (selectAll) {
            g.append("rect")
                .attr("class", "selection-overlay")
                .attr("x", 0)
                .attr("y", c.MARGIN.top)
                .attr("width", width)
                .attr("height", totalHeight - c.MARGIN.bottom - c.MARGIN.top)
                .style("fill", colorScheme.overlayColor)
                .style("fill-opacity", "0.3");
        } else {
            // Clear the overlay if selectAll isn't active
            g.select(".selection-overlay").remove();
        }

        // Brush for click-and-drag selection of commits
        let brushSelection: [[number, number], [number, number]] = [[0, 0], [0, 0]];

        const timelineBrush = brush<unknown>()
            .extent([
                [-c.MARGIN.left, 0],
                [width - c.MARGIN.left, totalHeight],
            ])
            .on("start", (event) => {
                setSelectAll(false);
                if (event.sourceEvent?.type !== "end") {
                    brushSelection = [[0, 0], [0, 0]];
                }
            })
            .on("end", (event) => {
                if (event.selection === null || !event.sourceEvent) return; // exit if no selection

                brushSelection = event.selection as [[number, number], [number, number]];
                const [x0, y0] = brushSelection[0];
                const [x1, y1] = brushSelection[1];

                // These coordinates are used to reset the brush 
                if (x0 === 0 && y0 === 0 && x1 === 0 && y1 === 0) return;

                const selectedCommits = sortedNodes
                    // select those nodes which are entirely inside the selection
                    .filter((node) => {
                        const x = node.x + c.NODE_RADIUS;
                        const y = node.y + c.NODE_RADIUS;
                        return x >= x0 && x <= x1 && y >= y0 && y <= y1;
                    })
                    // return their ID rather than the node objects themselves
                    .flatMap((node) =>
                        merged
                            ? (node as MutGraphNode<GroupedNode, unknown>).data.nodes // allows selection of groups
                            : [node.data.id] // in full view 
                    );

                handleTimelineSelection(selectedCommits);
            });


        // Create edges
        g.append("g")
            .selectAll("path")
            .data(dag.links())
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", colorScheme.markerColor)
            .attr("stroke-width", c.EDGE_WIDTH)
            .attr("d", graphics.drawEdgeCurve);

        const brushLayer = g.append("g")
            .attr("class", "brush-layer");
            
        // Apply brush to this layer only (otherwise conflicts with node clicking)
        brushLayer.call(timelineBrush);

        const resetBrushing = () => {
            brushLayer.call(timelineBrush.move, [[0,0], [0,0]]);
        };

        // Create tooltip
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

        // Draw nodes depending on view
        if (merged) {
            const mergedNodes = sortedNodes as unknown as MutGraphNode<GroupedNode, undefined>[];
            const { circles, squares, triangles } = graphics.drawMergedNodes(g, colorMap, mergedNodes);

            // Apply tooltips
            applyToolTip(circles as NodeSelection);
            applyToolTip(triangles as NodeSelection);
            applyToolTip(squares as unknown as NodeSelection);

        } else {
            // Month/year labels
            graphics.drawTimelineMarkers(g, sortedNodes, totalHeight, isDarkMode, colorScheme.markerColor);

            const { circles } = graphics.drawNormalNodes(g, colorMap, sortedNodes);

            // Apply tooltips
            applyToolTip(circles as NodeSelection);
        }

        function applyToolTip(selection: NodeSelection) {
            selection.on("mouseover mouseout mousemove click", function(event, d) {
                const eventType = event.type;
                
                // When the user hovers on a node
                if (eventType === "mouseover") {
                    tooltip.transition().duration(c.TOOLTIP_MOUSEOVER_DUR).style("opacity", 0.9);
                    
                    // Generate content inline
                    let content = ""; // the content varies depending on the view
                    if (!merged) {
                        const commitData = d.data;
                        content = `
                        <strong>Commit</strong>: ${commitData.id}<br>
                        <strong>Repo</strong>: ${commitData.repo}<br>
                        <strong>Branch</strong>: ${commitData.branch}<br>
                        <strong>Date</strong>: ${commitData.date}`;
                    } else {
                        const mergedData = d.data as GroupedNode;
                        content = `
                        <strong>Type of Commit</strong>: ${mergedData.branch}<br>
                        <strong>Repo</strong>: ${mergedData.repo}<br>
                        ${mergedData.nodes.length > 1
        ? `<strong>Number of Commits</strong>: ${mergedData.nodes.length}<br>
                            <strong>Date of First Commit</strong>: ${mergedData.date}<br>
                            <strong>Date of Last Commit</strong>: ${mergedData.end_date}`
        : `<strong>Date</strong>: ${mergedData.date}`}`;
                    }
                    
                    tooltip.html(content)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px");
                }
                else if (eventType === "mousemove") {
                    tooltip.style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px");
                }
                // Hide the tooltip when the user's mouse moves away
                else if (eventType === "mouseout") {
                    tooltip.transition().duration(c.TOOLTIP_MOUSEOUT_DUR).style("opacity", 0);
                }
                // Open the commit's page on GH when clicking on a node
                else if (eventType === "click") {
                    event.stopPropagation();
                    // Note that in Merged View default commits cannot be opened
                    if (!merged || d.data.branch != "default") {
                        window.open(d.data.url);
                    }
                }
            });
        }

        // Display legends for the colors in #dag-legends
        const legend = select("#dag-legends")
            .style("display", "flex")
            .style("align-items", "flex-start");

        // Draws two legends if Meged View, one otherwise 
        // Passing the nodes themselves is necessary for the select-by-fork and select-by-type functionality
        graphics.drawLegends(
            merged, legend, colorMap, 
            colorScheme.markerColor, sortedNodes, 
            setSelectAll, handleTimelineSelection, resetBrushing);

        return () => {
            tooltip.remove(); // Remove tooltip on cleanup
        };
    }, [commitData, merged, selectAll, theme]);

    useEffect(() => {
        drawGraph();
        window.addEventListener("resize", drawGraph);
        return () => window.removeEventListener("resize", drawGraph);
    }, [drawGraph]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            {/* Buttons at the top */}
            <div
                style={{
                    padding: "10px",
                    background: "transparent",
                    borderBottom: `1px solid ${colorScheme.markerColor}`,
                    textAlign: "left",
                }}
            >
                <div style={{ display: "flex", gap: "10px" }}>
                    {/* View Toggle */}
                    <button
                        onClick={() => setMerged(!merged)}
                        style={BUTTON_STYLE}
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={handleButtonHover}
                    >
                        {merged ? "Full View" : "Merged View"}
                    </button>
                    {/* Select All Toggle */}
                    <button
                        onClick={() => {
                            const selectedCommits = !selectAll
                                ? commitData.map((n) => n.id) // Select all
                                : []; // Deselect all
                            handleTimelineSelection(!selectAll ? selectedCommits : []);
                            setSelectAll(!selectAll);
                        }}
                        style={BUTTON_STYLE}
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={handleButtonHover}
                    >
                        {selectAll ? "Deselect All" : "Select All"}
                    </button>
                </div>
            </div>

            {/* Scrollable container for the SVG */}
            <div
                style={{
                    overflow: "auto",
                }}
            >
                <svg ref={svgRef}></svg>
            </div>

            {/* Legends at the bottom */}
            <div
                id="dag-legends"
                style={{
                    padding: "10px",
                    background: "transparent",
                    borderTop: `1px solid ${colorScheme.markerColor}`,
                }}
            ></div>
        </div>
    );
};

export default memo(CommitTimeline);
