import { useState, useCallback, useMemo, useEffect } from "react";
import { ForkListData } from "@VisInterfaces/ForkListData";
import { CommitTableData } from "@VisInterfaces/CommitTableData";
import { HistogramData } from "@VisInterfaces/HistogramData";
import { TimelineData } from "@VisInterfaces/TimelineData";
import { WordCloudData } from "@VisInterfaces/WordCloudData";
import { SankeyData } from "@VisInterfaces/SankeyData";
import { CollabGraphData } from "@VisInterfaces/CollabGraphData";
import { VisualizationData } from "@VisInterfaces/VisualizationData";
import { Commit, Repository } from "@Types/LogicLayerTypes";


// Helper function to map commit data
const mapCommitDataToHistogram = (commitData: Commit[]): HistogramData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        date: commit.date,
    })),
});

const mapCommitDataToTimeline = (commitData: Commit[]): TimelineData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        id: commit.sha,
        parentIds: commit.parentIds,
        branch: commit.branch,
        date: commit.date.toISOString(),
        url: commit.url,
    })),
});

const mapCommitDataToCommitTable = (commitData: Commit[]): CommitTableData => ({
    commitData: commitData.map((commit) => ({
        id: commit.sha,
        repo: commit.repo,
        author: commit.author,
        login: commit.login,
        date: commit.date.toISOString(),
        message: commit.message,
    })),
});

const mapCommitDataToWordCloud = (commitData: Commit[]): WordCloudData => ({
    commitData: commitData.map((commit) => commit.message),
});

const mapCommitDataToSankey = (commitData: Commit[]): SankeyData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        commitType: commit.commitType,
    })),
});

const mapCommitDataToCollabGraph = (commitData: Commit[]): CollabGraphData => ({
    commitData: commitData.map((commit) => ({
        author: commit.author,
        login: commit.login,
        repo: commit.repo,
        date: commit.date.toISOString()
    })),
});

export function useVisualizationData(forkData: Repository[], commitData: Commit[]) {
    // Memoize the initial visualization data
    const initialVisData = useMemo(() => {
        const forkListData: ForkListData = { forkData: forkData };

        return {
            forkListData,
            histogramData: mapCommitDataToHistogram(commitData),
            timelineData: mapCommitDataToTimeline(commitData),
            commitTableData: mapCommitDataToCommitTable(commitData),
            wordCloudData: mapCommitDataToWordCloud(commitData),
            sankeyData: mapCommitDataToSankey(commitData),
            collabGraphData: mapCommitDataToCollabGraph(commitData),
        };
    }, [forkData, commitData]);

    const [visData, setVisData] = useState<VisualizationData>(initialVisData);

    useEffect(() => setVisData(initialVisData), [forkData, commitData]);

    // Handlers
    const handleHistogramSelection = useCallback(
        (startDate: Date, endDate: Date) => {
            // Filter commits based on date range
            const filteredCommits = commitData.filter(
                (commit) => new Date(commit.date) >= startDate && new Date(commit.date) <= endDate
            );

            // Create a Set of valid commit IDs for fast lookup
            const validCommitIds = new Set(filteredCommits.map(commit => commit.sha));

            // Remove parents that are outside the valid set
            const constrainedCommits = filteredCommits.map(commit => ({
                ...commit,
                parentIds: commit.parentIds.filter(parentId => validCommitIds.has(parentId))
            }));
        
            setVisData((prev) => ({
                ...prev,
                timelineData: mapCommitDataToTimeline(constrainedCommits),
                sankeyData: mapCommitDataToSankey(constrainedCommits),
                collabGraphData: mapCommitDataToCollabGraph(constrainedCommits),
                commitTableData: mapCommitDataToCommitTable(constrainedCommits),
                wordCloudData: mapCommitDataToWordCloud(constrainedCommits),
            }));
        },
        [commitData]
    );

    const handleTimelineSelection = useCallback(
        (hashes: string[]) => {
            const constrainedCommits = commitData.filter((commit) =>
                hashes.includes(commit.sha)
            );

            setVisData((prev) => ({
                ...prev,
                sankeyData: mapCommitDataToSankey(constrainedCommits),
                collabGraphData: mapCommitDataToCollabGraph(constrainedCommits),
                commitTableData: mapCommitDataToCommitTable(constrainedCommits),
                wordCloudData: mapCommitDataToWordCloud(constrainedCommits),
            }));
        },
        [commitData]
    );

    const handleSearchBarSubmission = useCallback(
        (hashes: string[]) => {
            const constrainedCommits = commitData.filter((commit) =>
                hashes.includes(commit.sha)
            );

            setVisData((prev) => ({
                ...prev,
                wordCloudData: mapCommitDataToWordCloud(constrainedCommits),
                sankeyData: mapCommitDataToSankey(constrainedCommits),
                collabGraphData: mapCommitDataToCollabGraph(constrainedCommits),
            }));
        },
        [commitData]
    );

    const defaultBranches = useMemo(() => {
        const branches = forkData.reduce((acc, fork) => {
            if (!acc[fork.name]) {
                acc[fork.name] = fork.defaultBranch;
            }
            return acc;
        }, {} as Record<string, string>);

        return branches;
    }, [forkData]);

    return {
        visData,
        handlers: {
            handleHistogramSelection,
            handleTimelineSelection,
            handleSearchBarSubmission
        },
        defaultBranches
    };
}
