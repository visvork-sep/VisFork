import { useEffect, useRef, useState } from "react";
import { useTheme, FormControl, Select, Text } from "@primer/react";
import { CollabGraphData } from "@VisInterfaces/CollabGraphData";
import {
    SimulationNodeDatum,
    SimulationLinkDatum,
    select,
    forceLink,
    forceManyBody,
    forceCenter,
    drag,
    symbol,
    symbolSquare,
    forceSimulation
} from "d3";

// Graph node type: author or repo
interface Node extends SimulationNodeDatum {
    id: string;
    displayText: string;
    group: "author" | "repo";
    // Radius for node size
    radius?: number;
    // Commit count
    commits?: number;
}

// Graph link type: connects author to repo
interface Link extends SimulationLinkDatum<Node> {
    source: string | Node;
    target: string | Node;
}

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
    const allDates = Array.from(
        new Set(commitData.map((entry) => entry.date.split("T")[0]))
    ).sort();

    // Autoplay effect
    useEffect(() => {
        // Currently advances on a 100ms interval
        if (isPlaying) {
            if (currentDateIndex === allDates.length - 1) {
                setCurrentDateIndex(0);
            }
            playInterval.current = setInterval(() => {
                setCurrentDateIndex((prev) => {
                    if (prev < allDates.length - 1) {
                        return prev + 1;
                    } else {
                        setIsPlaying(!isPlaying);
                        return allDates.length - 1;
                    }
                }
                );
            }, 500 / playSpeed);
        } else {
            if (playInterval.current) {
                clearInterval(playInterval.current);
            }
        }

        return () => {
            if (playInterval.current) {
                clearInterval(playInterval.current);
            }
        };
    }, [isPlaying, allDates.length, playSpeed]);

    // Main visualization
    useEffect(() => {
        // Skips if SVG is not yet mounted
        if (!svgRef.current) return;

        // Filters commit data until the current date selected in the slider
        const visibleCommits = commitData.filter((commit) => {
            const commitDate = commit.date.split("T")[0];
            return commitDate <= allDates[currentDateIndex];
        });

        // Create unique author and repo sets and links between them
        const authors = new Set<string>();
        const repos = new Set<string>();
        const links: Link[] = [];

        const authorCommitCounts: Record<string, number> = {};
        const repoCommitCounts: Record<string, number> = {};
        const authorNames: Record<string, string> = {};
        // Make sure each set of authors and repos is unique
        visibleCommits.forEach((entry) => {
            authors.add(entry.login); // logins are unique, but author names are not
            repos.add(entry.repo);
            links.push({
                source: entry.login,
                target: entry.repo,
            });

            authorNames[entry.login] = entry.author; // Store author names for display

            // Keep track of commit counts for scaling nodes
            authorCommitCounts[entry.login] = (authorCommitCounts[entry.login] || 0) + 1;
            repoCommitCounts[entry.repo] = (repoCommitCounts[entry.repo] || 0) + 1;
        });

        // Create nodes
        const nodes: Node[] = [
            ...Array.from(authors).map((author) => ({
                id: author,
                displayText: authorNames[author],
                group: "author" as const,
                // Scale nodes based on commit count
                radius: 4 + Math.log(authorCommitCounts[author] || 1) * 2,
                commits: authorCommitCounts[author] || 0,
            })),
            ...Array.from(repos).map((repo) => ({
                id: repo,
                displayText: repo,
                group: "repo" as const,
                // Scale nodes based on commit count
                radius: 4 + Math.log(repoCommitCounts[repo] || 1) * 2,
                commits: repoCommitCounts[repo] || 0,
            })),
        ];

        //  force graph setup
        const svg = select(svgRef.current);
        const container = svg.node()?.parentElement as HTMLElement;
        const width = container.clientWidth;
        const height = 600;
        // Clear previous render
        svg.selectAll("*").remove();

        // Force simulation to position nodes nicely
        const simulation = forceSimulation<Node>(nodes)
            // Connected nodes are attracted to each other
            .force("link", forceLink<Node, Link>(links).id((d) => d.id).distance(120))
            // Makes nodes repel
            .force("charge", forceManyBody().strength(-20))
            // Centers the graph
            .force("center", forceCenter(width / 2, height / 2))
            // Determines how quickly the simulation slows down (default is 0.0228)
            .alphaDecay(0.025);

        // Draw links as lines
        const link = svg
            .append("g")
            .attr("stroke", "#aaa")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke-width", 1.5);

        // Draw author nodes as blue circles
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
            // Open github author page on double click
            .on("dblclick", (_event, d) => {
                const url = `https://github.com/${d.id}`;
                window.open(url, "_blank");
            })
            // Makes nodes draggable
            .call(
                drag<SVGCircleElement, Node>()
                    .on("start", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    })
            );

        // Draw repository nodes as orange squares
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
                const path = symbol().type(symbolSquare).size(Math.PI * r * r);
                return path();
            })
            .attr("fill", "#ff7f0e")
            // Open github repository page on double click
            .on("dblclick", (_event, d) => {
                const url = `https://github.com/${d.id}`;
                window.open(url, "_blank");
            })
            // Makes nodes draggable        
            .call(
                drag<SVGPathElement, Node>()
                    .on("start", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    })
            );

        // Add labels above nodes
        const label = svg
            .append("g")
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            // Shorten long names
            .text((d) => d.displayText.length > 16 ? d.displayText.slice(0, 16) + "…" : d.displayText)
            .attr("font-size", "10px")
            // Position text slightly above the node
            .attr("dy", (d) => `-${(d.radius ?? 8) + 4}px`)
            .attr("text-anchor", "middle")
            // Allow clicks to pass through
            .attr("pointer-events", "none")
            .attr("fill", textColor)
            // Make labels non-selectable
            .attr("pointer-events", "none")
            .style("user-select", "none");

        // Add toolttip to show full name and number of commits on hover
        [...authorNodes.nodes(), ...repoNodes.nodes()].forEach((el, i) => {
            const d = nodes[i];
            select(el).append("title").text(`${d.id}\nCommits: ${d.commits ?? 0}`);
        });

        // Tick function: updates positions of links, nodes, and labels every tick
        simulation.on("tick", () => {
            // Clamp positions so nodes stay within the viewbox
            nodes.forEach((d) => {
                d.x = Math.max(18, Math.min(width - 18, d.x ?? 0));
                d.y = Math.max(18, Math.min(height - 10, d.y ?? 0));
            });

            // Update link lines
            link
                .attr("x1", (d) => (typeof d.source === "object" ? d.source.x ?? 0 : 0))
                .attr("y1", (d) => (typeof d.source === "object" ? d.source.y ?? 0 : 0))
                .attr("x2", (d) => (typeof d.target === "object" ? d.target.x ?? 0 : 0))
                .attr("y2", (d) => (typeof d.target === "object" ? d.target.y ?? 0 : 0));

            // Update node and label positions
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
            // Top-right corner
            .attr("transform", "translate(20, 20)");

        // Author (blue circle)
        legend
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6)
            .attr("fill", "#1f77b4");

        legend
            .append("text")
            .attr("x", 12)
            .attr("y", 4)
            .text("Author")
            .style("font-size", "12px")
            .attr("fill", textColor);

        // Repository (orange square)
        legend
            .append("path")
            .attr("d", symbol().type(symbolSquare).size(120)())
            .attr("transform", "translate(0, 20)")
            .attr("fill", "#ff7f0e");

        legend
            .append("text")
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
                ref={svgRef}
                width="100%"
                height="600"
                style={{ border: "1px solid #ccc" }}
            />
        </>
    );
}

export default CollaborationGraph;
