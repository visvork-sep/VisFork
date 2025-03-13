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

        // Make sure each set of authors and repos is unique
        commitData.forEach((entry: CommitInfo) => {
            authors.add(entry.author);
            repos.add(entry.repo);
            links.push({
                source: entry.author,
                target: entry.repo,
            });
        });

        // Create nodes
        const nodes: Node[] = [
            ...Array.from(authors).map((author) => ({
                id: author,
                group: "author" as const, 
            })),
            ...Array.from(repos).map((repo) => ({
                id: repo,
                group: "repo" as const, 
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
            .attr("r", 8)
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
            .attr("dy", "-0.9em") 
            .attr("text-anchor", "middle")
            // Allow clicks to pass through
            .attr("pointer-events", "none") 
            .attr("fill", "#333")
            // Shorten long names
            .text((d) => d.id.length > 12 ? d.id.slice(0, 12) + "…" : d.id);


        node.append("title").text((d) => d.id);

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
