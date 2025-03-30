import { useEffect, useRef, useMemo, useCallback } from "react";
import { useTheme, themeGet } from "@primer/react";
import { HistogramData } from "@VisInterfaces/HistogramData";
import {
    timeMonth,
    rollup,
    min,
    max,
    timeMonths,
    ascending,
    select,
    timeFormat,
    scaleBand,
    scaleLinear,
    brushX,
    axisBottom
} from "d3";

/**
 * Component that renders a bar chart using D3 with brush selection functionality.
 */
function Histogram({ commitData, handleHistogramSelection }: HistogramData) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const { theme } = useTheme();

    // Bar colors
    const bgColor = themeGet("colors.neutral.subtle")({ theme });
    const bgColorSelected = themeGet("colors.neutral.emphasis")({ theme });
    const barColor = themeGet("colors.accent.muted")({ theme });
    const barColorSelected = themeGet("colors.accent.emphasis")({ theme });

    // Extract and sort commit dates
    const dates = useMemo(() => {
        const sortedCommits = [...commitData].sort((a, b) => a.date.getTime() - b.date.getTime());
        return sortedCommits.map(commit => commit.date);
    }, [commitData]);

    /**
     * Processes date data into a frequency map for visualization.
     */
    const frequency = useMemo(() => {
        // Group commits by month
        const data = dates.map(d => ({ date: timeMonth(d) }));
        const freqMap = rollup(data, v => v.length, d => d.date);

        // Fill missing months with 0
        const minDate = min(data, d => d.date) as Date;
        const maxDate = max(data, d => d.date) as Date;
        timeMonths(minDate, maxDate).forEach(d => {
            if (!freqMap.has(d)) freqMap.set(d, 0);
        });

        return new Map(Array.from(freqMap).sort((a, b) => ascending(a[0], b[0])));
    }, [dates]);

    /**
     * Draws the bar chart.
     */
    const drawChart = useCallback(() => {
        if (!svgRef.current) return;

        // Setup chart dimensions
        const svg = select(svgRef.current);
        const container = svg.node()?.parentElement as HTMLElement;
        const width = container.clientWidth;
        const height = 300;

        const contextMargin = { top: 12, right: 10, bottom: 30, left: 10 };
        const contextHeight = 0.25 * height - contextMargin.top - contextMargin.bottom;
        const contextWidth = width - contextMargin.left - contextMargin.right;

        const focusMargin = { top: 0, right: 10, bottom: 24, left: 10 };
        const focusHeight = 0.75 * height - focusMargin.top - focusMargin.bottom;
        const focusWidth = width - focusMargin.left - focusMargin.right;

        // Define scales for context chart
        const formattedDates = Array.from(frequency.keys()).map(d => timeFormat("%b %Y")(d));
        const xScaleContext = scaleBand()
            .domain(formattedDates)
            .range([0, contextWidth])
            .padding(0.1);
        const yScaleContext = scaleLinear()
            .domain([0, max(Array.from(frequency.values())) || 1])
            .range([contextHeight, 0]);

        // Define scales for focus chart
        let xScaleFocus = scaleBand()
            .domain(formattedDates)
            .range([0, focusWidth])
            .padding(0.1);
        const yScaleFocus = scaleLinear()
            .domain([0, max(Array.from(frequency.values())) || 1])
            .range([focusHeight, 0]);

        // Set SVG size
        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);
        svg.selectAll("*").remove();

        // Initialize context chart
        const chartContext = svg.append("g")
            .attr("class", "chartContext")
            .attr("transform", `translate(${contextMargin.left},
            ${focusHeight + focusMargin.top + focusMargin.bottom + contextMargin.top})`);

        // Draw background bars for context chart
        chartContext.selectAll(".bar-bg")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar-bg")
            .attr("x", d => xScaleContext(timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", 0)
            .attr("width", xScaleContext.bandwidth())
            .attr("height", contextHeight)
            .style("fill", bgColor);

        // Draw bars for context chart
        chartContext.selectAll(".bar")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScaleContext(timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", d => yScaleContext(d[1]))
            .attr("width", xScaleContext.bandwidth())
            .attr("height", d => contextHeight - yScaleContext(d[1]))
            .style("fill", barColor);

        // Brush setup
        const brush = brushX()
            .extent([[0, 0], [contextWidth, contextHeight]])
            .on("end", ({ selection }) => {
                if (selection) {
                    const [x0, x1] = selection;
                    // Update background bar colors based on selection
                    chartContext.selectAll(".bar-bg")
                        .style("fill", (d: unknown) => {
                            const data = d as [Date, number];
                            const pos = xScaleContext(timeFormat("%b %Y")(data[0])) as number;
                            return pos >= x0 && pos <= x1 ? bgColorSelected : bgColor;
                        });

                    // Update bar colors based on selection
                    chartContext.selectAll(".bar")
                        .style("fill", (d: unknown) => {
                            const data = d as [Date, number];
                            const pos = xScaleContext(timeFormat("%b %Y")(data[0])) as number;
                            return pos >= x0 && pos <= x1 ? barColorSelected : barColor;
                        });

                    // Store selected date range
                    const selectedDates = Array.from(frequency).filter(d => {
                        const pos = xScaleContext(timeFormat("%b %Y")(d[0])) as number;
                        return pos >= x0 && pos <= x1;
                    });

                    // Update focus chart
                    xScaleFocus = scaleBand()
                        .domain(selectedDates.map(d => timeFormat("%b %Y")(d[0])))
                        .range([0, focusWidth])
                        .padding(0.1);
                    chartFocus.selectAll("*").remove();

                    // Draw background bars for focus chart
                    chartFocus.selectAll(".bar-bg")
                        .data(Array.from(selectedDates))
                        .enter()
                        .append("rect")
                        .attr("class", "bar-bg")
                        .attr("x", d => xScaleFocus(timeFormat("%b %Y")(d[0])) || 0)
                        .attr("y", 0)
                        .attr("width", xScaleFocus.bandwidth())
                        .attr("height", focusHeight)
                        .style("fill", bgColor);

                    // Draw bars for focus chart
                    chartFocus.selectAll(".bar")
                        .data(Array.from(selectedDates))
                        .enter()
                        .append("rect")
                        .attr("class", "bar")
                        .attr("x", d => xScaleFocus(timeFormat("%b %Y")(d[0])) || 0)
                        .attr("y", d => yScaleFocus(d[1]))
                        .attr("width", xScaleFocus.bandwidth())
                        .attr("height", d => focusHeight - yScaleFocus(d[1]))
                        .style("fill", barColorSelected)
                        // Tooltip event handlers
                        .on("mouseover", function () { tooltip.style("opacity", 1); })
                        .on("mousemove", function (event, d) {
                            tooltip.html(`Date: ${timeFormat("%b %Y")(d[0])}<br/>Commits: ${d[1]}`)
                                .style("left", event.pageX + 10 + "px")
                                .style("top", event.pageY + 10 + "px");
                        })
                        .on("mouseout", function () { tooltip.style("opacity", 0); });

                    chartFocus.selectAll(".selection-label").remove();

                    if (selectedDates.length > 0) {
                        // Create group for labels
                        const labelGroup = chartFocus.append("g").attr("class", "selection-label");

                        // Get start and end date
                        const dateFormat = timeFormat("%B %Y");
                        const startOfSelection = selectedDates[0]?.[0];

                        const endOfSelection =
                            new Date(
                                selectedDates[selectedDates.length - 1][0].getFullYear(),
                                selectedDates[selectedDates.length - 1][0].getMonth() + 1,
                                0, // Last day of the month
                                23, 59, 59, 999 // Set to the latest possible time
                            );


                        if (startOfSelection && endOfSelection) {
                            const startLabel = dateFormat(startOfSelection);
                            const endLabel = dateFormat(endOfSelection);

                            // Left label
                            labelGroup
                                .append("text")
                                .attr("x", 0)
                                .attr("y", -5)
                                .text(startLabel);

                            // Right label
                            labelGroup
                                .append("text")
                                .attr("x", focusWidth)
                                .attr("y", -5)
                                .attr("text-anchor", "end")
                                .text(endLabel);

                            if (handleHistogramSelection) handleHistogramSelection(startOfSelection, endOfSelection);
                        }
                    }
                }
            });

        // Define space for x-axis labels
        const labelWidth = 30;
        const tickCount = Math.floor(contextWidth / labelWidth);
        const skip = Math.max(1, Math.ceil(formattedDates.length / tickCount));

        // Draw x-axis labels
        chartContext.append("g")
            .attr("transform", `translate(0, ${contextHeight})`)
            .call(
                axisBottom(xScaleContext)
                    .tickValues(formattedDates.filter((_, i) => i % skip === 0))
                    .tickFormat(d => d)
            )
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)");

        // Draw bars for focus chart
        const chartFocus = svg.append("g")
            .attr("class", "chartFocus")
            .attr("transform", `translate(${focusMargin.left},${focusMargin.top})`);

        // Append brush to context chart
        chartContext.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, [0, contextWidth / 5]);

        // Tooltip setup
        const tooltip = select("body").append("div")
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
        <div style={{ textAlign: "center", borderRadius: "10px" }}>
            <h1 style={{ fontSize: "18px", marginBottom: "0px", fontWeight: "bold" }}>Slide to select a date range</h1>
            <svg ref={svgRef} style={
                { width: "100%", height: "100%", borderRadius: "8px", marginBottom: "10px" }
            }></svg>
        </div>
    );
};

export default Histogram;
