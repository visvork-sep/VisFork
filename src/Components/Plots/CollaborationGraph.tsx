import { useEffect, useRef } from "react";
import * as d3 from "d3";
import commitData from "./commit_data_example.json";

// Types from your commit data
interface CommitInfo {
  repo: string;
  sha: string;
  id: string;
  parentIds: string[];
  branch_name: string;
  branch_id: string;
  node_id: string;
  author: string;
  date: string;
  url: string;
  message: string;
  commit_type: string;
  mergedNodes: unknown[];
}

// Graph node type: author or repo
interface Node extends d3.SimulationNodeDatum {
    id: string;
    group: "author" | "repo";
    radius?: number;
    commits?: number;
  }  

// Graph link type: connects author to repo
interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

function CollaborationGraph() {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const width = 800;
    const height = 600;

    useEffect(() => {
        if (!svgRef.current) return;

        // Get authors and repos from commit data
        const authors = new Set<string>();
        const repos = new Set<string>();
        const links: Link[] = [];

        const authorCommitCounts: Record<string, number> = {};
        const repoCommitCounts: Record<string, number> = {};

        // Make sure each set of authors and repos is unique
        commitData.forEach((entry: CommitInfo) => {
            authors.add(entry.author);
            repos.add(entry.repo);
            links.push({
                source: entry.author,
                target: entry.repo,
            });
        
            authorCommitCounts[entry.author] = (authorCommitCounts[entry.author] || 0) + 1;
            repoCommitCounts[entry.repo] = (repoCommitCounts[entry.repo] || 0) + 1;
        });

        // Create nodes
        const nodes: Node[] = [
            ...Array.from(authors).map((author) => ({
                id: author,
                group: "author" as const,
                radius: 4 + Math.log(authorCommitCounts[author] || 1) * 2,
                commits: authorCommitCounts[author] || 0,
            })),
            ...Array.from(repos).map((repo) => ({
                id: repo,
                group: "repo" as const,
                radius: 4 + Math.log(repoCommitCounts[repo] || 1) * 2,
                commits: repoCommitCounts[repo] || 0,
            })),
        ];        
          
        // D3 setup
        const svg = d3.select(svgRef.current);
        // Clear previous render
        svg.selectAll("*").remove();

        // Force simulation to position nodes nicely
        const simulation = d3
            .forceSimulation<Node>(nodes)
            .force("link", d3.forceLink<Node, Link>(links).id((d) => d.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-20))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // Draw links as lines
        const link = svg
            .append("g")
            .attr("stroke", "#aaa")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke-width", 1.5);

        // Draw nodes as circles
        const node = svg
            .append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", (d) => d.radius ?? 8)
            .attr("dy", (d) => `-${(d.radius ?? 8) + 4}px`)
            // Color nodes by their type
            .attr("fill", (d) => (d.group === "author" ? "#1f77b4" : "#ff7f0e"))
            // Dragging
            .call(
                d3
                    .drag<SVGCircleElement, Node>()
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
      
        // Add labels to nodes
        const label = svg
            .append("g")
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .text((d) => d.id)
            .attr("font-size", "10px")
            // Position text slightly above the node
            .attr("dy", (d) => `-${(d.radius ?? 8) + 4}px`)
            .attr("text-anchor", "middle")
            // Allow clicks to pass through
            .attr("pointer-events", "none") 
            .attr("fill", "#333")
            // Make labels non-selectable
            .attr("pointer-events", "none") 
            .style("user-select", "none")
            // Shorten long names
            .text((d) => d.id.length > 12 ? d.id.slice(0, 12) + "…" : d.id);

        // Show full name and number of commits on hover
        node.append("title").text((d) => {
            return `${d.id}\nCommits: ${d.commits ?? 0}`;
        });            

        simulation.on("tick", () => {
            // Clamp positions so nodes stay within the viewbox
            nodes.forEach((d) => {
                d.x = Math.max(18, Math.min(width - 18, d.x ?? 0));  // 8 is radius
                d.y = Math.max(18, Math.min(height - 10, d.y ?? 0));
            });
        
            link
                .attr("x1", (d) => (typeof d.source === "object" ? d.source.x ?? 0 : 0))
                .attr("y1", (d) => (typeof d.source === "object" ? d.source.y ?? 0 : 0))
                .attr("x2", (d) => (typeof d.target === "object" ? d.target.x ?? 0 : 0))
                .attr("y2", (d) => (typeof d.target === "object" ? d.target.y ?? 0 : 0));
        
            node
                .attr("cx", (d) => d.x ?? 0)
                .attr("cy", (d) => d.y ?? 0);
        
            label
                .attr("x", (d) => d.x ?? 0)
                .attr("y", (d) => d.y ?? 0);
        });

        // Add legend
        const legendData = [
            { label: "Author", color: "#1f77b4" },
            { label: "Repository", color: "#ff7f0e" },
        ];
  
        const legend = svg
            .append("g")
            .attr("transform", `translate(${width - 110}, 20)`); // Position top-right
  
        legend
            .selectAll("rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (_, i) => i * 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", (d) => d.color);
  
        legend
            .selectAll("text")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", 18)
            .attr("y", (_, i) => i * 20 + 10)
            .attr("font-size", "12px")
            .attr("fill", "#333")
            .text((d) => d.label)
            .style("user-select", "none");
  
        
    }, []);

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{ border: "1px solid #ccc" }}
        />
    );
}

export default CollaborationGraph;
