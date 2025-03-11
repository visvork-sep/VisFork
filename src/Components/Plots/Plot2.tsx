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
    const colorMap = new Map();
    const repoNames = new Set();
    data.forEach(item => {
        repoNames.add(item.repo);
    });
    for (const [i, repo] of [...repoNames].entries()) {
        colorMap.set(repo, d3.interpolateRainbow(i / repoNames.size));
    }
    // const svgWidth = 2000; // These values have been made very big to demonstrate the scrolling
    // const svgHeight = 2000; 
    
    const dateRankOperator: d3dag.Rank<Commit, unknown> = (
        node: d3dag.GraphNode<Commit, unknown>
    ): number => {
        const date = new Date(node.data.date);
        return date.getTime();
    };


    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        // clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();

        const builder = d3dag.graphStratify();
        const dag = builder(data);
        
        const nodeRadius = 6;

        // TO-DO: fix layout, see helper functions in the d3-dag notebook
        const nodeSize = [nodeRadius * 2, nodeRadius * 2] as const;
        const shape = d3dag.tweakShape(nodeSize, d3dag.shapeEllipse);
        const layout = d3dag.grid()
            .nodeSize(nodeSize)
            .gap([15, 4]) // def value placeholder, tweak for larger spacing
            .tweaks([shape, d3dag.tweakGrid([nodeRadius, nodeRadius])])
            .rank(dateRankOperator)
            .lane(d3dag.laneGreedy().topDown(true));
        
        const{width, height} = layout(dag); 

        const svg = d3.select(svgRef.current)
            .attr("width", height) // note: swapped on purpose 
            .attr("height", width);

        const curveSize = 15;

        // create edges 
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
            .attr("fill", (d) => colorMap.get(d.data.repo))
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
                .attr("width", 10)
                .attr("height", 10)
                .append("circle")
                .attr("cx", 5)
                .attr("cy", 5)
                .attr("r", 5)
                .attr("fill", value);
            // append a text to this div
            div.append("text")
                .text(key)
                .style("display", "inline-block")
                .style("font-size", "1em")
                .style("margin-left", "10px")
                .style("margin-top", "0px");
        });
        
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
            <div id="dag-legends">{/* Legends */}</div>
        </div>
    );
};

export default CommitTimeline;
