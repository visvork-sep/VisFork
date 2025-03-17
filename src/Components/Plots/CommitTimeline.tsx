import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import * as d3dag from "d3-dag";

interface Commit {
  id: string; // hash of commit
  parentIds: string[]; // hashes of parent commits
  repo: string; // repo name the commit belongs to
  branch_name:string; // branch the commit belongs to
  date: string; // date of commit
  url: string; // url pointing to github page of commit
}

interface DagProps {
  data: Commit[];
  c_width: number;
  c_height: number;
  merged: boolean;
  defaultBranches: Record<string, string>;
}

interface MergedNode extends Commit {
    nodes: string[]
    end_date: string; 
}

type NodeSelection = d3.Selection<
  SVGCircleElement | SVGPolygonElement,
  d3dag.MutGraphNode<Commit | MergedNode, undefined>,
  SVGGElement,
  unknown
>;

const NODE_RADIUS = 8;
const MARGIN = { top: 10, right: 0, bottom: 10, left: 150 };
const NODE_SIZE = [NODE_RADIUS * 2, NODE_RADIUS * 2] as const;
const LANE_GAP = NODE_RADIUS * 2;
const CURVE_SIZE = 15;
const EDGE_WIDTH = 2;
const TOOLTIP_BG_COLOR = "#f4f4f4";
const TOOLTIP_BORDER = "1px solid #ccc";
const TOOLTIP_PADDING = "8px";
const TOOLTIP_BORDER_RADIUS = "4px";
const TOOLTIP_FONT = "var(--text-body-shorthand-medium)";
const TOOLTIP_MOUSEOVER_DUR = 200;
const TOOLTIP_MOUSEOUT_DUR = 500;
const LEGEND_DOT_SIZE = 10;
const LEGEND_TEXT_MARGIN = "10px";
const EDGE_STROKE_COLOR = "#999";
const DATE_LABEL_HEIGHT = 21;

