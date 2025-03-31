
import * as d3 from "d3";
import { useEffect } from "react";
import { SankeyData } from "@VisInterfaces/SankeyData";
import { parseData, SankeyChart } from "./utils";

// SankeyChartBuild component
export function SankeyDiagram(data: SankeyData) {
    useEffect(() => {

        if (!data) {
            return;
        }

        // show user when no data is selected
        if (!data?.commitData?.length) {
            d3.select("#sankey-diagram").selectAll("*").remove();
            d3.select("#sankey-diagram")
                .append("text")
                .attr("x", 200)
                .attr("y", 200)
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .text("No data selected");
            return;
        }

        // Parse the data and create the Sankey chart
        const sankeyData = parseData(data);
        const links = sankeyData.map((d) => ({
            source: d.name,
            target: d.type,
            value: d.count,
        }));

        // Create the Sankey chart
        const chart = SankeyChart(
            { links },
            {
                nodeGroup: (d) => parseInt((d.index ? d.index.toString() : "").split(/\W/)[0]),
                nodeGroups: [],
                nodeStrokeWidth: 1,
                nodeStrokeOpacity: 1,
                nodeStrokeLinejoin: 1,
                colors: d3.schemeTableau10,
            }
        );

        // Clear previous chart and append new one
        d3.select("#sankey-diagram").selectAll("*").remove();
        d3.select("#sankey-diagram").append(() => chart);
    }, [data]);

    return <div id="sankey-diagram" style={{ width: "100%", height: "400px" }}></div>;
};

