/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3Sankey from "d3-sankey";
import * as d3 from "d3";
import { useEffect } from "react";
import { FC } from "react";
import { Repository } from "./repo";

type ParsedDataItem = {
    name: string;
    type: string;
    count: number;
};

//nodeAlligh doesn't have the values defined by the library and it was needed to create a custom type
type AlignType = "justify" | "left" | "right" | "center";

interface SankeyChartBuildProps {
    data: Repository[];
}

// Function to map string to d3-sankey alignment functions
const getNodeAlignFunction = (align: AlignType) => {
    switch (align) {
        case "left":
            return d3Sankey.sankeyLeft;
        case "right":
            return d3Sankey.sankeyRight;
        case "center":
            return d3Sankey.sankeyCenter;
        case "justify":
        default:
            return d3Sankey.sankeyJustify; // Default to justify
    }
};

export function parseData(data: Repository[]):ParsedDataItem[] {
    const parsedData: Record<string, ParsedDataItem> = {};

    for (let i = 0; i < data.length; i++) {
        const name = data[i].repo;
        const type = data[i].commit_type;
        const key = `${name}-${type}`;

        if (parsedData[key]) {
            parsedData[key].count++;
        } else {
            parsedData[key] = { name, type, count: 1 };
        }
    }

    return Object.values(parsedData);
}

