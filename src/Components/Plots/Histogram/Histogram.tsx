import { useEffect, useRef, useMemo, useCallback, useState, memo } from "react";
import { select } from "d3-selection";
import { scaleBand, scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { timeFormat } from "d3-time-format";
import { brushX } from "d3-brush";
import { axisBottom } from "d3-axis";
import { useTheme, themeGet } from "@primer/react";
import { HistogramData } from "@VisInterfaces/HistogramData";
import { sortDates, computeFrequency } from "./HistogramUtils";

/**
 * Component that renders a bar chart using D3 with brush selection functionality.
 */
function Histogram({ commitData, handleHistogramSelection }: HistogramData) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const { theme } = useTheme();
    // Store states for selected date range labels
    const [startLabel, setStartLabel] = useState("");
    const [endLabel, setEndLabel] = useState("");

    // Memoize bar colors
    const barColors = useMemo(() => {
        return {
            bgColor: themeGet("colors.neutral.subtle")({ theme }),
            bgColorSelected: themeGet("colors.neutral.emphasis")({ theme }),
            barColor: themeGet("colors.accent.muted")({ theme }),
            barColorSelected: themeGet("colors.accent.emphasis")({ theme }),
        };
    }, [theme]);

    // Extract and sort commit dates
    const dates = useMemo(() => sortDates(commitData), [commitData]);

    // Compute frequency of dates
    const frequency = useMemo(() => computeFrequency(dates), [dates]);

    // Memoize chart dimensions
    const chartDimensions = useMemo(() => {
        const height = 300;
        const focusContextRatio = 0.7;

        const contextMargin = { top: 0, right: 10, bottom: 45, left: 10 };
        const contextHeight =
            (1 - focusContextRatio) * height - contextMargin.top - contextMargin.bottom;

        const focusMargin = { top: 0, right: 10, bottom: 10, left: 10 };
        const focusHeight =
            focusContextRatio * height - focusMargin.top - focusMargin.bottom;

        return { height, focusContextRatio, contextMargin, contextHeight, focusMargin, focusHeight };
    }, []);

    // Draw the chart
    const drawChart = useCallback(() => {
        if (!svgRef.current) return;

        // Setup chart dimensions
        const svg = select(svgRef.current);
        const container = svg.node()?.parentElement as HTMLElement;
        const width = container.clientWidth;

        const {
            height,
            contextMargin,
            contextHeight,
            focusMargin,
            focusHeight,
        } = chartDimensions;

        const contextWidth = width - contextMargin.left - contextMargin.right;
        const focusWidth = width - focusMargin.left - focusMargin.right;

        // Converts the dates to a usable format
        const formattedDates = Array.from(frequency.keys()).map((dateStr) =>
            timeFormat("%b %Y")(new Date(dateStr))
        );

        // Define scales for context chart
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
        svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);
        svg.selectAll("*").remove();

        // Initialize context chart
        const chartContext = svg
            .append("g")
            .attr("class", "chartContext")
            .attr(
                "transform",
                `translate(${contextMargin.left},
            ${focusHeight +
                focusMargin.top +
                focusMargin.bottom +
                contextMargin.top})`
            );

        // Draw background bars for context chart
        chartContext
            .selectAll(".bar-bg")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar-bg")
            .attr("x", (d) => xScaleContext(timeFormat("%b %Y")(new Date(d[0]))) || 0)
            .attr("y", 0)
            .attr("width", xScaleContext.bandwidth())
            .attr("height", contextHeight)
            .style("fill", barColors.bgColor);

        // Draw bars for context chart
        chartContext
            .selectAll(".bar")
            .data(Array.from(frequency))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScaleContext(timeFormat("%b %Y")(new Date(d[0]))) || 0)
            .attr("y", (d) => yScaleContext(d[1]))
            .attr("width", xScaleContext.bandwidth())
            .attr("height", (d) => contextHeight - yScaleContext(d[1]))
            .style("fill", barColors.barColor);

        // Brush setup
        const brush = brushX()
            // Brush boundaries
            .extent([
                [0, 0],
                [contextWidth, contextHeight],
            ])
            .on("end", ({ selection }) => {
                if (selection) {
                    const [x0, x1] = selection;
                    // Update background bar colors based on selection
                    chartContext.selectAll(".bar-bg").style("fill", (d: unknown) => {
                        const data = d as [string, number];
                        const pos = xScaleContext(
                            timeFormat("%b %Y")(new Date(data[0]))
                        ) as number;
                        return pos >= x0 && pos <= x1
                            ? barColors.bgColorSelected
                            : barColors.bgColor;
                    });

                    // Update bar colors based on selection
                    chartContext.selectAll(".bar").style("fill", (d: unknown) => {
                        const data = d as [string, number];
                        const pos = xScaleContext(
                            timeFormat("%b %Y")(new Date(data[0]))
                        ) as number;
                        return pos >= x0 && pos <= x1
                            ? barColors.barColorSelected
                            : barColors.barColor;
                    });

                    // Store selected date range
                    const selectedDates = Array.from(frequency).filter((d) => {
                        const pos = xScaleContext(
                            timeFormat("%b %Y")(new Date(d[0]))
                        ) as number;
                        return pos >= x0 && pos <= x1;
                    });

                    // Update focus chart
                    xScaleFocus = scaleBand()
                        .domain(
                            selectedDates.map((d) => timeFormat("%b %Y")(new Date(d[0])))
                        )
                        .range([0, focusWidth])
                        .padding(0.1);
                    chartFocus.selectAll("*").remove();

                    // Draw background bars for focus chart
                    chartFocus
                        .selectAll(".bar-bg")
                        .data(Array.from(selectedDates))
                        .enter()
                        .append("rect")
                        .attr("class", "bar-bg")
                        .attr(
                            "x",
                            (d) => xScaleFocus(timeFormat("%b %Y")(new Date(d[0]))) || 0
                        )
                        .attr("y", 0)
                        .attr("width", xScaleFocus.bandwidth())
                        .attr("height", focusHeight)
                        .style("fill", barColors.bgColor);

                    // Draw bars for focus chart
                    chartFocus
                        .selectAll(".bar")
                        .data(Array.from(selectedDates))
                        .enter()
                        .append("rect")
                        .attr("class", "bar")
                        .attr(
                            "x",
                            (d) => xScaleFocus(timeFormat("%b %Y")(new Date(d[0]))) || 0
                        )
                        .attr("y", (d) => yScaleFocus(d[1]))
                        .attr("width", xScaleFocus.bandwidth())
                        .attr("height", (d) => focusHeight - yScaleFocus(d[1]))
                        .style("fill", barColors.barColorSelected)
                        // Tooltip event handlers
                        .on("mouseover", function () {
                            tooltip.style("opacity", 1);
                        })
                        // Show number of commits in interval
                        .on("mousemove", function (event, d) {
                            tooltip
                                .html(
                                    `Date: ${timeFormat("%b %Y")(new Date(d[0]))}
                                    <br/>Commits: ${d[1]}`
                                )
                                .style("left", event.pageX + 10 + "px")
                                .style("top", event.pageY + 10 + "px");
                        })
                        .on("mouseout", function () {
                            tooltip.style("opacity", 0);
                        });

                    chartFocus.selectAll(".selection-label").remove();

                    // Retrieve selected start and end date to use to filter subsequent visualizations
                    if (selectedDates.length > 0) {
                        // Get start and end date
                        const dateFormat = timeFormat("%B %Y");
                        const startOfSelection = new Date(selectedDates[0]?.[0]);

                        const endDateStr = selectedDates[selectedDates.length - 1][0];
                        const endDateObj = new Date(endDateStr);
                        const endOfSelection = new Date(
                            endDateObj.getFullYear(),
                            endDateObj.getMonth() + 1,
                            0, // Last day of the month
                            23,
                            59,
                            59,
                            999 // Set to the latest possible time
                        );

                        if (startOfSelection && endOfSelection) {
                            setStartLabel(dateFormat(startOfSelection));
                            setEndLabel(dateFormat(endOfSelection));
                            if (handleHistogramSelection)
                                handleHistogramSelection(startOfSelection, endOfSelection);
                        }
                    }
                }
            });

        // Define space for x-axis labels
        const labelWidth = 30;
        const tickCount = Math.floor(contextWidth / labelWidth);
        const skip = Math.max(1, Math.ceil(formattedDates.length / tickCount));

        // Draw x-axis labels
        chartContext
            .append("g")
            .attr("transform", `translate(0, ${contextHeight})`)
            .call(
                axisBottom(xScaleContext)
                    .tickValues(formattedDates.filter((_, i) => i % skip === 0))
                    .tickFormat((d) => d)
            )
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)");

        // Draw bars for focus chart
        const chartFocus = svg
            .append("g")
            .attr("class", "chartFocus")
            .attr("transform", `translate(${focusMargin.left},${focusMargin.top})`);

        // Append brush to context chart
        chartContext
            .append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, [0, contextWidth / 5]);

        // Tooltip setup
        const tooltip = select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("padding", "6px")
            .style("background", "#f9f9f9")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);
    }, [frequency]);

    // Re-render on resize or when data changes
    useEffect(() => {
        drawChart();
        window.addEventListener("resize", drawChart);
        return () => window.removeEventListener("resize", drawChart);
    }, [drawChart, handleHistogramSelection, chartDimensions]);

    // return the chart component
    return (
        <div style={{ borderRadius: "10px" }}>
            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <h1 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>
                    Slide to select a date range
                </h1>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                }}
            >
                {/* Display selected date range labels */}
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {startLabel}
                </span>
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>{endLabel}</span>
            </div>
            <svg
                ref={svgRef}
                style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "8px",
                }}
            ></svg>
        </div>
    );
};

export default memo(Histogram);
