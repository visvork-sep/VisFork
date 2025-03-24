import { useState, useCallback, useMemo, useEffect } from "react";
import { ForkListData } from "@VisInterfaces/ForkListData";
import { CommitTableData } from "@VisInterfaces/CommitTableData";
import { HistogramData } from "@VisInterfaces/HistogramData";
import { TimelineData } from "@VisInterfaces/TimelineData";
import { WordCloudData } from "@VisInterfaces/WordCloudData";
import { SankeyData } from "@VisInterfaces/SankeyData";
import { CollabGraphData } from "@VisInterfaces/CollabGraphData";
import { VisualizationData } from "@VisInterfaces/VisualizationData";
import { RepositoryInfo } from "@Types/LogicLayerTypes";

// TEMPORARY
interface ForkData {
    id: number;
    name: string;
    description: string;
}

// TEMPORARY
interface CommitInfo {
    repo: string;
    sha: string;
    parentIds: string[];
    message: string;
    author: string;
    login: string;
    date: Date;
    branch: string;
    url: string;
    type: "adaptive" | "corrective" | "perfective" | "unknown";
}

// Helper function to map commit data
const mapCommitDataToHistogram = (commitData: CommitInfo[]): HistogramData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        date: commit.date,
    })),
});

const mapCommitDataToTimeline = (commitData: CommitInfo[]): TimelineData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        id: commit.sha,
        parentIds: commit.parentIds,
        branch: commit.branch,
        date: commit.date.toISOString(),
        url: commit.url,
    })),
});

const mapCommitDataToCommitTable = (commitData: CommitInfo[]): CommitTableData => ({
    commitData: commitData.map((commit) => ({
        id: commit.sha,
        repo: commit.repo,
        author: commit.author,
        login: commit.login,
        date: commit.date.toISOString(),
        message: commit.message,
    })),
});

const mapCommitDataToWordCloud = (commitData: CommitInfo[]): WordCloudData => ({
    commitData: commitData.map((commit) => commit.message),
});

const mapCommitDataToSankey = (commitData: CommitInfo[]): SankeyData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        commitType: commit.type,
    })),
});

const mapCommitDataToCollabGraph = (commitData: CommitInfo[]): CollabGraphData => ({
    commitData: commitData.map((commit) => ({
        author: commit.author,
        repo: commit.repo,
        date: commit.date.toISOString()
    })),
});

export function useVisualizationData(forkData: RepositoryInfo[], commitData: CommitInfo[]) {
    // Memoize the initial visualization data
    const initialVisData = useMemo(() => {
        console.log("data passed to visualization:", forkData);
        const forkListData: ForkListData = { forkData: forkData };

        console.log("After type transform:", forkListData.forkData);
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
            console.log("Constrained commits", constrainedCommits);
            console.log("New word cloud data", mapCommitDataToWordCloud(constrainedCommits));


            setVisData((prev) => ({
                ...prev,
                commitTableData: mapCommitDataToCommitTable(constrainedCommits),
                wordCloudData: mapCommitDataToWordCloud(constrainedCommits),
            }));
        },
        [commitData]
    );

    console.log("Returned from visualization hook", visData.forkListData);
    return {
        visData,
        handlers: {
            handleHistogramSelection,
            handleTimelineSelection,
        },
    };
}
