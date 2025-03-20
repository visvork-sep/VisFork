import { useState, useCallback, useMemo } from "react";
import { ForkListData } from "@VisInterfaces/ForkListData";
import { CommitTableData } from "@VisInterfaces/CommitTableData";
import { HistogramData } from "@VisInterfaces/HistogramData";
import { TimelineData } from "@VisInterfaces/TimelineData";
import { WordCloudData } from "@VisInterfaces/WordCloudData";
import { SankeyData } from "@VisInterfaces/SankeyData";
import { CollabGraphData } from "@VisInterfaces/CollabGraphData";
import { VisualizationData } from "@VisInterfaces/VisualizationData";

// TEMPORARY
interface ForkData {
    id: number;
    name: string;
    description: string;
}

// TEMPORARY
interface CommitData {
    repo: string;
    sha: string;
    parentIds: string[];
    message: string;
    author: string;
    login: string;
    date: Date;
    branch: string;
    url: string;
    type: "adaptive" | "corrective" | "perfective" | "uknown";
}

// Helper function to map commit data
const mapCommitDataToHistogram = (commitData: CommitData[]): HistogramData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        date: commit.date,
    })),
});

const mapCommitDataToTimeline = (commitData: CommitData[]): TimelineData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        id: commit.sha,
        parentIds: commit.parentIds,
        branch: commit.branch,
        date: commit.date,
        url: commit.url,
    })),
});

const mapCommitDataToCommitTable = (commitData: CommitData[]): CommitTableData => ({
    commitData: commitData.map((commit) => ({
        id: commit.sha,
        repo: commit.repo,
        author: commit.author,
        login: commit.login,
        date: commit.date.toISOString(),
        message: commit.message,
    })),
});

const mapCommitDataToWordCloud = (commitData: CommitData[]): WordCloudData => ({
    commitData: commitData.map((commit) => commit.message),
});

const mapCommitDataToSankey = (commitData: CommitData[]): SankeyData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        commitType: commit.type,
    })),
});

const mapCommitDataToCollabGraph = (commitData: CommitData[]): CollabGraphData => ({
    commitData: commitData.map((commit) => ({
        author: commit.author,
        repo: commit.repo,
        date: commit.date.toISOString()
    })),
});

export function useVisualizationData(forkData: ForkData[], commitData: CommitData[]) {
    // Memoize the initial visualization data
    const initialVisData = useMemo(() => {
        const forkListData: ForkListData = { forkData };

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

    // Handlers
    const handleHistogramSelection = useCallback(
        (startDate: Date, endDate: Date) => {
            console.log("Histogram selection", startDate, endDate);
            console.log("Commit data", commitData);
            
            const constrainedCommits = commitData.filter(
                (commit) => commit.date >= startDate && commit.date <= endDate
            );

            console.log("Constrained commits", constrainedCommits);
            
            setVisData((prev) => ({
                ...prev,
                timelineData: mapCommitDataToTimeline(constrainedCommits),
                sankeyData: mapCommitDataToSankey(constrainedCommits),
                collabGraphData: mapCommitDataToCollabGraph(constrainedCommits),
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
                commitTableData: mapCommitDataToCommitTable(constrainedCommits),
                wordCloudData: mapCommitDataToWordCloud(constrainedCommits),
            }));
        },
        [commitData]
    );

    return {
        visData,
        handlers: {
            handleHistogramSelection,
            handleTimelineSelection,
        },
    };
}
