import { useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";

interface DataPoint {
  date: Date;
}

const Barchart = ({ rawData }: { rawData: DataPoint[] }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  /////
  // Data processing
  /////
  const frequency = useMemo(() => {
    const data = JSON.parse(JSON.stringify(rawData)) as DataPoint[];
    data.forEach((d) => {
      d.date = d3.timeMonth(new Date(d.date));
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

    return new Map(
      Array.from(freqMap).sort((a, b) => d3.ascending(a[0], b[0]))
    );
  }, [rawData]);

  /////
  // Visualization
  /////
  const drawBars = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const container = svg.node()?.parentNode as HTMLElement;
    const width = container.clientWidth;
    const height = 150;
    const margin = { top: 10, right: 20, bottom: 50, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Convert Date to String for xScale
    const formattedDates = Array.from(frequency.keys()).map((d) =>
      d3.timeFormat("%b %Y")(d)
    );

    // Use scaleBand with string-based domain
    const xScale = d3
      .scaleBand()
      .domain(formattedDates)
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(Array.from(frequency.values())) || 1])
      .range([chartHeight, 0]);

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);
    svg.selectAll("*").remove();

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const barWidth = xScale.bandwidth();

    // Draw background bars
    chart
      .selectAll(".bg-bar")
      .data(Array.from(frequency))
      .enter()
      .append("rect")
      .attr("class", "bg-bar")
      .attr("x", (d) => xScale(d3.timeFormat("%b %Y")(d[0])) || 0)
      .attr("y", 0)
      .attr("width", barWidth)
      .attr("height", chartHeight)
      .attr("fill", "lightgray")
      .attr("opacity", 0.05);

    // Draw frequency bars
    chart
      .selectAll(".bar")
      .data(Array.from(frequency))
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d3.timeFormat("%b %Y")(d[0])) || 0) // Convert Date → String
      .attr("y", (d) => yScale(d[1]))
      .attr("width", barWidth)
      .attr("height", (d) => chartHeight - yScale(d[1]))
      .attr("fill", "steelblue");

    // Dynamically adjust x-axis ticks
    const tickInterval = Math.max(
      1,
      Math.ceil(formattedDates.length / (chartWidth / 80))
    );
    const filteredTicks = formattedDates.filter(
      (_, i) => i % tickInterval === 0
    );

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(filteredTicks) // Use formatted date strings
      .tickFormat((d) => d); // No reformatting needed

    chart
      .append("g")
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

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        background: "#121212",
        borderRadius: "10px",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: "18px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Slide to select a date range
      </h1>
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "150px",
          background: "#202020",
          borderRadius: "8px",
          boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
          marginBottom: "10px",
        }}
      ></svg>
    </div>
  );
};

export default Barchart;
