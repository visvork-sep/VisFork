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
        new Date("2021-10-01"), new Date("2021-11-01"), new Date("2021-12-01"),
        new Date("2021-01-01"), new Date("2021-02-01"), new Date("2021-03-01"),
        new Date("2021-04-01"), new Date("2021-05-01"), new Date("2021-06-01"),
        new Date("2021-07-01"), new Date("2021-08-01"), new Date("2021-09-01"),
        new Date("2021-10-01"), new Date("2021-11-01"), new Date("2021-12-01"),
        new Date("2021-01-01"), new Date("2021-02-01"), new Date("2021-03-01"),
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

        const contextMargin = { top: 12, right: 10, bottom: 48, left: 10 };
        const contextHeight = 0.25 * height - contextMargin.top - contextMargin.bottom;
        const contextWidth = width - contextMargin.left - contextMargin.right;

        const focusMargin = { top: 48, right: 10, bottom: 24, left: 10 };
        const focusHeight = 0.75 * height - focusMargin.top - focusMargin.bottom;
        const focusWidth = width - focusMargin.left - focusMargin.right;

        // Define scales for context chart
        const formattedDates = Array.from(frequency.keys()).map(d => d3.timeFormat("%b %Y")(d));
        const xScaleContext = d3.scaleBand().domain(formattedDates).range([0, contextWidth

        ]).padding(0.1);
        const yScaleContext = d3.scaleLinear()
            .domain([0, d3.max(Array.from(frequency.values())) || 1])
            .range([contextHeight, 0]);

        // Define scales for focus chart
        let xScaleFocus = d3.scaleBand().domain(formattedDates).range([0, focusWidth]).padding(0.1);
        const yScaleFocus = d3.scaleLinear()
            .domain([0, d3.max(Array.from(frequency.values())) || 1])
            .range([focusHeight, 0]);

        // Set SVG size
        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("border", "1px solid black");
        svg.selectAll("*").remove();

        const chartContext = svg.append("g")
            .attr("class", "chartContext")
            .attr("transform", `translate(${contextMargin.left},
            ${focusHeight + focusMargin.top + focusMargin.bottom + contextMargin.top})`);

        chartContext.selectAll(".bar-bg")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar-bg")
            .attr("x", d => xScaleContext(d3.timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", 0)
            .attr("width", xScaleContext.bandwidth())
            .attr("height", contextHeight)
            .style("fill", "gray");


        // Draw bars for context chart
        chartContext.selectAll(".bar")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScaleContext(d3.timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", d => yScaleContext(d[1]))
            .attr("width", xScaleContext.bandwidth())
            .attr("height", d => contextHeight - yScaleContext(d[1]))
            .style("fill", "green");


        // Brush setup
        const brush = d3.brushX()
            .extent([[0, 0], [contextWidth, contextHeight]])
            .on("brush", ({ selection }) => {
                if (selection) {
                    const [x0, x1] = selection;
                    chartContext.selectAll(".bar").style("fill", (d: unknown) => {
                        const data = d as [Date, number];
                        const pos = xScaleContext(d3.timeFormat("%b %Y")(data[0])) as number;
                        return pos >= x0 && pos <= x1 ? "red" : "green";
                    });
                    // .style("fill", d => selected.indexOf(d.x) > -1 ? "ref" : "green");
                    const selectedDates = Array.from(frequency).filter(d => {
                        const pos = xScaleContext(d3.timeFormat("%b %Y")(d[0])) as number;
                        return pos >= x0 && pos <= x1;
                    });
                    console.log("Selected Dates:", selectedDates);

                    xScaleFocus = d3.scaleBand()
                        .domain(selectedDates.map(d => d3.timeFormat("%b %Y")(d[0])))
                        .range([0, focusWidth])
                        .padding(0.1);
                    chartFocus.selectAll("*").remove();

                    chartFocus.selectAll(".bar-bg")
                        .data(Array.from(selectedDates))
                        .enter()
                        .append("rect")
                        .attr("class", "bar-bg")
                        .attr("x", d => xScaleFocus(d3.timeFormat("%b %Y")(d[0])) || 0)
                        .attr("y", 0)
                        .attr("width", xScaleFocus.bandwidth())
                        .attr("height", focusHeight)
                        .style("fill", "gray");

                    chartFocus.selectAll(".bar")
                        .data(Array.from(selectedDates))
                        .enter()
                        .append("rect")
                        .attr("class", "bar")
                        .attr("x", d => xScaleFocus(d3.timeFormat("%b %Y")(d[0])) || 0)
                        .attr("y", d => yScaleFocus(d[1]))
                        .attr("width", xScaleFocus.bandwidth())
                        .attr("height", d => focusHeight - yScaleFocus(d[1]))
                        .style("fill", "blue")
                        .on("mouseover", function () { tooltip.style("opacity", 1); })
                        .on("mousemove", function (event, d) {
                            tooltip.html(`Date: ${d3.timeFormat("%b %Y")(d[0])}<br/>Commits: ${d[1]}`)
                                .style("left", event.pageX + 10 + "px")
                                .style("top", event.pageY + 10 + "px");
                        })
                        .on("mouseout", function () { tooltip.style("opacity", 0); });

                }
            });

        chartContext.append("g").attr("class", "brush").call(brush);

        // Draw x-axis
        chartContext.append("g")
            .attr("transform", `translate(0, ${contextHeight})`)
            .call(d3.axisBottom(xScaleContext).tickFormat(d => d))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)");

        // Draw bars for focus chart
        const chartFocus = svg.append("g")
            .attr("class", "chartFocus")
            .attr("transform", `translate(${focusMargin.left},${focusMargin.top})`);

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
