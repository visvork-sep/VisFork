import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import * as d3dag from "d3-dag";

interface Commit {
  id: string;
  parentIds: string[];
  repo: string;
  date: Date;
}

export interface RawCommit {
  id: string;
  parentIds: string[];
  repo: string;
  date: string;
}

interface DagProps {
  data: RawCommit[];
  width: number;
  maxHeight: number;
}

const CommitTimeline: React.FC<DagProps> = ({ data, width, maxHeight }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const svgWidth = 2000; // These values have been made very big to demonstrate the scrolling
    const svgHeight = 2000; 


    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        // clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();

        // turn dates from the commit data into date objects for sorting
        const commits: Commit[] = data.map((commit) => ({
            ...commit,
            date: new Date(commit.date),
        }));

        // sort 
        commits.sort((a, b) => b.date.getTime() - a.date.getTime());

        // convert data for d3-dag
        const dagData = commits.map((d) => ({
            id: d.id,
            parentIds: d.parentIds,
            repo: d.repo,
            date: d.date,
        }));

        const builder = d3dag.graphStratify();
        const dag = builder(dagData);
        
        // TO-DO: fix layout, see helper functions in the d3-dag notebook
        const layout = d3dag.sugiyama().tweaks([
            d3dag.tweakSize({ width: svgWidth, height: svgHeight})
        ]);
        
        layout(dag);

        const svg = d3.select(svgRef.current)
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        // color scale for each repository
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
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

        // create nodes
        svg.append("g")
            .selectAll("circle")
            .data(dag.nodes())
            .enter()
            .append("circle")
            .attr("cx", (d) => d.y ?? 0) // def value 0 to avoid eslint complaining
            .attr("cy", (d) => d.x ?? 0) // swap x and y to make the graph horizontal
            .attr("r", 3)
            .attr("fill", (d) => colorScale(d.data.repo));

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
