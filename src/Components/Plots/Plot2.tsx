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


    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        // clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();

        const builder = d3dag.graphStratify();
        const dag = builder(data);
        
        const nodeRadius = 6;

        // TODO: fix layout, see helper functions in the d3-dag notebook
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

        // create edges 
        svg.append("g")
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
