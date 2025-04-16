import { useState, useCallback, useMemo, useEffect } from "react";
import { ForkListData } from "@VisInterfaces/ForkListData";
import { VisualizationData } from "@VisInterfaces/VisualizationData";
import { Commit, Repository } from "@Types/LogicLayerTypes";
import {
    mapCommitDataToCollabGraph,
    mapCommitDataToHistogram,
    mapCommitDataToSankey,
    mapCommitDataToWordCloud,
} from "@Utils/LogicToVisualization";
import {
    filterCommitsByDate,
    filterCommitsByHashes,
    buildVisualizationSubsetData
} from "@Utils/UseVisualizationUtils";

export function useVisualizationData(forkData: Repository[], commitData: Commit[]) {
    const initialVisData = useMemo(() => {
        const forkListData: ForkListData = { forkData: forkData };

        return {
            forkListData,
            histogramData: mapCommitDataToHistogram(commitData),
            ...buildVisualizationSubsetData(commitData),
        };
    }, [forkData, commitData]);

    const [visData, setVisData] = useState<VisualizationData>(initialVisData);

    // Update visualization data when forkData or commitData changes
    useEffect(() => setVisData(initialVisData), [forkData, commitData]);

    // Handle histogram selection to filter commits based on date range
    const handleHistogramSelection = useCallback(
        (startDate: Date, endDate: Date) => {
            const constrainedCommits = filterCommitsByDate(commitData, startDate, endDate);

            // Remove parents that are outside the valid set
            const constrainedCommits = filteredCommits.map(commit => ({
                ...commit,
                parentIds: commit.parentIds.filter(parentId => validCommitIds.has(parentId))
            }));
        
            // Update subsequent visualizations with filtered commits
            setVisData((prev) => ({
                ...prev,
                ...buildVisualizationSubsetData(constrainedCommits),
            }));
        },
        [commitData]
    );

    // Handle timeline selection to filter commits based on selected commit hashes
    const handleTimelineSelection = useCallback(
        (hashes: string[]) => {
            const constrainedCommits = filterCommitsByHashes(commitData, hashes);

            // Update subsequent visualizations with filtered commits
            setVisData((prev) => ({
                ...prev,
                ...buildVisualizationSubsetData(constrainedCommits),
            }));
        },
        [commitData]
    );

    // Handle search bar submission to filter commits based on selected commit hashes
    const handleSearchBarSubmission = useCallback(
        (hashes: string[]) => {
            const constrainedCommits = filterCommitsByHashes(commitData, hashes);

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
            handleSearchBarSubmission,
        },
        defaultBranches,
    };
}
