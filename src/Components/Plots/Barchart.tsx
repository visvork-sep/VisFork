import React, { useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";

interface DataPoint {
  date: string;
}

const Barchart = ({ rawData }: { rawData: DataPoint[] }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  /////
  // Data processing
  /////
  const frequency = useMemo(() => {
    const data = JSON.parse(JSON.stringify(rawData)) as DataPoint[];
    data.forEach((d) => {
      (d as any).date = d3.timeMonth(new Date(d.date));
    });

    const freqMap = d3.rollup(
      data,
      (v) => v.length,
      (d) => new Date(d.date)
    );

    const minDate = d3.min(data, (d) => new Date(d.date)) as Date;
    const maxDate = d3.max(data, (d) => new Date(d.date)) as Date;
    const allMonths = d3.timeMonths(minDate, maxDate);
    allMonths.forEach((d) => {
      if (!freqMap.has(d)) {
        freqMap.set(d, 0);
      }
    });

    return new Map(Array.from(freqMap).sort((a, b) => d3.ascending(a[0], b[0])));
  }, [rawData]);

  /////
  // Visualization
  /////
  const drawBars = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const container = svg.node()?.parentNode as HTMLElement;
    const width = container.clientWidth;
    const height = 150;
    const margin = { top: 10, right: 20, bottom: 40, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
  
    // Use scaleBand for equal spacing
    const xScale = d3.scaleBand()
      .domain(Array.from(frequency.keys()).map(d => d3.timeFormat("%b %Y")(d)))
      .range([0, chartWidth])
      .padding(0.1); // Adds space between bars
  
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(Array.from(frequency.values())) || 1])
      .range([chartHeight, 0]);
  
    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
    svg.selectAll("*").remove();
  
    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const barWidth = xScale.bandwidth();
  
    // Draw background bars
    chart.selectAll(".bg-bar")
      .data(Array.from(frequency))
      .enter()
      .append("rect")
      .attr("class", "bg-bar")
      .attr("x", (d) => xScale(d3.timeFormat("%b %Y")(d[0])) || 0)
      .attr("y", chartHeight - 100)
      .attr("width", barWidth)
      .attr("height", 100)
      .attr("fill", "white")
      .attr("opacity", 0.1);
  
    // Draw frequency bars
    chart.selectAll(".bar")
      .data(Array.from(frequency))
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d3.timeFormat("%b %Y")(d[0])) || 0)
      .attr("y", (d) => yScale(d[1]))
      .attr("width", barWidth)
      .attr("height", (d) => chartHeight - yScale(d[1]))
      .attr("fill", "steelblue");
  
    // Update x-axis
    const xAxis = d3.axisBottom(xScale);
    chart.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-45)");
  
    chart.select(".domain").remove();
  }, [frequency]);
  

  /////
  // Render (on window resize)
  /////
  useEffect(() => {
    drawBars();
    window.addEventListener("resize", drawBars);
    return () => window.removeEventListener("resize", drawBars);
  }, [drawBars]);

  return <svg ref={svgRef} style={{ width: "100%", height: "150px" }}></svg>;
};

export default Barchart;
