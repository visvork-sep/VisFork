import { min, max } from "d3-array";
import { Selection } from "d3-selection";

import {
    GraphNode,
    MutGraphNode,
    Rank,
} from "d3-dag";

import type { TimelineDetails as Commit } from "@VisInterfaces/TimelineData";
import * as c from "./timelineConstants"; 


/**
 * Custom interface used for Merged View nodes
 */
export interface GroupedNode extends Commit {
    nodes: string[];
    end_date: string;
}

/**
 * Type used for brushing selection
 */
export type NodeSelection = Selection<
    SVGCircleElement | SVGPolygonElement,
    MutGraphNode<Commit | GroupedNode, undefined>,
    SVGGElement,
    unknown
>;

/**
 * Custom d3-dag Rank acessor, orders commits by date
 * (earlier commits come first) 
 */
export const dateRankOperator: Rank<Commit | GroupedNode, unknown> = (
    node: GraphNode<Commit, unknown>
): number => {
    const date = new Date(node.data.date);
    return date.getTime();
};

export function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const item of items) {
        const key = keyFn(item);
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key)?.push(item);
    }
    return map;
}

/**
 * Overwrites y-coordinates to place commits from different
 * forks in their own unique lanes.
 * 
 * @param nodes the data as nodes returned by d3dag builder
 * 
 */
export function assignUniqueLanes(
    nodes: Iterable<GraphNode<Commit | GroupedNode, unknown>>
) {
    // group nodes by repo.
    const repoGroups = groupBy(Array.from(nodes), (node) => node.data.repo);

    // sort repos by the date of their earliest commit.
    const repoOrder = Array.from(repoGroups.entries()).sort((a, b) => {
        const earliestA =
                min(a[1].map((n) => new Date(n.data.date).getTime())) || 0;
        const earliestB =
                min(b[1].map((n) => new Date(n.data.date).getTime())) || 0;
        return earliestA - earliestB;
    });

    let cumulativeOffset = c.MARGIN.top; // leaves space on top
    const lanes: Record<string, { minY: number; maxY: number; }> = {};
    const getY = (n: { y: number }) => n.y;

    // shift nodes for each repo
    for (const [repo, repoNodes] of repoOrder) {
        const minY = min(repoNodes, getY) || 0;
        const maxY = max(repoNodes, getY) || 0;
        const height = maxY - minY;
        for (const node of repoNodes) {
            node.y = cumulativeOffset + (node.y - minY);
        }
        lanes[repo] = { minY: cumulativeOffset, maxY: cumulativeOffset + height };
        cumulativeOffset += height + c.NODE_RADIUS * 2;
    }

    return { lanes, totalHeight: cumulativeOffset };
}

function topologicalSort(commits: Commit[]): Commit[] {
    const sortedCommits: Commit[] = [];
    const visited = new Set<string>();

    const commitMap = new Map(commits.map(commit => [commit.id, commit]));

    function visit(commit: Commit) {
        if (!visited.has(commit.id)) {
            visited.add(commit.id);
            for (const parentId of commit.parentIds) {
                const parentCommit = commitMap.get(parentId);
                if (parentCommit) { // if a parent commit exists
                    visit(parentCommit);
                }
            }
            sortedCommits.push(commit);
        }
    }

    // sort commits initially by date
    const dateSortedCommits = commits.slice().sort(function(a, b) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });


    // topological sorting
    for (const commit of dateSortedCommits) {
        visit(commit);
    }

    return sortedCommits;
}

export function groupNodes(data: Commit[]): GroupedNode[] {
    const sortedCommits = topologicalSort(data);

    const groupedNodes: GroupedNode[] = [];
    const commitLookup = new Map<string, Commit>();

    const forkParentIds = new Set<string>();
    const forkParentChildren = new Set<string>(); // commits consisting of pulling from another repo
    const mergeNodes = new Set<string>();
    let counter = 0; // used for setting IDs

    // Find fork parents and merge nodes
    for (const commit of sortedCommits) {
        commitLookup.set(commit.id, commit);
        // fork parents have a child within a different repo
        for (const parentId of commit.parentIds) {
            const parentCommit = commitLookup.get(parentId);
            if (parentCommit && parentCommit.repo !== commit.repo) {
                forkParentIds.add(parentId);
                forkParentChildren.add(commit.id);
            }
        };
        if (
            // merge nodes have at least two parents, one from different repo
            commit.parentIds.length >= 2 &&
            commit.parentIds.some(parentId => {
                const parentCommit = commitLookup.get(parentId);
                return parentCommit !== undefined && parentCommit.repo !== commit.repo;
            })
        ) {
            mergeNodes.add(commit.id);
        }
    };

    const repoGroups = groupBy(Array.from(sortedCommits), (commit) => commit.repo);

    // Helper function to create a grouped node
    function createGroupedNode(
        nodes: Commit[], 
        startIdx: number, 
        endIdx: number,
        branchType = "default", 
        isSpecial = false): GroupedNode {
        const nodeIds = nodes.slice(startIdx, endIdx).map(node => node.id);
        const prefix = isSpecial ? "Special " : "";
        return {
            id: `${prefix}${counter++}`,
            parentIds: [],
            repo: nodes[startIdx].repo,
            branch: branchType,
            date: nodes[startIdx].date,
            url: branchType === "default" ? "" : nodes[startIdx].url, // Only special nodes are clickable
            nodes: nodeIds,
            end_date: nodes[endIdx - 1].date,
        };
    }

    // Process each repo group
    repoGroups.forEach((nodes) => {
        let lastBreak = 0;
        
        for (let i = 0; i < nodes.length; i++) {
            const nodeId = nodes[i].id;
            const isSpecialNode = mergeNodes.has(nodeId) || forkParentIds.has(nodeId);
            const isForkChild = forkParentChildren.has(nodeId);
            
            if (isSpecialNode || isForkChild) {
                // create a group for any nodes between the last break and current special node
                if (lastBreak < i) {
                    groupedNodes.push(createGroupedNode(nodes, lastBreak, i));
                }
                
                // create appropriate node based on type
                if (isSpecialNode) {
                    const type = mergeNodes.has(nodeId) ? "merge" : "forkParent";
                    groupedNodes.push(createGroupedNode(nodes, i, i + 1, type, true));
                } else if (isForkChild) {
                    // create a default node for pulling from different repo
                    groupedNodes.push(createGroupedNode(nodes, i, i + 1));
                }
                
                lastBreak = i + 1;
            }
        }
        
        // Handle any remaining nodes
        if (lastBreak < nodes.length) {
            groupedNodes.push(createGroupedNode(nodes, lastBreak, nodes.length));
        }
    });

    // Create mapping from commit ID to group ID for parent lookup
    const commitIdToGroupId = new Map<string, string>();
    for (const group of groupedNodes) {
        for (const commitId of group.nodes) {
            commitIdToGroupId.set(commitId, group.id);
        }
    }

    function findParent(node: GroupedNode) {
        const firstCommit = commitLookup.get(node.nodes[0]);
        if (firstCommit) {
            for (const parentId of firstCommit.parentIds) {
                const parentGroupId = commitIdToGroupId.get(parentId);
                if (parentGroupId) {
                    node.parentIds.push(parentGroupId);
                }
            }
        }
    }

    // Assign parents to all groups
    for (const node of groupedNodes) {
        findParent(node);
    }

    return groupedNodes;
}   
