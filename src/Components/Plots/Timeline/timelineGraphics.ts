import { Selection, BaseType, select } from "d3-selection";
import { timeFormat } from "d3-time-format";
import { symbol, symbolCircle, symbolSquare, symbolTriangle } from "d3-shape";
import {
    GraphNode,
    MutGraphNode,
    MutGraphLink,
} from "d3-dag";
import type { TimelineDetails as Commit } from "@VisInterfaces/TimelineData";
import * as c from "./timelineConstants"; 


/**
 * Custom interface used for Merged View nodes
 */
export interface GroupedNode extends Commit {
    nodes: string[];
    end_date: string;
}

/**
 * Helper to filter nodes by their *type* in Merged View.
 * Can be easily replaced inline with .filter() 
 */
function filterByBranch(
    nodes: MutGraphNode<GroupedNode, undefined>[],
    branch: string
): MutGraphNode<GroupedNode, undefined>[] {
    const result = [];
    for (const node of nodes) {
        if (node.data.branch === branch) result.push(node);
    }
    return result;
}

/**
 * Draws the alternating shading on the swimlanes. 
 * Appends the author labels to the beginning of each lane.
 */
export function drawLanes(
    g: Selection<SVGGElement, unknown, null, undefined>,
    lanes: Record<string, { minY: number; maxY: number }>,
    svgWidth: number,
    isDarkMode: boolean,
    darkColor: string,
    lightColor: string
) {
    // Shading
    const backgrounds = g.append("g").attr("class", "repo-backgrounds");
  
    const entries = Object.entries(lanes);
    // For each lane
    for (let i = 0; i < entries.length; i++) {
        const [repo, { minY: minX, maxY: maxX }] = entries[i];
        // The color alternates for visual distinction
        const laneColor = i % 2 === 0 ? darkColor : lightColor;
  
        // Append the shading
        backgrounds.append("rect")
            .attr("x", -c.MARGIN.left)
            .attr("y", minX - c.NODE_RADIUS)
            .attr("width", svgWidth)
            .attr("height", maxX - minX + c.NODE_RADIUS * 2)
            .attr("fill", laneColor)
            .attr("opacity", 0.4);
  
        // Append the author label
        backgrounds.append("text")
            .attr("x", -c.MARGIN.left + 5)
            .attr("y", (minX - c.NODE_RADIUS) + (maxX - minX + c.NODE_RADIUS * 2) / 2)
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle")
            .text(repo.split("/")[0])
            .attr("fill", `${isDarkMode ? "white" : "black"}`);
    };
}

/**
 * Draws the timeline markers (vertical dashed lines) whenever the month changes.
 * Will append a textual label below the marker if there is enough space.
 * This function will only be called in Full View. 
 */
export function drawTimelineMarkers(
    g: Selection<SVGGElement, unknown, null, undefined>,
    sortedNodes: GraphNode<Commit | GroupedNode, unknown>[],
    totalHeight: number,
    isDarkMode: boolean,
    colorMarker: string) {

    const formatMonth = timeFormat("%b");
    const formatYear = timeFormat("%Y");
    let lastMonth = "";
    let lastYear = "";
        
    const monthGroup = g.append("g").attr("class", "month-lines");
    let lastLabelX = -Infinity;
        
    for (const node of sortedNodes) {
        const currentDate = new Date(node.data.date);
        const currentMonth = formatMonth(currentDate);
        const currentYear = formatYear(currentDate);
        const labelX = node.x;
        
        if (currentMonth !== lastMonth) {
            // Always draw the vertical line
            monthGroup.append("line")
                .attr("x1", labelX)
                .attr("x2", labelX)
                .attr("y1", 0)
                .attr("y2", totalHeight - 10)
                .attr("stroke", colorMarker)
                .attr("stroke-dasharray", "3,3");
        
            // Only add text label if we have enough space
            if (Math.abs(labelX - lastLabelX) > c.MIN_LABEL_SPACING) {
                const isNewYear = currentYear !== lastYear;
                // The text label includes the year only if it has recently changed
                const labelText = isNewYear 
                    ? `${currentMonth} ${currentYear}` 
                    : currentMonth;
        
                monthGroup.append("text")
                    .attr("x", labelX)
                    .attr("y", totalHeight + c.MARGIN.bottom - 5)
                    .attr("font-size", 12)
                    .style("text-anchor", "middle")
                    .style("fill", `${isDarkMode? "white" : "black"}`)
                    .text(labelText);
        
                lastLabelX = labelX;
            }
        
            lastMonth = currentMonth;
            lastYear = currentYear;
        }
    }
}

