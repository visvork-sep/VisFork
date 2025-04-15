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


/* Map commit data to Histogram
Passes the following data:
- repo: The name of the repository
- date: The date of the commit in ISO format
*/
const mapCommitDataToHistogram = (commitData: Commit[]): HistogramData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        date: commit.date,
    })),
});

/* Map commit data to Commit Timeline
Passes the following data:
- repo: The name of the repository
- id: The SHA of the commit
- parentIds: The SHA of the parent commits
- branch: The name of the branch
- date: The date of the commit in ISO format
- url: The URL of the commit 
*/
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

/* Map commit data to Commit Table
Passes the following data:
- id: The SHA of the commit
- repo: The name of the repository
- author: The author of the commit
- login: The login of the author
- date: The date of the commit in ISO format
- message: The message of the commit
*/
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

/* Map commit data to Word Cloud
Passes the following data:
- commitData: The message of the commit
*/
const mapCommitDataToWordCloud = (commitData: Commit[]): WordCloudData => ({
    commitData: commitData.map((commit) => commit.message),
});

/* Map commit data to Sankey
Passes the following data:
- repo: The name of the repository
- commitType: The type of the commit (e.g., "merge", "push", etc.)
*/
const mapCommitDataToSankey = (commitData: Commit[]): SankeyData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        commitType: commit.commitType,
    })),
});

/* Map commit data to Collaboration Graph
Passes the following data:
- author: The author of the commit
- login: The login of the author
- repo: The name of the repository
- date: The date of the commit in ISO format
*/
const mapCommitDataToCollabGraph = (commitData: Commit[]): CollabGraphData => ({
    commitData: commitData.map((commit) => ({
        author: commit.author,
        login: commit.login,
        repo: commit.repo,
        date: commit.date.toISOString()
    })),
});

// Main hook to manage visualization data
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

    // Update visualization data when forkData or commitData changes
    useEffect(() => setVisData(initialVisData), [forkData, commitData]);

    // Handlers

    // Handle histogram selection to filter commits based on date range
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
        
            // Update subsequent visualizations with filtered commits
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

    // Handle timeline selection to filter commits based on selected commit hashes
    const handleTimelineSelection = useCallback(
        (hashes: string[]) => {
            const constrainedCommits = commitData.filter((commit) =>
                hashes.includes(commit.sha)
            );

            // Update subsequent visualizations with filtered commits
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

    // Handle search bar submission to filter commits based on selected commit hashes
    const handleSearchBarSubmission = useCallback(
        (hashes: string[]) => {
            const constrainedCommits = commitData.filter((commit) =>
                hashes.includes(commit.sha)
            );

            // Update subsequent visualizations with filtered commits
            setVisData((prev) => ({
                ...prev,
                wordCloudData: mapCommitDataToWordCloud(constrainedCommits),
                sankeyData: mapCommitDataToSankey(constrainedCommits),
                collabGraphData: mapCommitDataToCollabGraph(constrainedCommits),
            }));
        },
        [commitData]
    );

    // Memoize default branches for each fork
    // used to set the default branch for each fork in the visualization
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
