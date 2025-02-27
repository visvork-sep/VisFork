import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Define types for data and props
interface DataPoint {
    date: string; // Assuming date comes as a string in raw data
}

interface RangeSlider {
    raw: DataPoint[];
    onSelection?: (selectedDates: Date[]) => void;
}

const RangeSlider: React.FC<RangeSlider> = ({
    raw,
    onSelection = () => { },
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const width = 1000;
    const height = 100;
    const margin = { top: 10, right: 0, bottom: 50, left: 0 };

    useEffect(() => {
        if (!ref.current) return;

        // Deep copy raw data
        console.log(raw);
        const data = JSON.parse(JSON.stringify(raw)) as DataPoint[];

        // Clear SVG before rendering
        d3.select(ref.current).selectAll("*").remove();

        if (data.length) {
            // Convert date strings to Date objects (keeping only months)
            data.forEach((d) => {
                (d as any).date = d3.timeMonth(new Date(d.date));
            });

            // Compute frequency by month
            let frequency = d3.rollup(
                data,
                (v) => v.length,
                (d) => new Date(d.date)
            );

            // Fill missing months with 0
            const minDate = d3.min(data, (d) => new Date(d.date)) as Date;
            const maxDate = d3.max(data, (d) => new Date(d.date)) as Date;

            const allMonths = d3.timeMonths(minDate, maxDate);
            allMonths.forEach((d) => {
                if (!frequency.has(d)) {
                    frequency.set(d, 0);
                }
            });

            // Sort data by date
            frequency = new Map(
                Array.from(frequency).sort((a, b) => d3.ascending(a[0], b[0]))
            );

            // Create scales
            const xScale = d3.scaleBand<Date>().rangeRound([0, width]).padding(0.1);
            const yScale = d3.scaleLinear().range([height, 0]);

            xScale.domain(Array.from(frequency.keys()));
            yScale.domain([0, d3.max(frequency.values()) as number]);

            // Create axes
            const xAxis = d3
                .axisBottom<Date>(xScale)
                .tickFormat(d3.timeFormat("%Y-%m") as any)
                .tickSize(0);
            const yAxis = d3.axisLeft(yScale).tickSize(0);

            // Create SVG container
            const svg = d3
                .select(ref.current)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Add X axis
            svg
                .append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            // Remove x-axis line
            svg.selectAll(".domain").remove();

            // Add Y axis
            svg
                .append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .selectAll(".domain")
                .remove();

            // Create bars
            svg
                .selectAll(".bar")
                .data(Array.from(frequency.entries()))
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", (d) => xScale(d[0])!)
                .attr("y", (d) => yScale(d[1])!)
                .attr("fill", "gray")
                .attr("width", xScale.bandwidth())
                .attr("height", (d) => height - yScale(d[1])!);

            // Brush selection variables
            let selectedDates: Date[] = [];

            // Create brush
            const brush = d3
                .brushX()
                .extent([
                    [0, 0],
                    [width, height],
                ])
                .on("brush", brushing)
                .on("end", brushed);

            svg.append("g").call(brush);

            function brushing(event: d3.D3BrushEvent<any>) {
                if (!event.selection) return;

                const [x0, x1] = event.selection as [number, number];

                // Get selected dates
                selectedDates = xScale.domain().filter((d: Date) => {
                    const xPos = xScale(d);
                    return xPos !== undefined && x0 <= xPos && xPos <= x1;
                });

                // Highlight selected bars
                svg
                    .selectAll<SVGRectElement, [Date, number]>(".bar")
                    .attr("fill", (d) =>
                        selectedDates.includes(d[0] as Date) ? "steelblue" : "gray"
                    );
            }

            function brushed(event: d3.D3BrushEvent<any>) {
                if (!event.selection) return;
                onSelection(selectedDates);
            }

            // Double-click to reset selection
            svg.on("dblclick", () => {
                brush.move(svg.select("g.brush"), [0, width]);
                selectedDates = xScale.domain();
                svg.selectAll(".bar").attr("fill", "steelblue");
                onSelection(selectedDates);
            });
        }
    }, [raw]);

    return (
        <div className="text-center">
            <div
                id="range-slider"
                ref={ref}
                className="border-2 border-blue-300 rounded-md p-1"
            >
                Slide to select a date range
            </div>
        </div>
    );
};

export default RangeSlider;
