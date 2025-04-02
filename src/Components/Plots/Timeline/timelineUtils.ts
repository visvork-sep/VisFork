import { interpolateRainbow } from "d3-scale-chromatic";
import { min, max } from "d3-array";
import { Selection, BaseType } from "d3-selection";
import { timeFormat } from "d3-time-format";
import { symbol, symbolCircle, symbolSquare, symbolTriangle } from "d3-shape";

import {
    GraphNode,
    MutGraphNode,
    MutGraphLink,
    Rank,
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
 * Type used for brushing selection
 */
export type NodeSelection = Selection<
    SVGCircleElement | SVGPolygonElement,
    MutGraphNode<Commit | GroupedNode, undefined>,
    SVGGElement,
    unknown
>;

/**
 * Build a Map<repo, color> using d3.interpolateRainbow.
 * Used to color-code nodes belonging to different forks.
 */
export function buildRepoColorMap(commits: Commit[]): Map<string, string> {
    const repos = Array.from(new Set(commits.map(c => c.repo)));
    const map = new Map<string, string>();
  
    repos.forEach((repo, i) => {
        map.set(repo, interpolateRainbow(i / repos.length));
    });
  
    return map;
}


/**
 * Custom d3-dag Rank acessor, orders commits by date
 * (earlier commits come first) 
 */
export const dateRankOperator: Rank<Commit | GroupedNode, unknown> = (
    node: GraphNode<Commit, unknown>
): number => {
    const date = new Date(node.data.date);
    return date.getTime();
};

export function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const item of items) {
        const key = keyFn(item);
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key)?.push(item);
    }
    return map;
}

/**
 * Overwrites y-coordinates to place commits from different
 * forks in their own unique lanes.
 * 
 * @param nodes the data as nodes returned by d3dag builder
 * 
 */
export function assignUniqueLanes(
    nodes: Iterable<GraphNode<Commit | GroupedNode, unknown>>
) {
    // group nodes by repo.
    const repoGroups = groupBy(Array.from(nodes), (node) => node.data.repo);

    // sort repos by the date of their earliest commit.
    const repoOrder = Array.from(repoGroups.entries()).sort((a, b) => {
        const earliestA =
                min(a[1].map((n) => new Date(n.data.date).getTime())) || 0;
        const earliestB =
                min(b[1].map((n) => new Date(n.data.date).getTime())) || 0;
        return earliestA - earliestB;
    });

    let cumulativeOffset = c.MARGIN.top; // leaves space on top
    const lanes: Record<string, { minX: number; maxX: number; }> = {};

    // shift nodes for each repo
    repoOrder.forEach(([repo, repoNodes]) => {
        const minX = min(repoNodes, (n) => n.y) || 0;
        const maxX = max(repoNodes, (n) => n.y) || 0;
        const height = maxX - minX;
        repoNodes.forEach((node) => {
            node.y = cumulativeOffset + (node.y - minX);
        });
        lanes[repo] = { minX: cumulativeOffset, maxX: cumulativeOffset + height };
        cumulativeOffset += height + c.NODE_RADIUS * 2;
    });

    return { lanes, totalHeight: cumulativeOffset };
}

function topologicalSort(commits: Commit[]): Commit[] {
    const sortedCommits: Commit[] = [];
    const visited = new Set<string>();

    const commitMap = new Map(commits.map(commit => [commit.id, commit]));

    function visit(commit: Commit) {
        if (!visited.has(commit.id)) {
            visited.add(commit.id);
            for (const parentId of commit.parentIds) {
                const parentCommit = commitMap.get(parentId);
                if (parentCommit) { // if a parent commit exists
                    visit(parentCommit);
                }
            }
            sortedCommits.push(commit);
        }
    }

    // sort commits initially by date
    const dateSortedCommits = commits.slice().sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // topological sorting
    for (const commit of dateSortedCommits) {
        visit(commit);
    }

    return sortedCommits;
}