// Main function to render the Sankey chart
export function SankeyChart(
    {   // nodes and links defining the graph
        nodes, // an iterable of node objects (typically [{id}, …]); implied by links if missing
        links, // an iterable of link objects (typically [{source, target}, …])
    }: { nodes?: d3Sankey.SankeyNodeMinimal<{ id: string }, any>[]; links: d3Sankey.SankeyLinkMinimal<any, any>[] },
    {   // configuration options with defaults
        format = d3.format(","), // a function or format specifier for values in titles
        align = "justify", // convenience shorthand for nodeAlign
        nodeGroup, // given d in nodes, returns an (ordinal) value for color
        nodeGroups = [], // an array of ordinal values representing the node groups
        nodeLabel, // given d in (computed) nodes, text to label the associated rect
        nodeTitle = (n) => `${n.index}`, // given d in (computed) nodes, hover text
        nodeAlign = getNodeAlignFunction(align), // Sankey node alignment strategy: left, right, justify, center
        nodeWidth = 15, // width of node rects
        nodePadding = 10, // vertical separation between adjacent nodes
        nodeLabelPadding = 6, // horizontal separation between node and label
        nodeStroke = "currentColor", // stroke around node rects
        nodeStrokeWidth = 1, // width of stroke around node rects, in pixels
        nodeStrokeOpacity = 1, // opacity of stroke around node rects
        nodeStrokeLinejoin = 1, // line join for stroke around node rects
        linkSource = (l)  => l.source, // given d in links, returns a node identifier string
        linkTarget = (l) => l.target, // given d in links, returns a node identifier string
        linkValue = (l) => l.value, // given d in links, returns the quantitative value
        linkPath = d3Sankey.sankeyLinkHorizontal(), // given d in (computed) links, returns the SVG path
        linkTitle = (l) => 
            `${l.source.id} => ${l.target.id}\n${format(l.value)} commits`, // given d in (computed) links
        linkColor = "source-target", // source, target, source-target, or static color
        linkStrokeOpacity = 0.5, // link stroke opacity
        linkMixBlendMode = "normal", // link blending mode
        colors = d3.schemeTableau10, // array of colors
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        marginTop = 5, // top margin, in pixels
        marginRight = 1, // right margin, in pixels
        marginBottom = 5, // bottom margin, in pixels
        marginLeft = 1, // left margin, in pixels
    }: {    format?: (n: number) => string ; 
            align?: AlignType; 
            nodeId?: (n: d3Sankey.SankeyNodeMinimal<{ id: string }, any>) => number | undefined;
            nodeGroup?: (n: d3Sankey.SankeyNodeMinimal<any, any>) => number; 
            nodeGroups: Iterable<number>;
            nodeLabel?: (n: d3Sankey.SankeyNodeMinimal<any, any>) => string; 
            nodeTitle?: (n: d3Sankey.SankeyNodeMinimal<any, any>) => string; 
            nodeAlign?: (node: d3Sankey.SankeyNodeMinimal<any, any>, n: number) => number; 
            nodeWidth?: number;
            nodePadding?: number;
            nodeLabelPadding?: number; 
            nodeStroke?:  string; 
            nodeStrokeWidth: number;
            nodeStrokeOpacity: number; 
            nodeStrokeLinejoin: number; 
            linkSource?: (l: d3Sankey.SankeyLinkMinimal<any, any>) => string; 
            linkTarget?: (l: d3Sankey.SankeyLinkMinimal<any, any>) => string; 
            linkValue?: (l: d3Sankey.SankeyLinkMinimal<any, any>) => number; 
            linkPath?: d3.Link<any, d3Sankey.SankeyLinkMinimal<any, any>, [number, number]>;
            linkTitle?: (l: d3Sankey.SankeyLinkMinimal<any, any>) => string;
            linkColor?: string; 
            linkStrokeOpacity?:number; 
            linkMixBlendMode?: string;
            colors: readonly string[];
            width?: number;
            height?: number;
            marginTop?: number;
            marginRight?: number;
            marginBottom?: number;
            marginLeft?: number;
        }
) {
    //Mapping the soruce, target and value of the links
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    const LV = d3.map(links, linkValue);

    // If nodes is not defined, create a new array of nodes
    if (nodes === undefined) {
        nodes = Array.from(d3.union(LS, LT), (id, index) => ({ id, index, x0: 0, x1: 0, y0: 0, y1: 0 }));
    }

    // Mapping the nodes to their id
    const N = d3.map(nodes as d3Sankey.SankeyNode<{ id: string }, any>[],(n) => n.id).map(intern);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);

    // Construct the links
    links = d3.map(links, (_, i) => ({
        source: LS[i],
        target: LT[i],
        value: LV[i],
    }));

    // Ignore a group-based linkColor option if no groups are specified.
    if (!G && ["source", "target", "source-target"].includes(linkColor))
        linkColor = "currentColor";

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = G;

    // Construct the scales.
    const color = d3.scaleOrdinal(nodeGroups, colors);

    // Computing the layout of the diagram using d3Sankey
    d3Sankey
        .sankey<{ id: string }, any>()
        .nodeId((d) => d.id)
        .nodeAlign(nodeAlign)
        .nodeWidth(nodeWidth)
        .nodePadding(nodePadding)
        .extent([
            [marginLeft, marginTop],
            [width - marginRight, height - marginBottom],
        ])({ nodes: nodes as d3Sankey.SankeyNode<{ id: string }, any>[], links });

    // Compute titles and labels using layout nodes, so as to access aggregate values.
    if (typeof format !== "function") format = d3.format(format);
    const Tl =
		nodeLabel === undefined
		    ? N
		    : nodeLabel == null
		        ? null
		        : d3.map(nodes, nodeLabel);
    const Tt = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const Lt = linkTitle == null ? null : d3.map(links, linkTitle);

    // A unique identifier for clip paths (to avoid conflicts).
    const uid = `O-${Math.random().toString(16).slice(2)}`;

    const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const node = svg
        .append("g")
        .attr("stroke", nodeStroke)
        .attr("stroke-width", nodeStrokeWidth)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-linejoin", nodeStrokeLinejoin)
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", (d) => d.x0 ?? 0)//THE 0 IS ADDED JUST TO NOT HAVE UNDEFINED. CHANGE LATER
        .attr("y", (d) => d.y0 ?? 0)//THE 0 IS ADDED JUST TO NOT HAVE UNDEFINED. CHANGE LATER
        .attr("height", (d) => (d.y1 ?? 0) - (d.y0 ?? 0)) //THE 0 IS ADDED JUST TO NOT HAVE UNDEFINED. CHANGE LATER
        .attr("width", (d) => (d.x1 ?? 0) - (d.x0 ?? 0));//THE 0 IS ADDED JUST TO NOT HAVE UNDEFINED. CHANGE LATER

    if (G) node.attr("fill", ({ index: i }) => color(i !== undefined ? G[i] : undefined));
    if (Tt) node.append("title").text(({ index: i }) => i !== undefined ? Tt[i] : null);

    const link = svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", linkStrokeOpacity)
        .selectAll("g")
        .data(links)
        .join("g")
        .style("mix-blend-mode", linkMixBlendMode);

    if (linkColor === "source-target")
        link
            .append("linearGradient")
            .attr("id", (d) => `${uid}-link-${d.index}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", (d) => d.source.x1)
            .attr("x2", (d) => d.target.x0)
            .call((gradient) =>
                gradient
                    .append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", ({ source: { index: i } }) => color(G !== null ? G[i] : undefined))
            )
            .call((gradient) =>
                gradient
                    .append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", ({ target: { index: i } }) => color(G !== null ? G[i] : undefined))
            );

    link
        .append("path")
        .attr("d", linkPath)
        .attr(
            "stroke",
            linkColor === "source-target"
                ? ({ index: i }) => `url(#${uid}-link-${i})`
                : linkColor === "source"
                    ? ({ source: { index: i } }) => color(G !== null ? G[i] : undefined)
                    : linkColor === "target"
                        ? ({ target: { index: i } }) => color(G !== null ? G[i] : undefined)
                        : linkColor
        )
        .attr("stroke-width", ({ width }) => Math.max(1, width ?? 640))
        .call(
            Lt
                ? (path) => path.append("title").text(({ index: i }) => i !== undefined ? Lt[i] : null)
                : () => {}
        );

    if (Tl)
        svg
            .append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("fill", "currentColor")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", (d) =>
                (d.x0 ?? 0) < width / 2 ? (d.x1 ?? 0) + nodeLabelPadding : (d.x0 ?? 0) - nodeLabelPadding
            )
            .attr("y", (d) => ((d.y1 ?? 0) + (d.y0 ?? 0)) / 2)//THE 0 IS ADDED JUST TO NOT HAVE UNDEFINED. CHANGE LATER
            .attr("dy", "0.35em")
            .attr("text-anchor", (d) => ((d.x0 ?? 0) < width / 2 ? "start" : "end"))//THE 0 IS ADDED 
            // JUST TO NOT HAVE UNDEFINED. CHANGE LATER
            .text(({ index: i }) => i !== undefined ? Tl[i] : null);

    // hover effect
    node
        .on("mouseover", function () {
            d3.select(this).attr("stroke", "black");
            d3.select(this).attr("stroke-width", 3);
            d3.select(this).attr("stroke-opacity", 1);
            d3.select(this).attr("stroke-linejoin", "round");
        })
        .on("mouseout", function () {
            d3.select(this).attr("stroke", nodeStroke);
            d3.select(this).attr("stroke-width", nodeStrokeWidth);
            d3.select(this).attr("stroke-opacity", nodeStrokeOpacity);
            d3.select(this).attr("stroke-linejoin", nodeStrokeLinejoin);
        });

    link
        .on("mouseover", function () {
            d3.select(this).attr("stroke", "black");
            d3.select(this).attr("stroke-opacity", 1);
        })
        .on("mouseout", function () {
            d3.select(this).attr("stroke", linkColor);
            d3.select(this).attr("stroke-opacity", linkStrokeOpacity);
        });


    function intern(val: any) {
        return val !== null && typeof val === "object"
            ? val.valueOf()
            : val;
    }

    const svgNode = svg.node();
    if (svgNode) {
        return Object.assign(svgNode, { scales: { color } });
    }
    return null;
}

export const SankeyChartBuild: FC<SankeyChartBuildProps> = 
    ({ data }:{data: Repository[]}) => {
        useEffect(() => {
            if (!data) {
                return;
            }
            const sankeyData = parseData(data);
            const links = sankeyData.map((d) => ({
                source: d.name,
                target: d.type,
                value: d.count,
            }));

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

