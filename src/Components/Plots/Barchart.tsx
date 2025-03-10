import { useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";

// Destruct the dates from the props into an array of dates
const Barchart = ({ dates }: { dates: Date[] }) => {

    const svgRef = useRef<SVGSVGElement | null>(null);

    /////
    // Data processing
    /////
    const frequency = useMemo(() => {
        // Copy passed data
        const data = dates.map((d) => ({ date: d }));

        // Convert each date to the first day of the month
        data.forEach((d) => {
            d.date = d3.timeMonth(new Date(d.date));
        });

        // Count the frequency of each date
        const freqMap = d3.rollup(
            data,
            (v) => v.length,
            (d) => new Date(d.date)
        );

        // Get daterange
        const minDate = d3.min(data, (d) => new Date(d.date)) as Date;
        const maxDate = d3.max(data, (d) => new Date(d.date)) as Date;
        const allMonths = d3.timeMonths(minDate, maxDate);

        // Fill in missing months with 0 frequency
        allMonths.forEach((d) => {
            if (!freqMap.has(d)) {
                freqMap.set(d, 0);
            }
        });

        // Return map sorted by date
        return new Map(
            Array.from(freqMap).sort((a, b) => d3.ascending(a[0], b[0]))
        );
    }, [dates]);

    /////
    // Visualization
    /////
    const drawBars = useCallback(() => {
        // Select the SVG and clear any previous content
        const svg = d3.select(svgRef.current);
        const container = svg.node()?.parentNode as HTMLElement;
        const width = container.clientWidth;
        const height = 150;
        const margin = { top: 10, right: 20, bottom: 50, left: 20 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Set SVG size
        svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        // Clear previous content
        svg.selectAll("*").remove();

        // Set chart size
        const chart = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Prepare x scale
        const formattedDates = Array.from(frequency.keys()).map((d) =>
            d3.timeFormat("%b %Y")(d)
        );
        const xScale = d3
            .scaleBand()
            .domain(formattedDates)
            .range([0, chartWidth])
            .padding(0.1);

        // Prepare y scale
        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(Array.from(frequency.values())) || 1])
            .range([chartHeight, 0]);

        // Tooltop for hover
        let tooltip = d3
            .select("body")
            .selectAll<HTMLDivElement, unknown>(".tooltip")
            .data([null]);
        tooltip = tooltip
            .enter()
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("padding", "6px")
            .style("background", "#f9f9f9")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .merge(tooltip);


        const barWidth = xScale.bandwidth();

        // Create brush
        const brush = d3.brushX()
            .extent([[0, 0], [chartWidth, chartHeight]]) // Cover full chart
            .on("brush", brushed)
            .on("end", brushended);

        // Append a large transparent rect to capture interactions
        const brushG = chart.append("g")
            .attr("class", "brush")
            .call(brush);

        brushG.selectAll(".overlay")
            .style("pointer-events", "all"); // Ensure it listens to clicks everywhere


        // Draw background bars and tooltip logic
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
            .attr("opacity", 0.3)
            .on("mouseover", function () {
                // Show the tooltip

                tooltip.style("opacity", 1);
            })
            .on("mousemove", function (event, d) {
                // Format the date as needed
                const dateStr = d3.timeFormat("%b %Y")(d[0]);
                const commits = d[1];

                // Position the tooltip near the mouse cursor
                tooltip
                    .html(`Date: ${dateStr}<br/>Commits: ${commits}`)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px");
            })
            .on("mouseout", function () {
                // Hide the tooltip
                tooltip.style("opacity", 0);

            });

        // Draw frequency bars and tooltip logic
        chart
            .selectAll(".bar")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScale(d3.timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", (d) => yScale(d[1]))
            .attr("width", barWidth)
            .attr("height", (d) => chartHeight - yScale(d[1]))
            .attr("fill", "steelblue")
            .on("mouseover", function () {
                // Show the tooltip

                tooltip.style("opacity", 1);
            })
            .on("mousemove", function (event, d) {
                // Format the date as needed
                const dateStr = d3.timeFormat("%b %Y")(d[0]);
                const commits = d[1];

                // Position the tooltip near the mouse cursor
                tooltip
                    .html(`Date: ${dateStr}<br/>Commits: ${commits}`)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px");
            })
            .on("mouseout", function () {
                // Hide the tooltip
                tooltip.style("opacity", 0);
            });


        // Label x axis dynamically
        const tickInterval = Math.max(
            1,
            Math.ceil(formattedDates.length / (chartWidth / 40)) // Sets number of labels
        );
        const filteredTicks = formattedDates.filter(
            (_, i) => i % tickInterval === 0
        );

        const xAxis = d3
            .axisBottom(xScale)
            .tickValues(filteredTicks)
            .tickFormat((d) => d);

        chart
            .append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)");

        // Remove the default axis line
        chart.select(".domain").remove();


        // 
        function brushed({ selection }: { selection: [number, number] | null }) {
            if (selection) {
                const [x0, x1] = selection;
                const selectedDates = Array.from(frequency).filter(
                    (d) =>
                        xScale(d3.timeFormat("%b %Y")(d[0])) as number >= x0 &&
                        xScale(d3.timeFormat("%b %Y")(d[0])) as number <= x1
                );
                console.log(selectedDates);
            }
        }

        function brushended({ selection }: { selection: [number, number] | null }) {
            if (!selection) {
                brushG.call(brush.move, [0, 0]);
            }
        }
    }, [frequency]);

    /////
    // Render (on window resize)
    /////
    useEffect(() => {
        drawBars();
        window.addEventListener("resize", drawBars);
        return () => window.removeEventListener("resize", drawBars);
    }, [drawBars]);

    // TODO: Fix color scheme of background divs
    return (
        <div
            style={{
                textAlign: "center",
                padding: "20px",
                borderRadius: "10px",
            }}
        >
            <h1
                style={{
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
                    background: "fg.subtle",
                    borderRadius: "8px",
                    marginBottom: "10px",
                }}
            ></svg>
        </div>
    );
};

export default Barchart;