/**
 * Used to draw curved edges.
 */
export function drawEdgeCurve(d: MutGraphLink<Commit | GroupedNode, undefined>) {
    if (d.source.y < d.target.y) {
        return `
                M${d.source.x},${d.source.y}
                L${d.source.x},${d.target.y - c.CURVE_SIZE}
                C${d.source.x},${d.target.y}
                ${d.source.x},${d.target.y}
                ${d.source.x + c.CURVE_SIZE},${d.target.y}
                L${d.target.x},${d.target.y}
            `;
    } else if (d.source.y === d.target.y) {
        return `
                M${d.source.x},${d.source.y}
                L${d.target.x},${d.target.y}
            `;
    } else {
        return `
                M${d.source.x},${d.source.y}
                L${d.target.x - c.CURVE_SIZE},${d.source.y}
                C${d.target.x},${d.source.y}
                ${d.target.x},${d.source.y}
                ${d.target.x},${d.source.y - c.CURVE_SIZE}
                L${d.target.x},${d.target.y}
            `;
    }
}

/**
 * Draws circles, triangles and squares depending on the node type.
 */
export function drawMergedNodes(
    g: Selection<SVGGElement, unknown, null, undefined>,
    colorMap: Map<string, string>,
    mergedNodes: MutGraphNode<GroupedNode, undefined>[]) {
    
    // Circles are for fork/merge parents (these have branch = "forkParent")
    const mergedCircles = filterByBranch(mergedNodes, "forkParent");
    const circles = g.append("g")
        .selectAll("circle")
        .data(mergedCircles)
        .enter()
        .append("circle")
        .attr("r", c.NODE_RADIUS)
        .style("cursor", "pointer")
        .each(function(d) {
            const sel = (this as SVGCircleElement);
            select(sel)
                .attr("cx", d.x ?? 0)
                .attr("cy", d.y ?? 0)
                .attr("fill", colorMap.get(d.data.repo) ?? "999");
        });

    // Squares are for (groups of) regular commits (they have branch = "default")
    const mergedSquares = filterByBranch(mergedNodes, "default");
    const squares = g.append("g")
        .selectAll("rect")
        .data(mergedSquares)
        .enter()
        .append("rect")
        .attr("x", d => (d.x ?? 0) - c.NODE_RADIUS)
        .attr("y", d => (d.y ?? 0) - c.NODE_RADIUS)
        .attr("width", c.NODE_RADIUS * 2)
        .attr("height", c.NODE_RADIUS * 2)
        .attr("fill", d => colorMap.get(d.data.repo) ?? "999");

    // Triangles are for merge commits (they have branch = "merge")
    const mergedTriangles = filterByBranch(mergedNodes, "merge");
    const triangles = g.append("g")
        .selectAll("polygon")
        .data(mergedTriangles)
        .enter()
        .append("polygon")
        .attr("points", `0,-${c.NODE_RADIUS} ${c.NODE_RADIUS},${c.NODE_RADIUS} -${c.NODE_RADIUS},${c.NODE_RADIUS}`)
        .attr("transform", d => {
            const x = d.x ?? 0;
            const y = d.y ?? 0;
            return `translate(${x},${y})`;
        })
        .style("cursor", "pointer")
        .attr("fill", d => colorMap.get(d.data.repo) ?? "999");

    return {circles, squares, triangles};
}

