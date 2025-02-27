import { useEffect, useRef } from "react";
import * as d3 from "d3";

function Plot1() {
    const svgRef = useRef<SVGSVGElement | null>(null); // Explicit type for TypeScript

    useEffect(() => {
        if (!svgRef.current) return;

        const data = [10, 20, 30, 40, 50];

        const width = 300;
        const height = 150;

        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const xScale = d3
            .scaleBand<number>()
            .domain(data.map((_, i) => i))
            .range([0, width])
            .padding(0.2);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(data) as number])
            .range([height, 0]);

        svg
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", (_, i) => xScale(i))
            .attr("y", (d) => yScale(d)!)
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => height - yScale(d)!)
            .attr("fill", "steelblue");
    }, []);

    return (
        <div>
            <svg ref={svgRef}></svg>
        </div>
    );
}

export default Plot1;
