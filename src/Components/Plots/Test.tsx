import { useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";

/**
 * Component that renders a bar chart using D3 with brush selection functionality.
 */
const Test: React.FC = () => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Sample date data
    const dates = useMemo(() => [
        new Date("2021-01-01"), new Date("2021-02-01"), new Date("2021-03-01"),
        new Date("2021-04-01"), new Date("2021-05-01"), new Date("2021-06-01"),
        new Date("2021-07-01"), new Date("2021-08-01"), new Date("2021-09-01"),
        new Date("2021-10-01"), new Date("2021-11-01"), new Date("2021-12-01")
        , new Date("2021-01-01"), new Date("2021-02-01"), new Date("2021-03-01"),
        new Date("2021-04-01"), new Date("2021-05-01"), new Date("2021-06-01"),
        new Date("2021-07-01"), new Date("2021-08-01"), new Date("2021-09-01"),
        new Date("2021-10-01"), new Date("2021-11-01"), new Date("2021-12-01")
        , new Date("2021-01-01"), new Date("2021-02-01"), new Date("2021-03-01"),
        new Date("2020-04-01"), new Date("2021-05-01"), new Date("2021-06-01"),
        new Date("2021-07-01"), new Date("2021-08-01"), new Date("2021-09-01"),
        new Date("2021-10-01"), new Date("2021-11-01"), new Date("2021-12-01"),

    ], []);

    /**
     * Processes date data into a frequency map for visualization.
     */
    const frequency = useMemo(() => {
        const data = dates.map(d => ({ date: d3.timeMonth(d) }));
        const freqMap = d3.rollup(data, v => v.length, d => d.date);

        // Fill missing months with 0 frequency
        const minDate = d3.min(data, d => d.date) as Date;
        const maxDate = d3.max(data, d => d.date) as Date;
        d3.timeMonths(minDate, maxDate).forEach(d => {
            if (!freqMap.has(d)) freqMap.set(d, 0);
        });

        return new Map(Array.from(freqMap).sort((a, b) => d3.ascending(a[0], b[0])));
    }, [dates]);

    /**
     * Draws the bar chart using D3.
     */
    const drawChart = useCallback(() => {
        if (!svgRef.current) return;

        // Setup chart dimensions
        const svg = d3.select(svgRef.current);
        const container = svg.node()?.parentElement as HTMLElement;
        const width = container.clientWidth;
        const height = 400;

        const smallMargin = { top: 12, right: 10, bottom: 48, left: 10 };
        const smallHeight = 0.25 * height - smallMargin.top - smallMargin.bottom;
        const smallWidth = width - smallMargin.left - smallMargin.right;

        const bigMargin = { top: 48, right: 10, bottom: 24, left: 10 };
        const bigHeight = 0.75 * height - bigMargin.top - bigMargin.bottom;
        const bigWidth = width - bigMargin.left - bigMargin.right;



        // const margin = { top: 10, right: 20, bottom: 50, left: 20 };
        // const chartWidth = width - margin.left - margin.right;
        // const chartHeight = height - margin.top - margin.bottom;

        // Define scales for small chart
        const formattedDates = Array.from(frequency.keys()).map(d => d3.timeFormat("%b %Y")(d));
        const xScaleSmall = d3.scaleBand().domain(formattedDates).range([0, smallWidth]).padding(0.1);
        const yScaleSmall = d3.scaleLinear()
            .domain([0, d3.max(Array.from(frequency.values())) || 1])
            .range([smallHeight, 0]);

        // Define scales for big chart
        const xScaleBig = d3.scaleBand().domain(formattedDates).range([0, bigWidth]).padding(0.1);
        const yScaleBig = d3.scaleLinear()
            .domain([0, d3.max(Array.from(frequency.values())) || 1])
            .range([bigHeight, 0]);

        // Set SVG size
        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("border", "1px solid black");
        svg.selectAll("*").remove();

        // const sq = svg.append("g").attr("transform", "translate(0,1700)").style("fill", "red");
        // sq.append("rect").attr("x", 0).attr("y", 0).attr("width", 100).attr("height", 100);

        const chartSmall = svg.append("g")
            .attr("class", "chartSmall")
            .attr("transform", `translate(${smallMargin.left},
            ${bigHeight + bigMargin.top + bigMargin.bottom + smallMargin.top})`);

        chartSmall.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", smallWidth)
            .attr("height", smallHeight)
            .style("fill", "beige");

        chartSmall.selectAll(".bar-bg")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar-bg")
            .attr("x", d => xScaleSmall(d3.timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", 0)
            .attr("width", xScaleSmall.bandwidth())
            .attr("height", smallHeight)
            .style("fill", "gray");


        // Draw bars for small chart
        chartSmall.selectAll(".bar")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScaleSmall(d3.timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", d => yScaleSmall(d[1]))
            .attr("width", xScaleSmall.bandwidth())
            .attr("height", d => smallHeight - yScaleSmall(d[1]))
            .style("fill", "green");


        // Brush setup
        const brush = d3.brushX()
            .extent([[0, 0], [smallWidth, smallHeight]])
            .on("brush", ({ selection }) => {
                if (selection) {
                    const [x0, x1] = selection;
                    chartSmall.selectAll(".bar").style("fill", (d: unknown) => {
                        const data = d as [Date, number];
                        const pos = xScaleSmall(d3.timeFormat("%b %Y")(data[0])) as number;
                        return pos >= x0 && pos <= x1 ? "red" : "green";
                    });
                    // .style("fill", d => selected.indexOf(d.x) > -1 ? "ref" : "green");
                    const selectedDates = Array.from(frequency).filter(d => {
                        const pos = xScaleSmall(d3.timeFormat("%b %Y")(d[0])) as number;
                        return pos >= x0 && pos <= x1;
                    });
                    console.log("Selected Dates:", selectedDates);
                }
            });

        chartSmall.append("g").attr("class", "brush").call(brush);

        // Draw x-axis
        chartSmall.append("g")
            .attr("transform", `translate(0, ${smallHeight})`)
            .call(d3.axisBottom(xScaleSmall).tickFormat(d => d))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)");

        // Draw bars for big chart
        const chartBig = svg.append("g")
            .attr("class", "chartBig")
            .attr("transform", `translate(${bigMargin.left},${bigMargin.top})`);

        // chartBig.append("rect")
        //     .attr("x", 0)
        //     .attr("y", 0)
        //     .attr("width", bigWidth)
        //     .attr("height", bigHeight)
        //     .style("fill", "beige");
        chartBig.selectAll(".bar-bg")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar-bg")
            .attr("x", d => xScaleBig(d3.timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", 0)
            .attr("width", xScaleBig.bandwidth())
            .attr("height", bigHeight)
            .style("fill", "gray");

        chartBig.selectAll(".bar")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScaleBig(d3.timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", d => yScaleBig(d[1]))
            .attr("width", xScaleBig.bandwidth())
            .attr("height", d => bigHeight - yScaleBig(d[1]))
            .style("fill", "blue")
            .on("mouseover", function () { tooltip.style("opacity", 1); })
            .on("mousemove", function (event, d) {
                tooltip.html(`Date: ${d3.timeFormat("%b %Y")(d[0])}<br/>Commits: ${d[1]}`)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px");
            })
            .on("mouseout", function () { tooltip.style("opacity", 0); });


        // Tooltip setup
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("padding", "6px")
            .style("background", "#f9f9f9")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);

    }, [frequency]);

    useEffect(() => {
        drawChart();
        window.addEventListener("resize", drawChart);
        return () => window.removeEventListener("resize", drawChart);
    }, [drawChart]);

    return (
        <div style={{ textAlign: "center", padding: "20px", borderRadius: "10px" }}>
            <h1 style={{ fontSize: "18px", marginBottom: "10px", fontWeight: "bold" }}>Slide to select a date range</h1>
            <svg ref={svgRef} style={
                { width: "100%", height: "100%", borderRadius: "8px", marginBottom: "10px" }
            }></svg>
        </div>
    );
};

export default Test;
