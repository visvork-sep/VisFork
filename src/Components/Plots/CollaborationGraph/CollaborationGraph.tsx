import { useEffect, useRef, useState } from "react";
import { useTheme, FormControl, Select, Text } from "@primer/react";
import { CollabGraphData } from "@VisInterfaces/CollabGraphData";
import {
    select,
    symbol,
    symbolSquare
} from "d3";
import {
    addDragBehavior,
    addToolTips,
    advanceAutoPlay,
    createNodes,
    createSimulation,
    filterUniques,
    getUniqueDates,
    getVisibleCommits,
    Link
} from "./utils";




function CollaborationGraph({ commitData }: CollabGraphData) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const { colorMode } = useTheme();
    const textColor = colorMode === "dark" ? "white" : "black";

    // Timeline bar
    const [currentDateIndex, setCurrentDateIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playInterval = useRef<NodeJS.Timeout | null>(null);
    const [playSpeed, setPlaySpeed] = useState(1);

    useEffect(() => {
        setCurrentDateIndex(0);
        setIsPlaying(false);
    }, [commitData]);

    // Get all unique commit dates
    const allDates = getUniqueDates(commitData);

    // Autoplay effect
    useEffect(() => {
        advanceAutoPlay(isPlaying,
            allDates,
            currentDateIndex,
            setCurrentDateIndex,
            playInterval,
            setIsPlaying,
            playSpeed);
    }, [isPlaying, allDates.length, playSpeed]);

    // Main visualization
    useEffect(() => {
        if (!svgRef.current) return;

        const currentDate = allDates[currentDateIndex];
        const visibleCommits = getVisibleCommits(commitData, currentDate);

        const authors = new Set<string>();
        const repos = new Set<string>();
        const links: Link[] = [];

        const authorCommitCounts: Record<string, number> = {};
        const repoCommitCounts: Record<string, number> = {};
        const authorNames: Record<string, string> = {};

        filterUniques(visibleCommits, authors, repos, links, authorNames, authorCommitCounts, repoCommitCounts);
        const nodes = createNodes(authors, repos, authorCommitCounts, repoCommitCounts, authorNames);

        const svg = select(svgRef.current);
        const container = svg.node()?.parentElement as HTMLElement;
        const width = container.clientWidth;
        const height = 600;

        svg.selectAll("*").remove();

        const simulation = createSimulation(nodes, links, width, height);

        // ... draw graph using the returned nodes and links
        // e.g. addDragBehavior(...), addTooltips(...), etc.

        // Draw links
        const link = svg
            .append("g")
            .attr("stroke", "#aaa")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke-width", 1.5);

        // Draw authors as circles
        const authorNodes = svg
            .append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes.filter((d) => d.group === "author"))
            .enter()
            .append("circle")
            .attr("r", (d) => d.radius ?? 8)
            .attr("fill", "#1f77b4")
            .attr("data-testid", "author-circle")
            .on("dblclick", (_event, d) => {
                const url = `https://github.com/${d.id}`;
                window.open(url, "_blank");
            });

        addDragBehavior(authorNodes, simulation);

        // Draw repos as squares
        const repoNodes = svg
            .append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(nodes.filter((d) => d.group === "repo"))
            .enter()
            .append("path")
            .attr("d", (d) => {
                const r = d.radius ?? 8;
                return symbol().type(symbolSquare).size(Math.PI * r * r)();
            })
            .attr("fill", "#ff7f0e")
            .attr("data-testid", "repo-square")
            .on("dblclick", (_event, d) => {
                const url = `https://github.com/${d.id}`;
                window.open(url, "_blank");
            });

        addDragBehavior(repoNodes, simulation);

        // Add labels
        const label = svg
            .append("g")
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .text((d) => d.displayText.length > 16 ? d.displayText.slice(0, 16) + "…" : d.displayText)
            .attr("font-size", "10px")
            .attr("dy", (d) => `-${(d.radius ?? 8) + 4}px`)
            .attr("text-anchor", "middle")
            .attr("pointer-events", "none")
            .attr("fill", textColor)
            .style("user-select", "none");

        // Add tooltips to both author and repo nodes
        addToolTips(authorNodes, repoNodes, nodes);

        // Tick behavior
        simulation.on("tick", () => {
            nodes.forEach((d) => {
                d.x = Math.max(18, Math.min(width - 18, d.x ?? 0));
                d.y = Math.max(18, Math.min(height - 10, d.y ?? 0));
            });

            link
                .attr("x1", (d) => (typeof d.source === "object" ? d.source.x ?? 0 : 0))
                .attr("y1", (d) => (typeof d.source === "object" ? d.source.y ?? 0 : 0))
                .attr("x2", (d) => (typeof d.target === "object" ? d.target.x ?? 0 : 0))
                .attr("y2", (d) => (typeof d.target === "object" ? d.target.y ?? 0 : 0));

            authorNodes
                .attr("cx", (d) => d.x ?? 0)
                .attr("cy", (d) => d.y ?? 0);

            repoNodes
                .attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);

            label
                .attr("x", (d) => d.x ?? 0)
                .attr("y", (d) => d.y ?? 0);
        });

        // Add legend
        const legend = svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", "translate(20, 20)");

        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6)
            .attr("fill", "#1f77b4");

        legend.append("text")
            .attr("x", 12)
            .attr("y", 4)
            .text("Author")
            .style("font-size", "12px")
            .attr("fill", textColor);

        legend.append("path")
            .attr("d", symbol().type(symbolSquare).size(120)())
            .attr("transform", "translate(0, 20)")
            .attr("fill", "#ff7f0e");

        legend.append("text")
            .attr("x", 12)
            .attr("y", 24)
            .text("Repository")
            .style("font-size", "12px")
            .attr("fill", textColor);
    }, [currentDateIndex, allDates]);


    return (
        <>
            {/* Centered current date above the slider */}
            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <Text weight="semibold">
                    {allDates.length === 0
                        ? "No data selected"
                        : new Date(allDates[currentDateIndex]).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                </Text>
            </div>
            {/* UI container for date display, slider, and play/pause button */}
            <div style={{
                marginBottom: "1rem", display: "flex", alignItems: "center",
                gap: "1rem"
            }}>

                {/* Displays date in a readable format */}
                <Text>
                    {allDates.length === 0
                        ? "No data selected"
                        : new Date(allDates[0]).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                </Text>

                {/* Range slider to manually scrub through timeline */}
                <input
                    type="range"
                    min={0}
                    max={allDates.length - 1}
                    value={currentDateIndex}
                    onChange={(e) => setCurrentDateIndex(parseInt(e.target.value))}
                    style={{ width: "100%" }}
                />

                {/* Displays date in a readable format */}
                <Text>
                    {allDates.length === 0
                        ? "No data selected"
                        : new Date(allDates[allDates.length - 1]).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                </Text>

                {/* Play/Pause button */}
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                        borderRadius: "12px",
                        padding: "6px 14px",
                        border: "none",
                        fontWeight: "normal",
                        color: "black",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                    }}
                >
                    {/* Updates label based on play state */}
                    {isPlaying ? "Pause" : "Play"}
                </button>

                <FormControl sx={{ flexShrink: 0 }}>
                    <FormControl.Label>Select speed</FormControl.Label>
                    <Select onChange={(e) => {
                        setPlaySpeed(parseFloat(e.target.value));
                    }}>
                        <Select.Option value="1">Speed 1x</Select.Option>
                        <Select.Option value="1.5">Speed 1.5x</Select.Option>
                        <Select.Option value="2">Speed 2x</Select.Option>
                        <Select.Option value="3">Speed 3x</Select.Option>
                        <Select.Option value="5">Speed 5x</Select.Option>
                        <Select.Option value="10">Speed 10x</Select.Option>
                    </Select>
                </FormControl>

            </div>

            {/* SVG element where graph gets rendered */}
            <svg
                data-testid="collab-graph"
                ref={svgRef}
                width="100%"
                height="600"
                style={{ border: "1px solid #ccc" }}
            />
        </>
    );


}

export default CollaborationGraph;
