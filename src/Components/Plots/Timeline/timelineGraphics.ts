import { Selection, BaseType } from "d3-selection";
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

export function drawLanes(
    g: Selection<SVGGElement, unknown, null, undefined>,
    lanes: Record<string, { minX: number; maxX: number }>,
    svgWidth: number,
    isDarkMode: boolean,
    darkColor: string,
    lightColor: string
) {
    const backgrounds = g.append("g").attr("class", "repo-backgrounds");
  
    Object.entries(lanes).forEach(([repo, { minX, maxX }], i) => {
        const laneColor = i % 2 === 0 ? darkColor : lightColor;
  
        backgrounds.append("rect")
            .attr("x", -c.MARGIN.left)
            .attr("y", minX - c.NODE_RADIUS)
            .attr("width", svgWidth)
            .attr("height", maxX - minX + c.NODE_RADIUS * 2)
            .attr("fill", laneColor)
            .attr("opacity", 0.4);
  
        backgrounds.append("text")
            .attr("x", -c.MARGIN.left + 5)
            .attr("y", (minX - c.NODE_RADIUS) + (maxX - minX + c.NODE_RADIUS * 2) / 2)
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle")
            .text(repo.split("/")[0])
            .attr("fill", `${isDarkMode ? "#fff" : "#000"}`);
    });
}

export function drawTimelineMarkers(
    g: Selection<SVGGElement, unknown, null, undefined>,
    sortedNodes: GraphNode<Commit | GroupedNode, unknown>[],
    totalHeight: number,
    colorMarker: string
) {
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
            // always draw the vertical line
            monthGroup.append("line")
                .attr("x1", labelX)
                .attr("x2", labelX)
                .attr("y1", 0)
                .attr("y2", totalHeight - 10)
                .attr("stroke", colorMarker)
                .attr("stroke-dasharray", "3,3");
    
            // only add text label if we have enough space
            if (Math.abs(labelX - lastLabelX) > c.MIN_LABEL_SPACING) {
                const isNewYear = currentYear !== lastYear;
                const labelText = isNewYear 
                    ? `${currentMonth} ${currentYear}`
                    : currentMonth;
    
                monthGroup.append("text")
                    .attr("x", labelX)
                    .attr("y", totalHeight + c.MARGIN.bottom - 5)
                    .attr("font-size", 12)
                    .style("text-anchor", "middle")
                    .style("fill", "black")
                    .text(labelText);
    
                lastLabelX = labelX;
            }
    
            lastMonth = currentMonth;
            lastYear = currentYear;
        }
    }
}

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

export function drawMergedNodes(
    g: Selection<SVGGElement, unknown, null, undefined>,
    colorMap: Map<string, string>,
    mergedNodes: MutGraphNode<GroupedNode, undefined>[]) {
    
    const mergedCircles = mergedNodes.filter(node => node.data.branch === "forkParent");
    const circles = g.append("g")
        .selectAll("circle")
        .data(mergedCircles)
        .enter()
        .append("circle")
        .attr("cx", d => d.x ?? 0)
        .attr("cy", d => d.y ?? 0)
        .attr("r", c.NODE_RADIUS)
        .attr("fill", d => colorMap.get(d.data.repo) ?? "999");

    const mergedSquares = mergedNodes.filter(node => node.data.branch === "default");
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

    const mergedTriangles = mergedNodes.filter(node => node.data.branch === "merge");
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
        .attr("fill", d => colorMap.get(d.data.repo) ?? "999");

    return {circles, squares, triangles};
}

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
        .attr("cx", d => d.x ?? 0)
        .attr("cy", d => d.y ?? 0)
        .attr("r", c.NODE_RADIUS)
        .attr("fill", d => colorMap.get(d.data.repo) ?? "999");

    return {circles};
}

export function drawLegends( 
    merged : boolean, 
    legend: Selection<BaseType, unknown, HTMLElement, undefined>, 
    colorMap: Map<string, string>,
    shapeColor: string) {
        
    const colorLegend = legend.append("div").attr("id", "color-legend");

    colorMap.forEach((colorValue, repoName) => {
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
            .attr("fill", colorValue);

        div
            .append("text")
            .text(repoName)
            .style("margin-left", c.LEGEND_TEXT_MARGIN);
    });

    if (merged) {
        const shapeLegend = legend
            .append("div")
            .attr("id", "shape-legend")
            .style("margin-left", c.LEGENDS_SPACING); // spacing to the right of color legend

        const shapeLegendData = [
            { label: "Fork parent", shape: symbolCircle },
            { label: "Commit(s) without deviations", shape: symbolSquare },
            { label: "Merge commit" , shape: symbolTriangle },
        ];

        shapeLegendData.forEach(({ label, shape }) => {
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
                .append("path")
                .attr("transform", `translate(${c.LEGEND_SIZE / 2}, ${c.LEGEND_SIZE / 2})`)
                .attr(
                    "d",
                    symbol().type(shape).size(c.LEGEND_SYMBOL_SIZE)
                )
                .attr("fill", shapeColor);

            item
                .append("text")
                .text(label)
                .style("margin-left", c.LEGEND_TEXT_MARGIN);
        });
    }
}

