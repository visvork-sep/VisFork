import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import * as d3dag from "d3-dag";

interface Commit {
  id: string;
  parentIds: string[];
  repo: string;
  date: Date;
}

interface RawCommit {
  id: string;
  parentIds: string[];
  repo: string;
  date: string;
}

interface DagProps {
  data: RawCommit[];
}

const CommitTimeline: React.FC<DagProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

        const dag = d3dag.dagStratify()(dagData);
        
        // TO-DO: fix layout, see helper functions in the d3-dag notebook
        const width = 1500; 
        const height = 400; 
        const layout = d3dag.sugiyama().size([height, width]); 
        
        layout(dag);

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        // color scale for each repository
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

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
                const M = `M${d.source.y},${d.source.x}`; 
                const L = `L${d.target.y},${d.target.x}`; 
                return [M, L].join(" ");
            });

        // create nodes
        svg.append("g")
            .selectAll("circle")
            .data(dag.descendants())
            .enter()
            .append("circle")
            .attr("cx", (d) => d.y ?? 0) // def value 0 to avoid eslint complaining
            .attr("cy", (d) => d.x ?? 0) // swap x and y to make the graph horizontal
            .attr("r", 3)
            .attr("fill", (d) => colorScale(d.data.repo));

    }, [data]);

    return (
        <div ref={containerRef} style={{ 
            overflowX: "auto", 
            width: "100%", 
            whiteSpace: "nowrap", 
        }}>
            <svg ref={svgRef} width="800" height="400"> {}
                {}
            </svg>
        </div>
    );
};

export default CommitTimeline;
