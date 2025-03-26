import {useRef, useEffect, useState, useMemo} from "react";
import * as d3 from "d3";
import * as d3dag from "d3-dag";

import { TimelineProps, TimelineDetails as Commit } from "@VisInterfaces/TimelineData";

interface GroupedNode extends Commit {
    nodes: string[];
    end_date: string;
}

type NodeSelection = d3.Selection<
    SVGCircleElement | SVGPolygonElement,
    d3dag.MutGraphNode<Commit | GroupedNode, undefined>,
    SVGGElement,
    unknown
>;

//nodes
const NODE_RADIUS = 8;
// edges
const EDGE_STROKE_COLOR = "#999";
const CURVE_SIZE = 15;
const EDGE_WIDTH = 2;
// tooltip
const TOOLTIP_BG_COLOR = "#f4f4f4";
const TOOLTIP_BORDER = "1px solid #ccc";
const TOOLTIP_PADDING = "8px";
const TOOLTIP_BORDER_RADIUS = "4px";
const TOOLTIP_FONT = "var(--text-body-shorthand-medium)";
const TOOLTIP_MOUSEOVER_DUR = 200;
const TOOLTIP_MOUSEOUT_DUR = 500;
// legends
const LEGEND_SIZE = 12;
const LEGEND_SYMBOL_SIZE = 60;
const LEGENDS_SPACING = "100px";
const LEGEND_TEXT_MARGIN = "10px";
// misc
const DATE_LABEL_HEIGHT = 21;
const MARGIN = { top: 10, right: 0, bottom: 10, left: 150 };
const MIN_LABEL_SPACING = 40; 
// buttons
const BUTTON_STYLE: React.CSSProperties = {
    width: "120px", height: "40px", padding: "5px 10px",
    cursor: "pointer", backgroundColor: "transparent",
    border: "2px solid #eef", display: "flex",
    alignItems: "center", justifyContent: "center",
    transition: "background-color 0.3s",
};
const onHover = (e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = "#eef";
const onLeave = (e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = "transparent";

function CommitTimeline({ commitData,
    c_width, c_height,
    defaultBranches,
    handleTimelineSelection }: TimelineProps) {

    const svgRef = useRef<SVGSVGElement>(null);
    const [merged, setMerged] = useState(false); // state for merged view
    const [selectAll, setSelectAll] = useState(false); // state for selection
    const colorMap = new Map();
    const repoNames = new Set();
    commitData.forEach(item => {
        repoNames.add(item.repo);
    });
    for (const [i, repo] of [...repoNames].entries()) {
        colorMap.set(repo, d3.interpolateRainbow(i / repoNames.size));
    }

    const dateRankOperator: d3dag.Rank<Commit | GroupedNode, unknown> = (
        node: d3dag.GraphNode<Commit, unknown>
    ): number => {
        const date = new Date(node.data.date);
        return date.getTime();
    };

    function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
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

    // custom lanes layout
    function assignUniqueLanes(
        nodes: Iterable<d3dag.GraphNode<Commit | GroupedNode, unknown>>,
        repoGap = 20
    ) {
        // group nodes by repo.
        const repoGroups = groupBy(Array.from(nodes), (node) => node.data.repo);

        // sort repos by the date of their earliest commit.
        const repoOrder = Array.from(repoGroups.entries()).sort((a, b) => {
            const earliestA =
                d3.min(a[1].map((n) => new Date(n.data.date).getTime())) || 0;
            const earliestB =
                d3.min(b[1].map((n) => new Date(n.data.date).getTime())) || 0;
            return earliestA - earliestB;
        });

        let cumulativeOffset = 20;
        const lanes: Record<string, { minX: number; maxX: number; }> = {};

        // shift nodes for each repo
        repoOrder.forEach(([repo, repoNodes]) => {
            const minX = d3.min(repoNodes, (n) => n.x) || 0;
            const maxX = d3.max(repoNodes, (n) => n.x) || 0;
            const height = maxX - minX;
            repoNodes.forEach((node) => {
                node.x = cumulativeOffset + (node.x - minX);
            });
            lanes[repo] = { minX: cumulativeOffset, maxX: cumulativeOffset + height };
            cumulativeOffset += height + repoGap;
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

    function groupNodes(data: Commit[]): GroupedNode[] {
        const sortedCommits = topologicalSort(data);

        const groupedNodes: GroupedNode[] = [];
        const commitLookup = new Map<string, Commit>();

        const forkParentIds = new Set<string>();
        const mergeNodes = new Set<string>();

        // find from which commits a fork spawns and which are merge nodes
        sortedCommits.forEach(commit => {
            commitLookup.set(commit.id, commit);
            // nodes from which a fork pulls have a child within a different repo
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
                    url: "",
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
                    url: "",
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

        return groupedNodes;
    }

    // precompute both views, update only when data changes
    const builder = d3dag.graphStratify();
    const dagMerged = useMemo(() => {
        try {
            return builder(groupNodes(commitData) as GroupedNode[]);
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
            .nodeSize([NODE_RADIUS * 2, NODE_RADIUS * 2])
            .gap([5, 5])
            .rank(dateRankOperator)
            .lane(d3dag.laneGreedy().topDown(true).compressed(false));

        // initial dimensions, width will be overwritten
        const { width, height } = layout(dag);

        // swap intial width and height for horizontal layout
        const svgWidth = Math.max(height + MARGIN.left + MARGIN.right, c_width ?? 0);
        const svg = d3.select(svgRef.current)
            .attr("width", svgWidth)
            .attr("height", width + MARGIN.top + MARGIN.bottom);
        const g = svg.append("g")
            .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

        // sort nodes by date
        const sortedNodes = Array.from(dag.nodes()).sort((a, b) => {
            return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
        });

        // apply custom layout 
        const { lanes, totalHeight } = assignUniqueLanes(sortedNodes, NODE_RADIUS * 2);
        // adjust height to custom layouts
        d3.select(svgRef.current).attr("height", totalHeight + MARGIN.top + MARGIN.bottom);

        //lane shading and author labels
        const backgrounds = g.append("g").attr("class", "repo-backgrounds");
        Object.entries(lanes).forEach(([repo, { minX, maxX }], i) => {
            const laneColor = i % 2 === 0 ? "#eef" : "#fff";
            backgrounds.append("rect")
                .attr("x", -MARGIN.left)
                .attr("y", minX - NODE_RADIUS)
                .attr("width", Math.max(height + MARGIN.left + MARGIN.right, c_width ?? 0))
                .attr("height", maxX - minX + NODE_RADIUS * 2)
                .attr("fill", laneColor)
                .attr("stroke", "#dde")
                .attr("stroke-width", "1")
                .attr("opacity", 0.3);

            backgrounds.append("text")
                .attr("x", -MARGIN.left + 5)
                .attr("y", (minX - NODE_RADIUS) + (maxX - minX + NODE_RADIUS * 2) / 2)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "middle")
                .text(repo.split("/")[0])
                .attr("fill", "#333");
        });

        // month/year labels
        if (!merged) {
            const formatMonth = d3.timeFormat("%b");
            const formatYear = d3.timeFormat("%Y");
            let lastMonth = "";
            let lastYear = "";

            const monthGroup = g.append("g").attr("class", "month-lines");
            let lastLabelX = -Infinity;

            for (const node of sortedNodes) {
                const currentDate = new Date(node.data.date);
                const currentMonth = formatMonth(currentDate);
                const currentYear = formatYear(currentDate);
                const labelX = node.y;

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
                    if (Math.abs(labelX - lastLabelX) > MIN_LABEL_SPACING) {
                        const isNewYear = currentYear !== lastYear;
                        const labelText = isNewYear 
                            ? `${currentMonth} ${currentYear}`
                            : currentMonth;

                        monthGroup.append("text")
                            .attr("x", labelX)
                            .attr("y", totalHeight + MARGIN.bottom - 10)
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

        // selection overlay for selectAll
        if (selectAll) {
            g.append("rect")
                .attr("class", "selection-overlay")
                .attr("x", 0).attr("y", MARGIN.top)
                .attr("width", svgWidth).attr("height", totalHeight - MARGIN.bottom - MARGIN.top)
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
                const x = node.y + NODE_RADIUS; // swapped x and y because graph is horizontal
                const y = node.x + NODE_RADIUS;
                return x >= x0 && x <= x1 && y >= y0 && y <= y1;
            })
                .flatMap(node =>
                    merged ? (node as d3dag.MutGraphNode<GroupedNode, unknown>).data.nodes : [node.data.id]);

            // FOR DATA LAYER TEAM: use selectedNodes to get array of selected commits' hashes 
            console.log("Selected Commits:", selectedCommits);
            handleTimelineSelection(selectedCommits);
        }

        const brush = d3
            .brush()
            .extent([
                [-MARGIN.left, 0],                      
                [svgWidth - MARGIN.left, totalHeight]   
            ])
            .on("start", brushStart)
            .on("end", brushEnd);

        function drawEdgeCurve(d: d3dag.MutGraphLink<Commit | GroupedNode, undefined>) {
            // makes curves at branches and merges
            if (d.source.x < d.target.x) {
                return `
                    M${d.source.y},${d.source.x}
                    L${d.source.y},${d.target.x - CURVE_SIZE}
                    C${d.source.y},${d.target.x}
                    ${d.source.y},${d.target.x}
                    ${d.source.y + CURVE_SIZE},${d.target.x}
                    L${d.target.y},${d.target.x}
                `;
            } else if (d.source.x === d.target.x) {
                return `
                    M${d.source.y},${d.source.x} 
                    L${d.target.y},${d.target.x} 
                `;
            } else {
                return `
                    M${d.source.y},${d.source.x}
                    L${d.target.y - CURVE_SIZE},${d.source.x}
                    C${d.target.y},${d.source.x}
                    ${d.target.y},${d.source.x}
                    ${d.target.y},${d.source.x - CURVE_SIZE}
                    L${d.target.y},${d.target.x}
                `;
            }
        }

        // create edges 
        g.append("g")
            .selectAll("path")
            .data(dag.links())
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", EDGE_STROKE_COLOR)
            .attr("stroke-width", EDGE_WIDTH)
            .attr("d", drawEdgeCurve);

        g.call(brush);

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", TOOLTIP_BG_COLOR)
            .style("padding", TOOLTIP_PADDING)
            .style("border", TOOLTIP_BORDER)
            .style("border-radius", TOOLTIP_BORDER_RADIUS)
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("font", TOOLTIP_FONT);

        if (merged) {
            const mergedNodes = sortedNodes as unknown as d3dag.MutGraphNode<GroupedNode, undefined>[];
            const mergedCircles = mergedNodes.filter(node => node.data.branch === "forkParent");
            const circles = g.append("g")
                .selectAll("circle")
                .data(mergedCircles)
                .enter()
                .append("circle")
                .attr("cx", d => d.y ?? 0)
                .attr("cy", d => d.x ?? 0)
                .attr("r", NODE_RADIUS)
                .attr("fill", d => colorMap.get(d.data.repo));

            const mergedSquares = mergedNodes.filter(node => node.data.branch === "default");
            const squares = g.append("g")
                .selectAll("rect")
                .data(mergedSquares)
                .enter()
                .append("rect")
                .attr("x", d => (d.y ?? 0) - NODE_RADIUS)
                .attr("y", d => (d.x ?? 0) - NODE_RADIUS)
                .attr("width", NODE_RADIUS * 2)
                .attr("height", NODE_RADIUS * 2)
                .attr("fill", d => colorMap.get(d.data.repo));

            const mergedTriangles = mergedNodes.filter(node => node.data.branch === "merge");
            const triangles = g.append("g")
                .selectAll("polygon")
                .data(mergedTriangles)
                .enter()
                .append("polygon")
                .attr("points", `0,-${NODE_RADIUS} ${NODE_RADIUS},${NODE_RADIUS} -${NODE_RADIUS},${NODE_RADIUS}`)
                .attr("transform", d => {
                    const x = d.y ?? 0;
                    const y = d.x ?? 0;
                    return `translate(${x},${y})`;
                })
                .attr("fill", d => colorMap.get(d.data.repo));

            applyToolTip(circles as NodeSelection);
            applyToolTip(triangles as NodeSelection);
            applyToolTip(squares as unknown as NodeSelection);

        } else {
            const regularCircles = sortedNodes.filter(node =>
                node.data.branch !== defaultBranches[node.data.repo]);
            const regularTriangles = sortedNodes.filter(node =>
                node.data.branch === defaultBranches[node.data.repo]);

            const circles = g.append("g")
                .selectAll("circle")
                .data(regularCircles as d3dag.MutGraphNode<Commit, undefined>[])
                .enter()
                .append("circle")
                .attr("cx", d => d.y ?? 0)
                .attr("cy", d => d.x ?? 0)
                .attr("r", NODE_RADIUS)
                .attr("fill", d => colorMap.get(d.data.repo));

            const triangles = g.append("g")
                .selectAll("polygon")
                .data(regularTriangles as d3dag.MutGraphNode<Commit, undefined>[])
                .enter()
                .append("polygon")
                .attr("points", `0,-${NODE_RADIUS} ${NODE_RADIUS},${NODE_RADIUS} -${NODE_RADIUS},${NODE_RADIUS}`)
                .attr("transform", d => {
                    const x = d.y ?? 0;
                    const y = d.x ?? 0;
                    return `translate(${x},${y})`;
                })
                .attr("fill", d => colorMap.get(d.data.repo));

            // apply tooltips
            applyToolTip(circles as NodeSelection);
            applyToolTip(triangles as NodeSelection);
        }

          
        function applyToolTip(selection: NodeSelection) {
            selection
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(TOOLTIP_MOUSEOVER_DUR).style("opacity", 0.9);
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
                    tooltip.transition().duration(TOOLTIP_MOUSEOUT_DUR).style("opacity", 0);
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
                .attr("width", LEGEND_SIZE)
                .attr("height", LEGEND_SIZE)
                .append("circle")
                .attr("cx", LEGEND_SIZE / 2)
                .attr("cy", LEGEND_SIZE / 2)
                .attr("r", LEGEND_SIZE / 2)
                .attr("fill", colorValue);

            div
                .append("text")
                .text(repoName)
                .style("margin-left", LEGEND_TEXT_MARGIN);
        });

        const shapeLegend = legend
            .append("div")
            .attr("id", "shape-legend")
            .style("margin-left", LEGENDS_SPACING); // spacing to the right of color legend

        // node shape meaning changes depending on type of view 
        const shapeLegendData = [
            { label: `${merged ? "Fork parent" : "Non-default branch"}`, shape: d3.symbolCircle },
            merged ? { label: "Default commits", shape: d3.symbolSquare } : null,
            { label: `${merged ? "Merge commit" : "Default branch"}`, shape: d3.symbolTriangle },
        ].filter((d): d is { label: string; shape: d3.SymbolType; } => d !== null);

        shapeLegendData.forEach(({ label, shape }) => {
            const item = shapeLegend
                .append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("margin-right", "8px")
                .style("margin-bottom", "4px");

            item
                .append("svg")
                .attr("width", LEGEND_SIZE)
                .attr("height", LEGEND_SIZE)
                .append("path")
                .attr("transform", `translate(${LEGEND_SIZE / 2}, ${LEGEND_SIZE / 2})`)
                .attr(
                    "d",
                    d3.symbol().type(shape).size(LEGEND_SYMBOL_SIZE)
                )
                .attr("fill", "#555");

            item
                .append("text")
                .text(label)
                .style("margin-left", LEGEND_TEXT_MARGIN);
        });

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
                        style={BUTTON_STYLE}
                        onMouseEnter={onHover}
                        onMouseLeave={onLeave}
                    >{merged? "Full View" : "Merged View"}</button>

                    <button
                        onClick={() => {
                            const selectedCommits = !selectAll
                                ? commitData.map(n => n.id) // select all
                                : []; //deselect all
                            handleTimelineSelection(!selectAll ? selectedCommits : []);
                            setSelectAll(!selectAll);
                        }}
                        style={BUTTON_STYLE}
                        onMouseEnter={onHover}
                        onMouseLeave={onLeave}
                    >{selectAll ? "Deselect All" : "Select All"}</button>

                </div>
            </div>

      
            {/* scrollable container for the SVG */}
            <div
                style={{
                    height: Math.min(
                        c_height,
                        (svgRef.current?.getBoundingClientRect().height ?? 0) + DATE_LABEL_HEIGHT
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
