import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { CollabGraphData } from "@VisInterfaces/CollabGraphData";

// Graph node type: author or repo
interface Node extends d3.SimulationNodeDatum {
    id: string;
    group: "author" | "repo";
    // Radius for node size
    radius?: number;
    // Commit count
    commits?: number;
}

// Graph link type: connects author to repo
interface Link extends d3.SimulationLinkDatum<Node> {
    source: string | Node;
    target: string | Node;
}

function CollaborationGraph({ commitData }: CollabGraphData) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const width = 800;
    const height = 600;

    // Timeline bar
    const [currentDateIndex, setCurrentDateIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playInterval = useRef<NodeJS.Timeout | null>(null);

    // Get all unique commit dates
    const allDates = Array.from(
        new Set(commitData.map((entry) => entry.date.split("T")[0]))
    ).sort();

    // Autoplay effect
    useEffect(() => {
        // Currently advances on a 100ms interval
        if (isPlaying) {
            playInterval.current = setInterval(() => {
                setCurrentDateIndex((prev) =>
                    prev < allDates.length - 1 ? prev + 1 : 0
                );
            }, 100);
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
    }, [isPlaying, allDates.length]);

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

        // Make sure each set of authors and repos is unique
        visibleCommits.forEach((entry) => {
            authors.add(entry.author);
            repos.add(entry.repo);
            links.push({
                source: entry.author,
                target: entry.repo,
            });

            // Keep track of commit counts for scaling nodes
            authorCommitCounts[entry.author] = (authorCommitCounts[entry.author] || 0) + 1;
            repoCommitCounts[entry.repo] = (repoCommitCounts[entry.repo] || 0) + 1;
        });

        // Create nodes
        const nodes: Node[] = [
            ...Array.from(authors).map((author) => ({
                id: author,
                group: "author" as const,
                // Scale nodes based on commit count
                radius: 4 + Math.log(authorCommitCounts[author] || 1) * 2,
                commits: authorCommitCounts[author] || 0,
            })),
            ...Array.from(repos).map((repo) => ({
                id: repo,
                group: "repo" as const,
                // Scale nodes based on commit count
                radius: 4 + Math.log(repoCommitCounts[repo] || 1) * 2,
                commits: repoCommitCounts[repo] || 0,
            })),
        ];

        // D3 force graph setup
        const svg = d3.select(svgRef.current);
        // Clear previous render
        svg.selectAll("*").remove();

        // Force simulation to position nodes nicely
        const simulation = d3
            .forceSimulation<Node>(nodes)
            // Connected nodes are attracted to each other
            .force("link", d3.forceLink<Node, Link>(links).id((d) => d.id).distance(120))
            // Makes nodes repel
            .force("charge", d3.forceManyBody().strength(-20))
            // Centers the graph
            .force("center", d3.forceCenter(width / 2, height / 2))
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
                d3.drag<SVGCircleElement, Node>()
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
                const path = d3.symbol().type(d3.symbolSquare).size(Math.PI * r * r);
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
                d3.drag<SVGPathElement, Node>()
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
            .text((d) => d.id)
            // Shorten long names
            .text((d) => d.id.length > 12 ? d.id.slice(0, 12) + "…" : d.id)
            .attr("font-size", "10px")
            // Position text slightly above the node
            .attr("dy", (d) => `-${(d.radius ?? 8) + 4}px`)
            .attr("text-anchor", "middle")
            // Allow clicks to pass through
            .attr("pointer-events", "none")
            .attr("fill", "#333")
            // Make labels non-selectable
            .attr("pointer-events", "none")
            .style("user-select", "none");

        // Add toolttip to show full name and number of commits on hover
        [...authorNodes.nodes(), ...repoNodes.nodes()].forEach((el, i) => {
            const d = nodes[i];
            d3.select(el).append("title").text(`${d.id}\nCommits: ${d.commits ?? 0}`);
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
            .attr("transform", `translate(${width - 85}, 20)`);

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
            .attr("fill", "#333");

        // Repository (orange square)
        legend
            .append("path")
            .attr("d", d3.symbol().type(d3.symbolSquare).size(120)())
            .attr("transform", "translate(0, 20)")
            .attr("fill", "#ff7f0e");

        legend
            .append("text")
            .attr("x", 12)
            .attr("y", 24)
            .text("Repository")
            .style("font-size", "12px")
            .attr("fill", "#333");
    }, [currentDateIndex, allDates]);

    return (
        <>
            {/* UI container for date display, slider, and play/pause button */}
            <div style={{
                marginBottom: "1rem", display: "flex", alignItems: "center",
                gap: "1rem"
            }}>

                {/* Displays date in a readable format */}
                <span style={{ fontWeight: "normal", color: "black" }}>
                    {allDates.length === 0
                        ? "No data selected"
                        : new Date(allDates[currentDateIndex]).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                </span>

                {/* Range slider to manually scrub through timeline */}
                <input
                    type="range"
                    min={0}
                    max={allDates.length - 1}
                    value={currentDateIndex}
                    onChange={(e) => setCurrentDateIndex(parseInt(e.target.value))}
                    style={{ width: "300px" }}
                />

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

            </div>

            {/* SVG element where graph gets rendered */}
            <svg
                ref={svgRef}
                width={width}
                height={height}
                style={{ border: "1px solid #ccc" }}
            />
        </>
    );
}

export default CollaborationGraph;
