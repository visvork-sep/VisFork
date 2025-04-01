/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { SankeyData } from "@VisInterfaces/SankeyData";
import {
    sankeyLeft,
    sankeyRight,
    sankeyCenter,
    sankeyJustify,
    SankeyNodeMinimal,
    SankeyLinkMinimal,
    sankeyLinkHorizontal,
    SankeyNode,
    sankey
} from "d3-sankey";
import {
    schemeTableau10,
    Link,
    map,
    union,
    scaleOrdinal,
    select,
    format as d3Format,
    create,
} from "d3";

interface ParsedDataItem {
    name: string;
    type: string;
    count: number;
};

//function which helpts define the nodeAlign values 
type AlignType = "justify" | "left" | "right" | "center";

// Function to map string to d3-sankey alignment functions to define the nodeAlign value
const getNodeAlignFunction = (align: AlignType) => {
    switch (align) {
        case "left":
            return sankeyLeft;
        case "right":
            return sankeyRight;
        case "center":
            return sankeyCenter;
        case "justify":
        default:
            return sankeyJustify; // Default to justify
    }
};

// Function to parse the data and return an array of ParsedDataItem
export function parseData({ commitData }: SankeyData): ParsedDataItem[] {
    const parsedData: Record<string, ParsedDataItem> = {};

    // Loop through the data and create a key for each unique combination of repo and commit_type

    for (const dataPoint of commitData) {
        const name = dataPoint.repo;
        const type = dataPoint.commitType;
        const key = `${name}-${type}`;

        // If the key already exists, increment the count, otherwise create a new entry
        if (parsedData[key]) {
            parsedData[key].count++;
        } else {
            parsedData[key] = { name, type, count: 1 };
        }
    }

    // Return the values of the parsedData object to be used as the data for the Sankey chart
    return Object.values(parsedData);
}

