import { CollabGraphDetails } from "@VisInterfaces/CollabGraphData";
import {
    SimulationNodeDatum,
    SimulationLinkDatum,
    select,
    forceLink,
    forceManyBody,
    forceCenter,
    forceSimulation,
    symbol,
    symbolSquare,
    drag,
    Selection
} from "d3";

// Graph node type: author or repo
export interface Node extends SimulationNodeDatum {
    id: string;
    displayText: string;
    group: "author" | "repo";
    // Radius for node size
    radius?: number;
    // Commit count
    commits?: number;
}

// Graph link type: connects author to repo
export interface Link extends SimulationLinkDatum<Node> {
    source: string | Node;
    target: string | Node;
}

export const getUniqueDates = (commitData: CollabGraphDetails[]): string[] => {
    return Array.from(
        new Set(commitData.map((entry) => entry.date.split("T")[0]))
    ).sort();
};

export const advanceAutoPlay = (isPlaying: boolean,
    allDates: string[],
    currentDateIndex: number,
    setCurrentDateIndex: React.Dispatch<React.SetStateAction<number>>,
    playInterval: React.RefObject<NodeJS.Timeout | null>,
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
    playSpeed: number) => {
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
};

export function filterUniques(visibleCommits: CollabGraphDetails[],
    authors: Set<string>,
    repos: Set<string>, links: Link[],
    authorNames: Record<string, string>,
    authorCommitCounts: Record<string, number>,
    repoCommitCounts: Record<string, number>
) {
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
}


export function getVisibleCommits(commitData: CollabGraphDetails[], currentDate: string): CollabGraphDetails[] {
    return commitData.filter((commit) => {
        const commitDate = commit.date.split("T")[0];
        return commitDate <= currentDate;
    });
}

export function createNodes(
    authors: Set<string>,
    repos: Set<string>,
    authorCommitCounts: Record<string, number>,
    repoCommitCounts: Record<string, number>,
    authorNames: Record<string, string>
): Node[] {
    return [
        ...Array.from(authors).map((author) => ({
            id: author,
            displayText: authorNames[author],
            group: "author" as const,
            radius: 4 + Math.log(authorCommitCounts[author] || 1) * 2,
            commits: authorCommitCounts[author] || 0,
        })),
        ...Array.from(repos).map((repo) => ({
            id: repo,
            displayText: repo,
            group: "repo" as const,
            radius: 4 + Math.log(repoCommitCounts[repo] || 1) * 2,
            commits: repoCommitCounts[repo] || 0,
        })),
    ];
}

export function createSimulation(nodes: Node[], links: Link[], width: number, height: number) {
    return forceSimulation<Node>(nodes)
        .force("link", forceLink<Node, Link>(links).id((d) => d.id).distance(120))
        .force("charge", forceManyBody().strength(-20))
        .force("center", forceCenter(width / 2, height / 2))
        .alphaDecay(0.025);
}

export function addDragBehavior<T extends SVGGraphicsElement>(
    selection: Selection<T, Node, SVGGElement, unknown>,
    simulation: d3.Simulation<Node, Link>
) {
    return selection.call(
        drag<T, Node>()
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
}

export const addToolTips = (authorNodes: unknown, repoNodes: unknown) => {
    // Add toolttip to show full name and number of commits on hover
    [...authorNodes.nodes(), ...repoNodes.nodes()].forEach((el, i) => {
        const d = nodes[i];
        select(el).append("title").text(`${d.id}\nCommits: ${d.commits ?? 0}`);
    });
};


export function addTooltipss(selection: Selection<SVGElement, Node, SVGGElement, unknown>, nodes: Node[]) {
    selection.each((_, i, group) => {
        const el = select(group[i]);
        const d = nodes[i];
        el.append("title").text(`${d.id}\nCommits: ${d.commits ?? 0}`);
    });
}

