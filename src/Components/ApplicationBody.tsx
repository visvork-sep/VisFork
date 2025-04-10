import { Label, Stack } from "@primer/react";
import Histogram from "./Plots/Histogram/Histogram.tsx";
import ForkList from "@Components/Plots/ForkList/ForkList.tsx";
import CommitTimeline from "./Plots/Timeline/CommitTimeline.tsx";
import CommitTable from "./Plots/CommitTable/CommitTable.tsx";
import CollaborationGraph from "./Plots/CollaborationGraph/CollaborationGraph.tsx";
import { SankeyDiagram } from "./Plots/SankeyDiagram/SankeyDiagram.tsx";
import { Dropdown } from "@Components/Dropdown";
import { InfoButton } from "./InfoButton.tsx";
import { useVisualizationData } from "@Hooks/useVisualizationData";
import { Commit, Repository } from "@Types/LogicLayerTypes.ts";
import { visualizationDescriptions } from "@Utils/visualizationDescriptions.ts";
import WordCloud from "./Plots/WordCloud/WordCloud.tsx";
import { useRef, useEffect, useState } from "react";

interface ApplicationBodyProps {
    forks: Repository[];
    commits: Commit[];
}

function ApplicationBody({ forks, commits }: ApplicationBodyProps) {
    const [startTime, setStartTime] = useState(Date.now());
    const renderTimeRef = useRef(0);
    // Capture the start time when the prop changes
    useEffect(() => {
        setStartTime(Date.now());
    }, [forks, commits]);

    // Measure the time taken when the component re-renders
    useEffect(() => {
        if (startTime) {

            const renderTime = Date.now() - startTime;
            renderTimeRef.current = renderTime;
            setStartTime(0); // Reset start time
        }
    });

    const { visData, handlers } =
        useVisualizationData(forks, commits);

    const {
        forkListData,
        timelineData,
        commitTableData,
        histogramData,
        sankeyData,
        collabGraphData,
        wordCloudData,
    } = visData;

    const { handleHistogramSelection, handleTimelineSelection, handleSearchBarSubmission } = handlers;

    return (
        <>
            <Label>
                {`Render time: ${(renderTimeRef.current / 1000).toFixed(2)} seconds`}
            </Label>
            <Stack>
                <Dropdown
                    open={true}
                    summaryText="Fork List"
                    infoButton={
                        <InfoButton
                            title="Fork List"
                            shortDescription={visualizationDescriptions.forkList.short}
                            fullDescription={visualizationDescriptions.forkList.full}
                        />
                    }
                >
                    <ForkList {...forkListData} />
                </Dropdown>
                <Dropdown
                    open={true}
                    summaryText="Histogram"
                    infoButton={
                        <InfoButton
                            title="Histogram"
                            shortDescription={visualizationDescriptions.histogram.short}
                            fullDescription={visualizationDescriptions.histogram.full}
                        />
                    }
                >
                    <Histogram
                        commitData={histogramData.commitData}
                        handleHistogramSelection={handleHistogramSelection} />
                </Dropdown>
                <Dropdown
                    open={true}
                    summaryText="Commit Timeline"
                    infoButton={
                        <InfoButton
                            title="Commit Timeline"
                            shortDescription={visualizationDescriptions.commitTimeline.short}
                            fullDescription={visualizationDescriptions.commitTimeline.full}
                        />
                    }
                >
                    <CommitTimeline
                        commitData={timelineData.commitData}
                        handleTimelineSelection={handleTimelineSelection} />
                </Dropdown>
                <Dropdown summaryText="Commit Table"
                    infoButton={
                        <InfoButton
                            title="Commit Table"
                            shortDescription={visualizationDescriptions.commitTable.short}
                            fullDescription={visualizationDescriptions.commitTable.full}
                        />
                    }
                >
                    <CommitTable
                        commitData={commitTableData.commitData}
                        handleSearchBarSubmission={handleSearchBarSubmission} />
                </Dropdown>
                <Dropdown summaryText="Word Cloud"
                    infoButton={
                        <InfoButton
                            title="Word Cloud"
                            shortDescription={visualizationDescriptions.wordCloud.short}
                            fullDescription={visualizationDescriptions.wordCloud.full}
                        />
                    }
                >
                    <WordCloud {...wordCloudData} />
                </Dropdown>
                <Dropdown summaryText="Sankey Diagram"
                    infoButton={
                        <InfoButton
                            title="Sankey Diagram"
                            shortDescription={visualizationDescriptions.sankeyDiagram.short}
                            fullDescription={visualizationDescriptions.sankeyDiagram.full}
                        />
                    }
                >
                    <SankeyDiagram {...sankeyData} />
                </Dropdown>
                <Dropdown summaryText="Collaboration Graph"
                    infoButton={
                        <InfoButton
                            title="Collaboration Graph"
                            shortDescription={visualizationDescriptions.collaborationGraph.short}
                            fullDescription={visualizationDescriptions.collaborationGraph.full}
                        />
                    }
                >
                    <CollaborationGraph {...collabGraphData} />
                </Dropdown>
            </Stack>
        </>
    );
}

export default ApplicationBody;
