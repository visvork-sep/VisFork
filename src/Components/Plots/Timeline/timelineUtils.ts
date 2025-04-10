import { interpolateRainbow } from "d3-scale-chromatic";
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
 * Build a Map<repo, color> using d3.interpolateRainbow.
 * Used to color-code nodes belonging to different forks.
 */
export function buildRepoColorMap(commits: Commit[]): Map<string, string> {
    const repos = Array.from(new Set(commits.map(c => c.repo)));
    const map = new Map<string, string>();
  
    repos.forEach((repo, i) => {
        map.set(repo, interpolateRainbow(i / repos.length));
    });
  
    return map;
}


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
    const lanes: Record<string, { minX: number; maxX: number; }> = {};

    // shift nodes for each repo
    repoOrder.forEach(([repo, repoNodes]) => {
        const minX = min(repoNodes, (n) => n.y) || 0;
        const maxX = max(repoNodes, (n) => n.y) || 0;
        const height = maxX - minX;
        repoNodes.forEach((node) => {
            node.y = cumulativeOffset + (node.y - minX);
        });
        lanes[repo] = { minX: cumulativeOffset, maxX: cumulativeOffset + height };
        cumulativeOffset += height + c.NODE_RADIUS * 2;
    });

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
    const dateSortedCommits = commits.slice().sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

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
    const mergeNodes = new Set<string>();

    // find from which commits a fork pulls (fork parents) and which are merge nodes
    sortedCommits.forEach(commit => {
        commitLookup.set(commit.id, commit);
        // fork parents have a child within a different repo
        commit.parentIds.forEach(parentId => {
            const parentCommit = commitLookup.get(parentId);
            if (parentCommit && parentCommit.repo !== commit.repo) {
                forkParentIds.add(parentId);
            }
        });
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
    });

    const repoGroups = groupBy(Array.from(sortedCommits), (commit) => commit.repo);
    let counter = 0; // used for setting IDs

    function findParent(node: GroupedNode) {
        const firstCommit = commitLookup.get(node.nodes[0]);
        if (firstCommit) {
            firstCommit.parentIds.forEach(parentId => {
                const parentGroupId = commitIdToGroupId.get(parentId);
                if (parentGroupId) {
                    node.parentIds.push(parentGroupId);
                }
            });
        }
    }

    function createGroup(nodes: Commit[], i: number, lastBreak: number) {
        if (lastBreak < i) {
            const mergedGroup: GroupedNode = {
                id: `${counter}`,
                parentIds: [],
                repo: nodes[lastBreak].repo,
                branch: "default",
                date: nodes[lastBreak].date,
                url: "", // default nodes are not clickable
                nodes: nodes.slice(lastBreak, i).map(node => node.id) || [],
                end_date: nodes[i - 1].date,
            };
            groupedNodes.push(mergedGroup);
        }

        const type = mergeNodes.has(nodes[i].id) ? "merge" : "forkParent";
        const specialNode: GroupedNode = {
            id: `Special ${counter}`,
            parentIds: [],
            repo: nodes[i].repo,
            branch: type,
            date: nodes[i].date,
            url: nodes[i].url,
            nodes: [nodes[i].id],
            end_date: nodes[i].date,
        };
        groupedNodes.push(specialNode);
        counter++;
    }

    repoGroups.forEach((nodes, repo) => {
        let lastBreak = 0;
        for (let i = 0; i < nodes.length; i++) {
            if (mergeNodes.has(nodes[i].id) || forkParentIds.has(nodes[i].id)) {
                createGroup(nodes, i, lastBreak);
                lastBreak = i + 1;
            }
        }
        if (lastBreak < nodes.length) {
            const finalGroupNodeIds = nodes.slice(lastBreak).map(node => node.id);
            const finalGroup: GroupedNode = {
                id: `${counter}`,
                parentIds: [],
                repo: repo,
                branch: "default",
                date: nodes[lastBreak].date,
                url: "", // default nodes are not clickable
                nodes: finalGroupNodeIds,
                end_date: nodes[nodes.length - 1].date,
            };
            counter++;
            groupedNodes.push(finalGroup);
        }
    });

    // used to find parents
    const commitIdToGroupId = new Map<string, string>();
    groupedNodes.forEach(group => {
        group.nodes.forEach(commitId => commitIdToGroupId.set(commitId, group.id));
    });

    // assign parents to groups
    for (const mnode of groupedNodes) {
        findParent(mnode);
    }

    return groupedNodes;
}




    
