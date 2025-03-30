<<<<<<< HEAD
import { Stack } from "@primer/react";
=======
import { Box, Stack } from "@primer/react";
import { useMeasure } from "@uidotdev/usehooks";

>>>>>>> fc12eab27158f3982327ba87d04e2da0dd76b47d
import Histogram from "./Plots/Histogram.tsx";
import ForkList from "@Components/Plots/ForkList";
import CommitTimeline from "./Plots/Timeline/CommitTimeline.tsx";
import CommitTable from "./Plots/CommitTable";
import { SankeyDiagram } from "./Plots/SankeyDiagram.tsx";
import CollaborationGraph from "./Plots/CollaborationGraph.tsx";
import { Dropdown } from "@Components/Dropdown";
import { InfoButton } from "./InfoButton.tsx";
import { useVisualizationData } from "@Hooks/useVisualizationData";
import { Commit, Repository } from "@Types/LogicLayerTypes.ts";
import { visualizationDescriptions } from "@Utils/visualizationDescriptions.ts";
import WordCloud from "./Plots/WordCloud/WordCloud.tsx";
import exampleData from "./Plots/dummy_data2.json";


interface ApplicationBodyProps {
    forks: Repository[],
    commits: Commit[];
}
function ApplicationBody({ forks, commits }: ApplicationBodyProps) {

    const { visData, handlers} =
        useVisualizationData(forks, commits);

    const {
        forkListData,
        timelineData,
        commitTableData,
        histogramData,
        sankeyData,
        collabGraphData,
        wordCloudData
    } = visData;

    const { handleHistogramSelection, handleTimelineSelection } = handlers;

    return (
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
                <Histogram commitData={histogramData.commitData} handleHistogramSelection={handleHistogramSelection} />
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
<<<<<<< HEAD
                <CommitTimeline
                    commitData={exampleData}
                    //commitData={timelineData.commitData}
                    handleTimelineSelection={handleTimelineSelection}/>
=======
                <Box ref={measureRefCommitTimeline}
                    style={{
                        resize: "vertical",
                        overflow: "hidden", // Ensure resizing works
                        minHeight: "200px", // Set an initial height
                    }}>
                    <CommitTimeline
                        commitData={timelineData.commitData}
                        handleTimelineSelection={handleTimelineSelection}
                        c_width={width ?? 0}
                        c_height={heightCommitTimelineSVG}
                        defaultBranches={defaultBranches} />
                </Box>
>>>>>>> fc12eab27158f3982327ba87d04e2da0dd76b47d
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
                <CommitTable {...commitTableData} />
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
    );
}

export default ApplicationBody;
