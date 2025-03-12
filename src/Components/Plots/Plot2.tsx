import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import * as d3dag from "d3-dag";

interface Commit {
  id: string;
  parentIds: string[];
  repo: string;
  branch_name:string;
  date: string;
  url: string;
}

interface DagProps {
  data: Commit[];
  width: number;
  maxHeight: number;
}

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

const CommitTimeline: React.FC<DagProps> = ({ data, width, maxHeight }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const colorMap = new Map();
    const repoNames = new Set();
    data.forEach(item => {
        repoNames.add(item.repo);
    });
    for (const [i, repo] of [...repoNames].entries()) {
        colorMap.set(repo, d3.interpolateRainbow(i / repoNames.size));
    }

    const dateRankOperator: d3dag.Rank<Commit, unknown> = (
        node: d3dag.GraphNode<Commit, unknown>
    ): number => {
        const date = new Date(node.data.date);
        return date.getTime();
    };

    // custom layout
    function adjustRepoXCoordinates(
        nodes: Iterable<d3dag.GraphNode<Commit, unknown>>,
        repoGap = 20
    ) {
        // group nodes by repo 
        const repoNodes = new Map<string, d3dag.GraphNode<Commit, unknown>[]>();
        for (const node of nodes) {
            const repo = node.data.repo;
            if (!repoNodes.has(repo)) {
                repoNodes.set(repo, []);
            }
            repoNodes.get(repo)?.push(node);
        }
      
        // sort repos by date of earliest commit
        const repoOrder = Array.from(repoNodes.entries()).sort((a, b) => {
            const aEarliest = d3.min(a[1].map(n => new Date(n.data.date).getTime())) || 0;
            const bEarliest = d3.min(b[1].map(n => new Date(n.data.date).getTime())) || 0;
            return aEarliest - bEarliest;
        });
      
        let cumulativeOffset = 20;
        // lanes information is used for the shading
        const lanes: Record<string, { minX: number, maxX: number }> = {};
      
        // shift repo nodes and and record the new boundaries
        for (const [repo, nodesArr] of repoOrder) {
            const minX = d3.min(nodesArr, n => n.x) || 0;
            const maxX = d3.max(nodesArr, n => n.x) || 0;
            const height = maxX - minX;
          
            for (const node of nodesArr) {
                node.x = cumulativeOffset + (node.x - minX);
            }
          
            lanes[repo] = { minX: cumulativeOffset, maxX: cumulativeOffset + height };
            cumulativeOffset += height + repoGap;
        }
      
        return { lanes, totalHeight: cumulativeOffset };
    }

    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        // clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();

        const builder = d3dag.graphStratify();
        const dag = builder(data);

        const layout = d3dag.grid()
            .nodeSize(NODE_SIZE)
            .gap([5, 5]) 
            .rank(dateRankOperator)
            .lane(d3dag.laneGreedy().topDown(true).compressed(false));

        // initial dimensions, height will be overwritten
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
        const {lanes, totalHeight} = adjustRepoXCoordinates(sortedNodes, LANE_GAP);
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
        
        let brushSelection: any = []; // Type assertion

        const brushStart = (event: d3.D3BrushEvent<unknown>) => {
            if (event.sourceEvent && event.sourceEvent.type !== "end") {
                brushSelection = [];
            }
        };

        const brushed = (event: d3.D3BrushEvent<unknown>) => {
            if (!event.selection) return;

            const [[x0, y0], [x1, y1]] = event.selection as [[number, number], [number, number]];

            const nodesArray = Array.from(sortedNodes);

            // Get nodes and filter based on selection
            const selectedNodes = nodesArray.filter((node) => {
                const x = node.y + NODE_RADIUS; // Swapped x and y because graph is horizontal
                const y = node.x + NODE_RADIUS;
                return x >= x0 && x <= x1 && y >= y0 && y <= y1;
            });

            console.log("Selected Nodes:", selectedNodes);
        };        
        

        function brushEnd(event: d3.D3BrushEvent<unknown>) {
            if (!event.selection) return; // Exit if no selection
        
            if (brushSelection) {
                const [x0, y0] = brushSelection[0];
                const [x1, y1] = brushSelection[1];

                const nodesArray = Array.from(dag.nodes());
                console.log(nodesArray);
        
                // Get nodes and filter based on selection
                const selectedNodes = nodesArray.filter((node) => {
                    const x = node.y + NODE_RADIUS; // Swapped x and y because graph is horizontal
                    const y = node.x + NODE_RADIUS;
                    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
                });

                console.log(selectedNodes);
            }
        }
        
        const brush = d3
            .brush()
            .on("start", brushStart)
            .on("brush", brushed)
            .on("end", brushEnd);

        g.call(brush);

        // create edges 
        g.append("g")
            .selectAll("path")
            .data(dag.links())
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", EDGE_STROKE_COLOR)
            .attr("stroke-width", EDGE_WIDTH)
            .attr("d", (d) => {
                // Drawing the edges. Makes curves at branches and merges.
                // TODO: change to work better for vertical up branching
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
            });

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

        // create nodes
        g.append("g")
            .selectAll("circle")
            .data(dag.nodes())
            .enter()
            .append("circle")
            .attr("cx", (d) => d.y ?? 0) // def value 0 to avoid eslint complaining
            .attr("cy", (d) => d.x ?? 0) // swap x and y to make the graph horizontal
            .attr("r", NODE_RADIUS)
            .attr("fill", (d) => colorMap.get(d.data.repo))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(TOOLTIP_MOUSEOVER_DUR).style("opacity", 0.9);
                tooltip.html(
                    `<strong>Commit</strong>: ${d.data.id}<br>
                    <strong>Repo</strong>: ${d.data.repo}<br>
                    <strong>Branch</strong>: ${d.data.branch_name}<br>
                    <strong>Date</strong>: ${d.data.date.toLocaleString()}`
                )
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
            });;
            
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
            <div style={{ 
                width: width,
                maxHeight: maxHeight,
                overflow: "auto", 
                whiteSpace: "normal"
            }}>
                <svg ref={svgRef}> {}
                    {}
                </svg>
            </div>
            <div id="dag-legends">{/* Legends */}</div>
        </>
    );
};

export default CommitTimeline;
