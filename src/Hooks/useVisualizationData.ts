import { useState, useCallback, useEffect, useMemo } from "react";
import { ForkListData } from "@VisInterfaces/ForkListData";
import { CommitTableData } from "@VisInterfaces/CommitTableData";
import { HistogramData } from "@VisInterfaces/HistogramData";
import { TimelineData } from "@VisInterfaces/TimelineData";
import { WordCloudData } from "@VisInterfaces/WordCloudData";
import { SankeyData } from "@VisInterfaces/SankeyData";
import { CollabGraphData } from "@VisInterfaces/CollabGraphData";

//TODO: expand with other interfaces and separate
interface VisualizationData {
    forkListData: ForkListData,
    histogramData: HistogramData,
    timelineData: TimelineData,
    commitTableData: CommitTableData,
    wordCloudData: WordCloudData,
    sankeyData: SankeyData,
    collabGraphData: CollabGraphData,
}

//TEMPORARY
interface ForkData {
    id: number,
    name: string,
    description: string
}

//TEMPORARY
interface CommitData {
    repo: string,
    sha: string,
    parentIds: string[],
    message: string,
    author: string,
    login: string,
    date: Date,
    branch: string,
    url: string,
    type: "adaptive" | "corrective" | "perfective" | "uknown";
}

// TODO: Change to queried data type when available
export function useVisualizationData(forkData: ForkData[], commitData: CommitData[]) {

    // Convert the queried data to the format used by the visualization components
    const forkListData: ForkListData = {
        forkData: forkData
    };

    const histogramData: HistogramData = {
        commitData: commitData.map((commit) => {
            return {
                repo: commit.repo,
                date: commit.date
            };
        })
    };

    const timelineData: TimelineData = {
        commitData: commitData.map((commit) => {
            return {
                repo: commit.repo,
                id: commit.sha,
                parentIds: commit.parentIds,
                branch: commit.branch,
                date: commit.date,
                url: commit.url
            };
        })                
    };

    const commitTableData: CommitTableData = {
        commitData: commitData.map(commit => {
            return {
                id: commit.sha, // hash code
                repo: commit.repo, // repo name 
                author: commit.author, // author name
                login: commit.login, // username
                date: commit.date,
                message: commit.message
            };
        })
    };
    
    const wordCloudData: WordCloudData = {
        commitData: commitData.map(commit => commit.message)
    };

    const sankeyData: SankeyData = {
        commitData: commitData.map((commit) => {
            return {
                repo: commit.repo,
                commitType: commit.type
            };
        })
    };

    const collabGraphData: CollabGraphData = {
        commitData: commitData.map((commit) => {
            return {
                author: commit.author,
                repo: commit.repo,
            };
        })
    };

    // Group the data into a single object
    const initialVisData: VisualizationData = {
        forkListData,
        histogramData,
        timelineData,
        commitTableData,
        wordCloudData,
        sankeyData,
        collabGraphData
    };

    const [visData, setVisData] = useState<VisualizationData>(initialVisData);

    // Handle changes from the histogram selection
    const handleHistogramSelection = useCallback((startDate: Date, endDate: Date) => {
        // Filter commits based on the selected date range
        const constrainedCommits = commitData.filter((commit) =>
            commit.date >= startDate && commit.date <= endDate
        );

        // Update timeline, sankey and collaboration graph data
        const newTimelineData: TimelineData = {
            commitData: constrainedCommits.map((commit) => {
                return {
                    repo: commit.repo,
                    id: commit.sha,
                    parentIds: commit.parentIds,
                    branch: commit.branch,
                    date: commit.date,
                    url: commit.url
                };
            })
        }; 

        const newSankeyData: SankeyData = {
            commitData: constrainedCommits.map((commit) => {
                return {
                    repo: commit.repo,
                    commitType: commit.type
                };
            })
        };

        const newCollabGraphData: CollabGraphData = {
            commitData: constrainedCommits.map((commit) => {
                return {
                    author: commit.author,
                    repo: commit.repo,
                };
            })
        };

        setVisData({
            ...visData, timelineData: newTimelineData, sankeyData: newSankeyData, collabGraphData: newCollabGraphData
        });
    }, [commitData]);

    // Handle changes from the timeline selection
    const handleTimelineSelection = useCallback((hashes: string[]) => {

        // Filter commits based on the selected hash
        const constrainedCommits = commitData.filter((commit) =>
            hashes.includes(commit.sha)
        );

        // Update commit table and word cloud data
        const newCommitTableData: CommitTableData = {
            commitData: constrainedCommits.map(commit => {
                return {
                    id: commit.sha, // hash code
                    repo: commit.repo, // repo name
                    author: commit.author, // author name
                    login: commit.login, // username
                    date: commit.date,
                    message: commit.message
                };
            })
        };

        const newWordCloudData: WordCloudData = {
            commitData: constrainedCommits.map(commit => commit.message)
        };

        setVisData({ ...visData, commitTableData: newCommitTableData, wordCloudData: newWordCloudData });
    }, [commitData, visData.timelineData]);

    //TODO: add other handlers
    return {visData, handleHistogramSelection, handleTimelineSelection };
}