const CommitTimeline: React.FC<DagProps> = ({ data, c_width: c_width, c_height, merged = false, defaultBranches }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const colorMap = new Map();
    const repoNames = new Set();
    data.forEach(item => {
        repoNames.add(item.repo);
    });
    for (const [i, repo] of [...repoNames].entries()) {
        colorMap.set(repo, d3.interpolateRainbow(i / repoNames.size));
    }

    const dateRankOperator: d3dag.Rank<Commit | MergedNode, unknown> = (
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
          
    // custom branches layout
    function assignUniqueBranches(
        nodes: d3dag.GraphNode<Commit | MergedNode, unknown>[]
    ): void {
        // group nodes by repo
        const repoGroups = groupBy(nodes, (node) => node.data.repo);
          
        repoGroups.forEach((repoNodes) => {
            // get distinct x assignments within the repo
            const distinctX = Array.from(new Set(repoNodes.map((n) => n.x))).sort(
                (a, b) => a - b
            );
          
            // group nodes by branch
            const branchGroups = groupBy(repoNodes, (node) => node.data.branch_name);
          
            // only reassign if we have enough unique x values.
            if (branchGroups.size == distinctX.length) {
                // sort branches by the earliest commit date
                const sortedBranches = Array.from(branchGroups.entries()).sort(
                    (a, b) => {
                        const earliestA = Math.min(
                            ...a[1].map((n) => new Date(n.data.date).getTime())
                        );
                        const earliestB = Math.min(
                            ...b[1].map((n) => new Date(n.data.date).getTime())
                        );
                        return earliestA - earliestB;
                    }
                );
                // assign each branch the corresponding distinct x value.
                sortedBranches.forEach((entry, index) => {
                    const newX = distinctX[index];
                    entry[1].forEach((node) => {
                        node.x = newX;
                    });
                });
            }
        });
    }
    
    // custom lanes layout
    function assignUniqueLanes(
        nodes: Iterable<d3dag.GraphNode<Commit | MergedNode, unknown>>,
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
        const lanes: Record<string, { minX: number; maxX: number }> = {};
          
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

    function groupNodes(data: Commit[]): MergedNode[] {
        const sorted = topologicalSort(data); 
        
        const mergedNodes: MergedNode[] = [];
        let currentGroupStart = 0;
        
        for (let i = 1; i <= sorted.length; i++) {
            const prevCommit = sorted[i - 1];
            const commit = sorted[i];
          
            // when reaching the end or when branch/repo changes, process the current group
            if (
                i === sorted.length ||
                commit.branch_name !== prevCommit.branch_name ||
                commit.repo !== prevCommit.repo
            ) {
            // group all commits from currentGroupStart to i-1
                const group = sorted.slice(currentGroupStart, i);
                const firstCommit = group[0];
                const lastCommit = group[group.length - 1];
            
                // see if there's any merged node with the same branch and repo
                let candidate: MergedNode | null = null;
                for (const mnode of mergedNodes) {
                    if (
                        mnode.branch_name === firstCommit.branch_name &&
                        mnode.repo === firstCommit.repo
                    ) {
                        candidate = mnode;
                        break;
                    }
                }
            
                if (candidate) {
                    candidate.nodes.push(...group.map(c => c.id));
                    candidate.end_date = lastCommit.date;

                } else {
                    const newParentIds: string[] = [];
                    for (const parentId of firstCommit.parentIds) {
                        for (const mnode of mergedNodes) {
                            if (mnode.nodes.includes(parentId) && !newParentIds.includes(mnode.id)) {
                                newParentIds.push(mnode.id);
                            }
                        }
                    }
            
                    const newMerged: MergedNode = {
                        id: `${firstCommit.repo} - ${firstCommit.branch_name}`, 
                        parentIds: newParentIds,
                        repo: firstCommit.repo,
                        branch_name: firstCommit.branch_name,
                        date: firstCommit.date,
                        url: firstCommit.url,
                        nodes: group.map(c => c.id),
                        end_date: lastCommit.date,
                    };
            
                    mergedNodes.push(newMerged);
                }
            
                currentGroupStart = i;
            }
        }
        
        return mergedNodes;
    }

    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        // clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();

        const builder = d3dag.graphStratify();
        let dag : d3dag.MutGraph<Commit | MergedNode, undefined> | null = null; 
        try {
            dag = builder(merged ? groupNodes(data) as MergedNode[] : data as Commit[]); 
        } catch (error) {
            console.error("Failed to build Commit Timeline: ", error);
            return;
        }
        
        const layout = d3dag.grid()
            .nodeSize(NODE_SIZE)
            .gap([5, 5]) 
            .rank(dateRankOperator)
            .lane(d3dag.laneGreedy().topDown(true).compressed(false));

        // initial dimensions, width will be overwritten
        const{width, height} = layout(dag); 

        // swap intial width and height for horizontal layout
        const svg = d3.select(svgRef.current)
            .attr("width", height + MARGIN.left + MARGIN.right) 
            .attr("height", width + MARGIN.top + MARGIN.bottom);
        const g = svg.append("g")
            .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

        // sort nodes by date
        const sortedNodes = Array.from(dag.nodes()).sort((a, b) => {
            return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
        });

        // apply custom layout 
        assignUniqueBranches(sortedNodes); 
        const {lanes, totalHeight} = assignUniqueLanes(sortedNodes, LANE_GAP);
        // adjust height to custom layout
        d3.select(svgRef.current).attr("height", totalHeight + MARGIN.top + MARGIN.bottom); 

        // lane shading and author labels
        const backgrounds = g.append("g").attr("class", "repo-backgrounds");
        Object.entries(lanes).forEach(([repo, { minX, maxX }], i) => {
            const laneColor = i % 2 === 0 ? "#eef" : "#fff";
            backgrounds.append("rect")
                .attr("x", -MARGIN.left)
                .attr("y", minX - NODE_RADIUS)
                .attr("width", height + MARGIN.left + MARGIN.right)
                .attr("height", maxX - minX + LANE_GAP) 
                .attr("fill", laneColor)
                .attr("stroke","#dde")
                .attr("stroke-width", "1")
                .attr("opacity", 0.3);
    
            backgrounds.append("text")
                .attr("x", -MARGIN.left + 5)
                .attr("y", (minX - NODE_RADIUS) + (maxX - minX + LANE_GAP) / 2)
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

            for (const node of sortedNodes) {
                const currentDate = new Date(node.data.date);
                const currentMonth = formatMonth(currentDate);
                const currentYear = formatYear(currentDate);

                if (currentMonth !== lastMonth) {
                    monthGroup.append("line")
                        .attr("x1", node.y)
                        .attr("x2", node.y)
                        .attr("y1", 0)
                        .attr("y2", totalHeight - 10)
                        .attr("stroke", "gray")
                        .attr("stroke-dasharray", "3,3");

                    const isNewYear = (currentYear !== lastYear);
                    const labelText = isNewYear
                        ? `${currentMonth} ${currentYear}`
                        : currentMonth;

                    monthGroup.append("text")
                        .attr("x", node.y)
                        .attr("y", totalHeight + MARGIN.bottom -10)
                        .attr("font-size", 12)
                        .style("text-anchor", "middle")
                        .style("fill", "black")
                        .text(labelText);

                    lastMonth = currentMonth;
                    if (isNewYear) {
                        lastYear = currentYear;
                    }
                }
            }
        }
        
        
        let brushSelection: [[number, number], [number, number]] = [[0,0], [0,0]];

        const brushStart = (event: d3.D3BrushEvent<unknown>) => {
            if (event.sourceEvent && event.sourceEvent.type !== "end") {
                brushSelection = [[0,0], [0,0]];
            }
        };
        

        function brushEnd(event: d3.D3BrushEvent<unknown>) {
            if (event.selection === null) return; // exit if no selection
        
            brushSelection = event.selection as [[number, number], [number, number]];
            const [x0, y0] = brushSelection[0];
            const [x1, y1] = brushSelection[1];

            const nodesArray = Array.from(sortedNodes);
    
            const selectedNodes = nodesArray.filter((node) => {
                const x = node.y + NODE_RADIUS; // swapped x and y because graph is horizontal
                const y = node.x + NODE_RADIUS;
                return x >= x0 && x <= x1 && y >= y0 && y <= y1;
            });

            console.log("Selected Nodes:", selectedNodes);
        }
        
        const brush = d3
            .brush()
            .on("start", brushStart)
            .on("end", brushEnd);

        g.call(brush);

        function drawEdgeCurve(d: d3dag.MutGraphLink<Commit | MergedNode, undefined>) {
            // Drawing the edges. Makes curves at branches and merges.
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

        // get all nodes from the dag
        const allNodes = Array.from(sortedNodes);

        if (merged) {            const mergedNodes = allNodes as unknown as d3dag.MutGraphNode<MergedNode, undefined>[];
  
            const mergedCircles = mergedNodes.filter(node => node.data.nodes.length === 1);
            const circles = g.append("g")
                .selectAll("circle")
                .data(mergedCircles)
                .enter()
                .append("circle")
                .attr("cx", d => d.y ?? 0)
                .attr("cy", d => d.x ?? 0)
                .attr("r", NODE_RADIUS)
                .attr("fill", d => colorMap.get(d.data.repo));
  
            const mergedSquares = mergedNodes.filter(node => node.data.nodes.length > 1);
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

            applyToolTip(circles as NodeSelection);
            applyToolTip(squares as unknown as NodeSelection);

        } else {
            const regularCircles = allNodes.filter(node => node.data.branch_name !== defaultBranches[node.data.repo]);
            const regularTriangles = allNodes.filter(node => node.data.branch_name === defaultBranches[node.data.repo]);

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
                        <strong>Branch</strong>: ${commitData.branch_name}<br>
                        <strong>Date</strong>: ${commitData.date.toLocaleString()}
                        `;
                    } else {
                        // merged view
                        const mergedData = d.data as MergedNode;
                        content = `
                        <strong>Repo</strong>: ${mergedData.repo}<br>
                        <strong>Branch</strong>: ${mergedData.branch_name}<br>
                        <strong>Commits Count</strong>: ${mergedData.nodes.length}<br>
                        <strong>Date of First Commit</strong>: ${mergedData.date}<br>
                        <strong>Date of Last Commit</strong>: ${mergedData.end_date}
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
        const legend = d3.select("#dag-legends");
        legend.selectAll("div").remove();
        colorMap.forEach((value, key) => {
            const div = legend
                .append("div")
                .style("align-items", "center");
            // append a circle to this div
            div
                .append("svg")
                .style("overflow", "visible")
                .attr("width", LEGEND_DOT_SIZE)
                .attr("height", LEGEND_DOT_SIZE)
                .append("circle")
                .attr("cx", LEGEND_DOT_SIZE / 2)
                .attr("cy", LEGEND_DOT_SIZE / 2)
                .attr("r",  LEGEND_DOT_SIZE / 2)
                .attr("fill", value);
            // append a text to this div
            div.append("text")
                .text(key)
                .style("display", "inline-block")
                .style("margin-left", LEGEND_TEXT_MARGIN);
        });
        
        return () => {
            tooltip.remove();
        };

    }, [data]);

    return (
        <>
            <div
                style={{
                    width: c_width,
                    height: Math.min(
                        c_height,
                        (svgRef.current?.getBoundingClientRect().height ?? 0) + DATE_LABEL_HEIGHT
                    ),
                    overflow: "auto",
                    whiteSpace: "normal",
                    resize: "vertical",
                }}
            >
                <svg ref={svgRef}></svg>
            </div>
            <div id="dag-legends">{/* Legends */}</div>
        </>
    );
};

export default CommitTimeline;
