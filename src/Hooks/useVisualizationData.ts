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

    useEffect(() => setVisData(initialVisData), [forkData, commitData]);

    const handleHistogramSelection = useCallback(
        (startDate: Date, endDate: Date) => {
            const constrainedCommits = filterCommitsByDate(commitData, startDate, endDate);

            setVisData((prev) => ({
                ...prev,
                ...buildVisualizationSubsetData(constrainedCommits),
            }));
        },
        [commitData]
    );

    const handleTimelineSelection = useCallback(
        (hashes: string[]) => {
            const constrainedCommits = filterCommitsByHashes(commitData, hashes);

            setVisData((prev) => ({
                ...prev,
                ...buildVisualizationSubsetData(constrainedCommits),
            }));
        },
        [commitData]
    );

    const handleSearchBarSubmission = useCallback(
        (hashes: string[]) => {
            const constrainedCommits = filterCommitsByHashes(commitData, hashes);

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
            handleSearchBarSubmission,
        },
        defaultBranches,
    };
}