// Draws a circle for each commit in the data, colors it according to the repo it is from
export function drawNormalNodes(
    g: Selection<SVGGElement, unknown, null, undefined>,
    colorMap: Map<string, string>,
    sortedNodes: MutGraphNode<Commit | GroupedNode, undefined>[],
) {
    
    const circles = g.append("g")
        .selectAll("circle")
        .data(sortedNodes)
        .enter()
        .append("circle")
        .attr("r", c.NODE_RADIUS)
        .style("cursor", "pointer")
        .each(function(d) {
            const sel = (this as SVGCircleElement);
            select(sel)
                .attr("cx", d.x ?? 0)
                .attr("cy", d.y ?? 0)
                .attr("fill", colorMap.get(d.data.repo) ?? "999");
        });

    return {circles};
}

/**
 * Draws a color legend for both views.
 * Will also draw a shape legend for Merged View.
 * The legend can be used to select by fork or select by commit type 
 */
export function drawLegends( 
    merged : boolean, 
    legend: Selection<BaseType, unknown, HTMLElement, undefined>, 
    colorMap: Map<string, string>,
    shapeColor: string,
    sortedNodes: MutGraphNode<Commit | GroupedNode, undefined>[],
    setSelectAll: React.Dispatch<React.SetStateAction<boolean>>,
    handle: (commitIds: string[]) => void,
    resetBrushing: () => void) {
        
    const colorLegend = legend.append("div").attr("id", "color-legend");

    for (const [repoName, colorValue] of colorMap.entries()) {
        const div = colorLegend
            .append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-right", "8px"); // small spacing between color items

        div
            .append("svg")
            .style("overflow", "visible")
            .attr("width", c.LEGEND_SIZE)
            .attr("height", c.LEGEND_SIZE)
            .append("circle")
            .attr("cx", c.LEGEND_SIZE / 2)
            .attr("cy", c.LEGEND_SIZE / 2)
            .attr("r", c.LEGEND_SIZE / 2)
            .style("cursor", "pointer")
            .on("click", function() { // selection logic on click
                const selected = sortedNodes.filter(node => node.data.repo === repoName)
                    .flatMap((node) =>
                        merged
                            ? (node as MutGraphNode<GroupedNode, unknown>).data.nodes
                            : [node.data.id]
                    );
                setSelectAll(false); // overwrite selectAll if enabled
                resetBrushing(); // overwrite brushing if enabled
                handle(selected); // pass the data to the hook
            }) 
            .attr("fill", colorValue);

        div
            .append("text")
            .text(repoName)
            .style("margin-left", c.LEGEND_TEXT_MARGIN);
    };

    if (merged) {
        const shapeLegend = legend
            .append("div")
            .attr("id", "shape-legend")
            // spacing to the right of color legend
            .style("margin-left", c.LEGENDS_SPACING); 

        const shapeLegendData = [
            { label: "Fork/Merge parent", shape: symbolCircle },
            { label: "Commit(s) without deviations", shape: symbolSquare },
            { label: "Merge commit" , shape: symbolTriangle },
        ];

        for (const {label, shape} of shapeLegendData) {
            const item = shapeLegend
                .append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("margin-right", "8px")
                .style("margin-bottom", "4px");

            item
                .append("svg")
                .attr("width", c.LEGEND_SIZE)
                .attr("height", c.LEGEND_SIZE)
                .style("flex-shrink", "0")
                .style("cursor", "pointer")
                .append("path")
                .attr("transform", `translate(${c.LEGEND_SIZE / 2}, ${c.LEGEND_SIZE / 2})`)
                .attr("d",symbol().type(shape).size(c.LEGEND_SYMBOL_SIZE))
                // Selects all nodes from a fork
                .on("click", function() {
                    // Use the branch to distinguish the commit type
                    const branch = (label === "Fork/Merge parent" ? "forkParent" :
                        label === "Merge commit" ? "merge" : "default");
                    // Reuse the filterByBranch function to filter by node type
                    const nodes = filterByBranch(sortedNodes as MutGraphNode<GroupedNode, undefined>[], branch);
                    // We need the IDs of the selected nodes rather than the node itself
                    const selected = nodes.flatMap(node => node.data.nodes);
                    setSelectAll(false); // overwrite selectAll if enabled
                    resetBrushing(); // overwrite brushing if enables
                    handle(selected); // pass the data to the hook
                }) 
                .attr("fill", shapeColor);

            item
                .append("text")
                .text(label)
                .style("margin-left", c.LEGEND_TEXT_MARGIN);
        };
    }
}

