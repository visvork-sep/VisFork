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

const CommitTimeline: React.FC<DagProps> = ({ data, width, maxHeight }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    
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
        
        const nodeRadius = 8;
        const margin = { top: 10, right: 0, bottom: 10, left: 150 };

        const nodeSize = [nodeRadius * 2, nodeRadius * 2] as const;
        const laneGap = nodeRadius * 2;

        const layout = d3dag.grid()
            .nodeSize(nodeSize)
            .gap([5, 5]) 
            .rank(dateRankOperator)
            .lane(d3dag.laneGreedy().topDown(true).compressed(false));

        // initial dimensions, height will be overwritten
        const{width, height} = layout(dag); 

        // swap intial width and height for horizontal layout
        const svg = d3.select(svgRef.current)
            .attr("width", height + margin.left + margin.right) 
            .attr("height", width + margin.top + margin.bottom); 
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // color scale for each repository
        const colorScale = d3.scaleOrdinal(d3.schemeObservable10);

        // sort nodes by date
        const sortedNodes = Array.from(dag.nodes()).sort((a, b) => {
            return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
        });

        // apply custom layout 
        const {lanes, totalHeight} = adjustRepoXCoordinates(sortedNodes, laneGap);
        // adjust height to custom layout
        d3.select(svgRef.current).attr("height", totalHeight + margin.top + margin.bottom); 

        // lane shading and author labels
        const backgrounds = g.append("g").attr("class", "repo-backgrounds");
        Object.entries(lanes).forEach(([repo, { minX, maxX }], i) => {
            const laneColor = i % 2 === 0 ? "#eef" : "#fff";
            backgrounds.append("rect")
                .attr("x", -margin.left)
                .attr("y", minX - nodeRadius)
                .attr("width", height + margin.left + margin.right)
                .attr("height", maxX - minX + laneGap) 
                .attr("fill", laneColor)
                .attr("stroke","#dde")
                .attr("stroke-width", "1")
                .attr("opacity", 0.3);
    
            backgrounds.append("text")
                .attr("x", -margin.left + 5)
                .attr("y", (minX - nodeRadius) + (maxX - minX + laneGap) / 2)
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
                    .attr("x", node.y + (isNewYear ? 24 : 8))
                    .attr("y", totalHeight-margin.bottom + 10)
                    .attr("font-size", 12)
                    .style("text-anchor", "end")
                    .text(labelText);

                lastMonth = currentMonth;
                if (isNewYear) {
                    lastYear = currentYear;
                }
            }
        }

        // create edges 
        const curveSize = 12; 
        svg.append("g")
            .selectAll("path")
            .data(dag.links())
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "#999")
            .attr("stroke-width", 2)
            .attr("d", (d) => {
                // Drawing the edges. Makes curves at branches and merges.
                if (d.source.x < d.target.x) {
                    return `
                        M${d.source.y},${d.source.x}
                        L${d.source.y},${d.target.x - curveSize}
                        C${d.source.y},${d.target.x}
                        ${d.source.y},${d.target.x}
                        ${d.source.y + curveSize},${d.target.x}
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
                        L${d.target.y - curveSize},${d.source.x}
                        C${d.target.y},${d.source.x}
                        ${d.target.y},${d.source.x}
                        ${d.target.y},${d.source.x - curveSize}
                        L${d.target.y},${d.target.x}
                    `;
                }
            });

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#f4f4f4")
            .style("padding", "8px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("font", "var(--text-body-shorthand-medium)");

        // create nodes
        svg.append("g")
            .selectAll("circle")
            .data(dag.nodes())
            .enter()
            .append("circle")
            .attr("cx", (d) => d.y ?? 0) // def value 0 to avoid eslint complaining
            .attr("cy", (d) => d.x ?? 0) // swap x and y to make the graph horizontal
            .attr("r", nodeRadius)
            .attr("fill", (d) => colorScale(d.data.repo))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
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
                tooltip.transition().duration(500).style("opacity", 0);
            })
            .on("click", (_event, d) => {
                window.open(d.data.url);
            });;
        
        return () => {
            tooltip.remove();
        };

    }, [data]);

    return (
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
    );
};

export default CommitTimeline;