export function groupNodes(data: Commit[]): GroupedNode[] {
    const sortedCommits = topologicalSort(data);

    const groupedNodes: GroupedNode[] = [];
    const commitLookup = new Map<string, Commit>();

    const forkParentIds = new Set<string>();
    const mergeNodes = new Set<string>();

    // find from which commits a fork pulls (fork parents) and which are merge nodes
    sortedCommits.forEach(commit => {
        commitLookup.set(commit.id, commit);
        // fork parents have a child within a different repo
        commit.parentIds.forEach(parentId => {
            const parentCommit = commitLookup.get(parentId);
            if (parentCommit && parentCommit.repo !== commit.repo) {
                forkParentIds.add(parentId);
            }
        });
        if (
        // merge nodes have at least two parents, one from different repo
            commit.parentIds.length >= 2 &&
                commit.parentIds.some(parentId => {
                    const parentCommit = commitLookup.get(parentId);
                    return parentCommit !== undefined && parentCommit.repo !== commit.repo;
                })
        ) {
            mergeNodes.add(commit.id);
        }
    });

    const repoGroups = groupBy(Array.from(sortedCommits), (commit) => commit.repo);
    let counter = 0; // used for setting IDs

    function findParent(node: GroupedNode) {
        const firstCommit = commitLookup.get(node.nodes[0]);
        if (firstCommit) {
            firstCommit.parentIds.forEach(parentId => {
                const parentGroupId = commitIdToGroupId.get(parentId);
                if (parentGroupId) {
                    node.parentIds.push(parentGroupId);
                }
            });
        }
    }

    function createGroup(nodes: Commit[], i: number, lastBreak: number) {
        if (lastBreak < i) {
            const mergedGroup: GroupedNode = {
                id: `${counter}`,
                parentIds: [],
                repo: nodes[lastBreak].repo,
                branch: "default",
                date: nodes[lastBreak].date,
                url: "", // default nodes are not clickable
                nodes: nodes.slice(lastBreak, i).map(node => node.id) || [],
                end_date: nodes[i - 1].date,
            };
            groupedNodes.push(mergedGroup);
        }

        const type = mergeNodes.has(nodes[i].id) ? "merge" : "forkParent";
        const specialNode: GroupedNode = {
            id: `Special ${counter}`,
            parentIds: [],
            repo: nodes[i].repo,
            branch: type,
            date: nodes[i].date,
            url: nodes[i].url,
            nodes: [nodes[i].id],
            end_date: nodes[i].date,
        };
        groupedNodes.push(specialNode);
        counter++;
    }

    repoGroups.forEach((nodes, repo) => {
        let lastBreak = 0;
        for (let i = 0; i < nodes.length; i++) {
            if (mergeNodes.has(nodes[i].id) || forkParentIds.has(nodes[i].id)) {
                createGroup(nodes, i, lastBreak);
                lastBreak = i + 1;
            }
        }
        if (lastBreak < nodes.length) {
            const finalGroupNodeIds = nodes.slice(lastBreak).map(node => node.id);
            const finalGroup: GroupedNode = {
                id: `${counter}`,
                parentIds: [],
                repo: repo,
                branch: "default",
                date: nodes[lastBreak].date,
                url: "", // default nodes are not clickable
                nodes: finalGroupNodeIds,
                end_date: nodes[nodes.length - 1].date,
            };
            counter++;
            groupedNodes.push(finalGroup);
        }
    });

    // used to find parents
    const commitIdToGroupId = new Map<string, string>();
    groupedNodes.forEach(group => {
        group.nodes.forEach(commitId => commitIdToGroupId.set(commitId, group.id));
    });

    // assign parents to groups
    for (const mnode of groupedNodes) {
        findParent(mnode);
    }

    console.log(groupedNodes);

    return groupedNodes;
}

export function drawLanes(
    g: Selection<SVGGElement, unknown, null, undefined>,
    lanes: Record<string, { minX: number; maxX: number }>,
    svgWidth: number
) {
    const backgrounds = g.append("g").attr("class", "repo-backgrounds");
  
    Object.entries(lanes).forEach(([repo, { minX, maxX }], i) => {
        const laneColor = i % 2 === 0 ? "#eef" : "#fff";
  
        backgrounds.append("rect")
            .attr("x", -c.MARGIN.left)
            .attr("y", minX - c.NODE_RADIUS)
            .attr("width", svgWidth)
            .attr("height", maxX - minX + c.NODE_RADIUS * 2)
            .attr("fill", laneColor)
            .attr("stroke", "#dde")
            .attr("stroke-width", "1")
            .attr("opacity", 0.3);
  
        backgrounds.append("text")
            .attr("x", -c.MARGIN.left + 5)
            .attr("y", (minX - c.NODE_RADIUS) + (maxX - minX + c.NODE_RADIUS * 2) / 2)
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle")
            .text(repo.split("/")[0])
            .attr("fill", "#333");
    });
}

export function drawTimelineMarkers(
    g: Selection<SVGGElement, unknown, null, undefined>,
    sortedNodes: GraphNode<Commit | GroupedNode, unknown>[],
    totalHeight: number,
    merged: boolean
) {
    if (!merged) {
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
                    .attr("stroke", "gray")
                    .attr("stroke-dasharray", "3,3");
        
                // only add text label if we have enough space
                if (Math.abs(labelX - lastLabelX) > c.MIN_LABEL_SPACING) {
                    const isNewYear = currentYear !== lastYear;
                    const labelText = isNewYear 
                        ? `${currentMonth} ${currentYear}`
                        : currentMonth;
        
                    monthGroup.append("text")
                        .attr("x", labelX)
                        .attr("y", totalHeight + c.MARGIN.bottom)
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
    colorMap: Map<string, string>) {
        
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
                .attr("fill", "#555");

            item
                .append("text")
                .text(label)
                .style("margin-left", c.LEGEND_TEXT_MARGIN);
        });
    }
}

export const onHover = (e: React.MouseEvent<HTMLButtonElement>) => 
    e.currentTarget.style.backgroundColor = "#eef";
export const onLeave = (e: React.MouseEvent<HTMLButtonElement>) => 
    e.currentTarget.style.backgroundColor = "transparent";


    