// Main function to render the Sankey chart
export function SankeyChart(
    {   // nodes and links defining the graph
        nodes, // an iterable of node objects (typically [{id}, …]); implied by links if missing
        links, // an iterable of link objects (typically [{source, target}, …])
    }: { nodes?: SankeyNodeMinimal<{ id: string; }, any>[]; links: SankeyLinkMinimal<any, any>[]; },
    {   // configuration options with defaults
        format = d3Format(","), // a function or format specifier for values in titles
        align = "justify", // convenience shorthand for nodeAlign
        nodeGroup, // given n in nodes, returns an (ordinal) value for color
        nodeGroups = [], // an array of ordinal values representing the node groups
        nodeLabel, // given n in (computed) nodes, text to label the associated rect
        nodeAlign = getNodeAlignFunction(align), // Sankey node alignment strategy: left, right, justify, center
        nodeWidth = 15, // width of node rects
        nodePadding = 10, // vertical separation between adjacent nodes
        nodeLabelPadding = 6, // horizontal separation between node and label
        nodeStroke = "currentColor", // stroke around node rects
        nodeStrokeWidth = 1, // width of stroke around node rects, in pixels
        nodeStrokeOpacity = 1, // opacity of stroke around node rects
        nodeStrokeLinejoin = 1, // line join for stroke around node rects
        linkSource = (l) => l.source, // given l in links, returns a node identifier string
        linkTarget = (l) => l.target, // given l in links, returns a node identifier string
        linkValue = (l) => l.value, // given l in links, returns the quantitative value
        linkPath = sankeyLinkHorizontal(), // given d in (computed) links, returns the SVG path
        linkTitle = (l) =>
            `${l.source.id} => ${l.target.id}\n${format(l.value)} commits`, // given d in (computed) links
        linkColor = "source-target", // source, target, source-target, or static color
        linkStrokeOpacity = 0.5, // link stroke opacity
        linkMixBlendMode = "normal", // link blending mode
        colors = schemeTableau10, // array of colors
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        marginTop = 5, // top margin, in pixels
        marginRight = 1, // right margin, in pixels
        marginBottom = 5, // bottom margin, in pixels
        marginLeft = 1, // left margin, in pixels
    }: {
        format?: (n: number) => string;
        align?: AlignType;
        nodeId?: (n: SankeyNodeMinimal<{ id: string; }, any>) => number | undefined;
        nodeGroup?: (n: SankeyNodeMinimal<any, any>) => number;
        nodeGroups: Iterable<number>;
        nodeLabel?: (n: SankeyNodeMinimal<any, any>) => string;
        nodeAlign?: (node: SankeyNodeMinimal<any, any>, n: number) => number;
        nodeWidth?: number;
        nodePadding?: number;
        nodeLabelPadding?: number;
        nodeStroke?: string;
        nodeStrokeWidth: number;
        nodeStrokeOpacity: number;
        nodeStrokeLinejoin: number;
        linkSource?: (l: SankeyLinkMinimal<any, any>) => string;
        linkTarget?: (l: SankeyLinkMinimal<any, any>) => string;
        linkValue?: (l: SankeyLinkMinimal<any, any>) => number;
        linkPath?: Link<any, SankeyLinkMinimal<any, any>, [number, number]>;
        linkTitle?: (l: SankeyLinkMinimal<any, any>) => string;
        linkColor?: string;
        linkStrokeOpacity?: number;
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
    const LS = map(links, linkSource).map(intern);
    const LT = map(links, linkTarget).map(intern);
    const LV = map(links, linkValue);

    // If nodes is not defined, create a new array of nodes
    if (nodes === undefined) {
        nodes = Array.from(union(LS, LT), (id, index) => ({ id, index, x0: 0, x1: 0, y0: 0, y1: 0 }));
    }

    // Mapping the nodes to their id
    const N = map(nodes as SankeyNode<{ id: string; }, any>[], (n) => n.id).map(intern);
    const G = nodeGroup == null ? null : map(nodes, nodeGroup).map(intern);

    // Construct the links
    links = map(links, (_, i) => ({
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
    const color = scaleOrdinal(nodeGroups, colors);

    // Computing the layout of the diagram using 

    sankey<{ id: string; }, any>()
        .nodeId((d) => d.id)
        .nodeAlign(nodeAlign)
        .nodeWidth(nodeWidth)
        .nodePadding(nodePadding)
        .extent([
            [marginLeft, marginTop],
            [width - marginRight, height - marginBottom],
        ])({ nodes: nodes as SankeyNode<{ id: string; }, any>[], links });

    // Compute titles and labels using layout nodes, so as to access aggregate values.
    if (typeof format !== "function") format = d3Format(format);
    const Tl =
        nodeLabel === undefined
            ? N
            : nodeLabel == null
                ? null
                : map(nodes, nodeLabel);
    const Lt = linkTitle == null ? null : map(links, linkTitle);

    // A unique identifier for clip paths (to avoid conflicts).
    const uid = `O-${Math.random().toString(16).slice(2)}`;

    // Constructing the SVG element.
    const svg = create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    //Configure the original node looks 
    const node = svg
        .append("g")
        .attr("stroke", nodeStroke)
        .attr("stroke-width", nodeStrokeWidth)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-linejoin", nodeStrokeLinejoin)
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", (d) => d.x0 ?? 0)
        .attr("y", (d) => d.y0 ?? 0)
        .attr("height", (d) => (d.y1 ?? 0) - (d.y0 ?? 0))
        .attr("width", (d) => (d.x1 ?? 0) - (d.x0 ?? 0));

    //Coloring the nodes
    if (G) node.attr("fill", ({ index: i }) => color(i !== undefined ? G[i] : undefined));

    //Configure the original look of the links 
    const link = svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", linkStrokeOpacity)
        .selectAll("g")
        .data(links)
        .join("g")
        .style("mix-blend-mode", linkMixBlendMode);

    //Coloring the links 
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

    //Creating a gradient between the source and target nodes
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
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                : () => { }
        );

    //Setting up the label of the nodes
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

    //Setting up the hovering effect for the nodes 
    node
        .on("mouseover", function () {
            select(this).attr("stroke", "black");
            select(this).attr("stroke-width", 3);
            select(this).attr("stroke-opacity", 1);
            select(this).attr("stroke-linejoin", "round");
        })
        .on("mouseout", function () {
            select(this).attr("stroke", nodeStroke);
            select(this).attr("stroke-width", nodeStrokeWidth);
            select(this).attr("stroke-opacity", nodeStrokeOpacity);
            select(this).attr("stroke-linejoin", nodeStrokeLinejoin);
        });

    //Setting up the hovering efect for the links 
    link
        .on("mouseover", function () {
            select(this).attr("stroke", "black");
            select(this).attr("stroke-opacity", 1);
        })
        .on("mouseout", function () {
            select(this).attr("stroke", linkColor);
            select(this).attr("stroke-opacity", linkStrokeOpacity);
        });

    //Function to convert the value to a string
    function intern(val: any) {
        return val !== null && typeof val === "object"
            ? val.valueOf()
            : val;
    }

    //Return the SVG element
    const svgNode = svg.node();
    if (svgNode) {
        return Object.assign(svgNode, { scales: { color } });
    }
    return null;
}

// SankeyChartBuild component
export function SankeyDiagram(data: SankeyData) {
    useEffect(() => {

        if (!data) {
            return;
        }

        // show user when no data is selected
        if (!data?.commitData?.length) {
            select("#sankey-diagram").selectAll("*").remove();
            select("#sankey-diagram")
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
                colors: schemeTableau10,
            }
        );

        // Clear previous chart and append new one
        select("#sankey-diagram").selectAll("*").remove();
        select("#sankey-diagram").append(() => chart);
    }, [data]);

    return <div id="sankey-diagram" style={{ width: "100%", height: "400px" }}></div>;
};

