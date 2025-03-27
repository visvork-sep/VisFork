import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import * as d3 from "d3";
import { useTheme, themeGet } from "@primer/react";
import { HistogramData } from "@VisInterfaces/HistogramData";

/**
 * Component that renders a bar chart using D3 with brush selection functionality.
 */
function Histogram({ commitData, handleHistogramSelection }: HistogramData) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useTheme();
  const [startLabel, setStartLabel] = useState("");
  const [endLabel, setEndLabel] = useState("");

  // Bar colors
  const bgColor = themeGet("colors.neutral.subtle")({ theme });
  const bgColorSelected = themeGet("colors.neutral.emphasis")({ theme });
  const barColor = themeGet("colors.accent.muted")({ theme });
  const barColorSelected = themeGet("colors.accent.emphasis")({ theme });

  // Extract and sort commit dates
  const dates = useMemo(() => {
    const sortedCommits = [...commitData].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    return sortedCommits.map((commit) => commit.date);
  }, [commitData]);

  /**
   * Processes date data into a frequency map for visualization.
   */
  const frequency = useMemo(() => {
    // Group commits by month
    const data = dates.map((d) => ({ date: d3.timeMonth(d) }));
    const freqMap = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.date
    );

    // Fill missing months with 0
    const minDate = d3.min(data, (d) => d.date) as Date;
    const maxDate = d3.max(data, (d) => d.date) as Date;
    d3.timeMonths(minDate, maxDate).forEach((d) => {
      if (!freqMap.has(d)) freqMap.set(d, 0);
    });

    return new Map(
      Array.from(freqMap).sort((a, b) => d3.ascending(a[0], b[0]))
    );
  }, [dates]);

  /**
   * Draws the bar chart.
   */
  const drawChart = useCallback(() => {
    if (!svgRef.current) return;

    // Setup chart dimensions
    const svg = d3.select(svgRef.current);
    const container = svg.node()?.parentElement as HTMLElement;
    const width = container.clientWidth;
    const height = 300;
    const focusContextRatio = 0.7; // percentage of focus chart height, rest is context chart

    const contextMargin = { top: 0, right: 10, bottom: 45, left: 10 };
    const contextHeight =
      (1 - focusContextRatio) * height -
      contextMargin.top -
      contextMargin.bottom;
    const contextWidth = width - contextMargin.left - contextMargin.right;

    const focusMargin = { top: 0, right: 10, bottom: 10, left: 10 };
    const focusHeight =
      focusContextRatio * height - focusMargin.top - focusMargin.bottom;
    const focusWidth = width - focusMargin.left - focusMargin.right;

    // Define scales for context chart
    const formattedDates = Array.from(frequency.keys()).map((d) =>
      d3.timeFormat("%b %Y")(d)
    );
    const xScaleContext = d3
      .scaleBand()
      .domain(formattedDates)
      .range([0, contextWidth])
      .padding(0.1);
    const yScaleContext = d3
      .scaleLinear()
      .domain([0, d3.max(Array.from(frequency.values())) || 1])
      .range([contextHeight, 0]);

    // Define scales for focus chart
    let xScaleFocus = d3
      .scaleBand()
      .domain(formattedDates)
      .range([0, focusWidth])
      .padding(0.1);
    const yScaleFocus = d3
      .scaleLinear()
      .domain([0, d3.max(Array.from(frequency.values())) || 1])
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
            ${
              focusHeight +
              focusMargin.top +
              focusMargin.bottom +
              contextMargin.top
            })`
      );

    // Draw background bars for context chart
    chartContext
      .selectAll(".bar-bg")
      .data(Array.from(frequency))
      .enter()
      .append("rect")
      .attr("class", "bar-bg")
      .attr("x", (d) => xScaleContext(d3.timeFormat("%b %Y")(d[0])) || 0)
      .attr("y", 0)
      .attr("width", xScaleContext.bandwidth())
      .attr("height", contextHeight)
      .style("fill", bgColor);

    // Draw bars for context chart
    chartContext
      .selectAll(".bar")
      .data(Array.from(frequency))
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScaleContext(d3.timeFormat("%b %Y")(d[0])) || 0)
      .attr("y", (d) => yScaleContext(d[1]))
      .attr("width", xScaleContext.bandwidth())
      .attr("height", (d) => contextHeight - yScaleContext(d[1]))
      .style("fill", barColor);

    // Brush setup
    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [contextWidth, contextHeight],
      ])
      .on("end", ({ selection }) => {
        if (selection) {
          const [x0, x1] = selection;
          // Update background bar colors based on selection
          chartContext.selectAll(".bar-bg").style("fill", (d: unknown) => {
            const data = d as [Date, number];
            const pos = xScaleContext(
              d3.timeFormat("%b %Y")(data[0])
            ) as number;
            return pos >= x0 && pos <= x1 ? bgColorSelected : bgColor;
          });

          // Update bar colors based on selection
          chartContext.selectAll(".bar").style("fill", (d: unknown) => {
            const data = d as [Date, number];
            const pos = xScaleContext(
              d3.timeFormat("%b %Y")(data[0])
            ) as number;
            return pos >= x0 && pos <= x1 ? barColorSelected : barColor;
          });

          // Store selected date range
          const selectedDates = Array.from(frequency).filter((d) => {
            const pos = xScaleContext(d3.timeFormat("%b %Y")(d[0])) as number;
            return pos >= x0 && pos <= x1;
          });

          // Update focus chart
          xScaleFocus = d3
            .scaleBand()
            .domain(selectedDates.map((d) => d3.timeFormat("%b %Y")(d[0])))
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
            .attr("x", (d) => xScaleFocus(d3.timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", 0)
            .attr("width", xScaleFocus.bandwidth())
            .attr("height", focusHeight)
            .style("fill", bgColor);

          // Draw bars for focus chart
          chartFocus
            .selectAll(".bar")
            .data(Array.from(selectedDates))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScaleFocus(d3.timeFormat("%b %Y")(d[0])) || 0)
            .attr("y", (d) => yScaleFocus(d[1]))
            .attr("width", xScaleFocus.bandwidth())
            .attr("height", (d) => focusHeight - yScaleFocus(d[1]))
            .style("fill", barColorSelected)
            // Tooltip event handlers
            .on("mouseover", function () {
              tooltip.style("opacity", 1);
            })
            .on("mousemove", function (event, d) {
              tooltip
                .html(
                  `Date: ${d3.timeFormat("%b %Y")(d[0])}<br/>Commits: ${d[1]}`
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + 10 + "px");
            })
            .on("mouseout", function () {
              tooltip.style("opacity", 0);
            });

          chartFocus.selectAll(".selection-label").remove();

          if (selectedDates.length > 0) {
            // Get start and end date
            const dateFormat = d3.timeFormat("%B %Y");
            const startOfSelection = selectedDates[0]?.[0];

            const endOfSelection = new Date(
              selectedDates[selectedDates.length - 1][0].getFullYear(),
              selectedDates[selectedDates.length - 1][0].getMonth() + 1,
              0, // Last day of the month
              23,
              59,
              59,
              999 // Set to the latest possible time
            );
            // console.log("Start Date:", startOfSelection);
            // console.log("End Date:", endOfSelection);

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
        d3
          .axisBottom(xScaleContext)
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
    const tooltip = d3
      .select("body")
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

  useEffect(() => {
    drawChart();
    window.addEventListener("resize", drawChart);
    return () => window.removeEventListener("resize", drawChart);
  }, [drawChart]);

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
}

export default Histogram;
