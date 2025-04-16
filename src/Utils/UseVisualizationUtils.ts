import { Commit } from "@Types/LogicLayerTypes";
import {
    mapCommitDataToTimeline,
    mapCommitDataToSankey,
    mapCommitDataToCollabGraph,
    mapCommitDataToCommitTable,
    mapCommitDataToWordCloud,
} from "@Utils/LogicToVisualization";

// Filters commits based on date range and adjusts parent IDs
export function filterCommitsByDate(commitData: Commit[], startDate: Date, endDate: Date): Commit[] {
    const filteredCommits = commitData.filter(
        (commit) => new Date(commit.date) >= startDate && new Date(commit.date) <= endDate
    );

    const validCommitIds = new Set(filteredCommits.map(commit => commit.sha));

    return filteredCommits.map(commit => ({
        ...commit,
        parentIds: commit.parentIds.filter(parentId => validCommitIds.has(parentId)),
    }));
}

// Filters commits by a list of hashes
export function filterCommitsByHashes(commitData: Commit[], hashes: string[]): Commit[] {
    return commitData.filter((commit) => hashes.includes(commit.sha));
}

// Maps commits to all derived visualizations (except histogram/forkListData)
export function buildVisualizationSubsetData(commits: Commit[]) {
    return {
        timelineData: mapCommitDataToTimeline(commits),
        sankeyData: mapCommitDataToSankey(commits),
        collabGraphData: mapCommitDataToCollabGraph(commits),
        commitTableData: mapCommitDataToCommitTable(commits),
        wordCloudData: mapCommitDataToWordCloud(commits),
    };
}
