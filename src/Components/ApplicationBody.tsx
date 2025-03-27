import { Box, Heading, Stack } from "@primer/react";
import { useMeasure } from "@uidotdev/usehooks";

import Histogram from "./Plots/Histogram.tsx";
import ForkList from "@Components/Plots/ForkList";
import CommitTimeline from "./Plots/CommitTimeline.tsx";
import CommitTable from "./Plots/CommitTable";
import { SankeyDiagram } from "./Plots/SankeyDiagram.tsx";
import CollaborationGraph from "./Plots/CollaborationGraph.tsx";
import { Dropdown } from "@Components/Dropdown";
import { InfoButton } from "./InfoButton.tsx";
import { useVisualizationData } from "@Hooks/useVisualizationData";
import { Commit, Repository } from "@Types/LogicLayerTypes.ts";
import { visualizationDescriptions } from "@Utils/visualizationDescriptions.ts";
import WordCloud from "./Plots/WordCloud/WordCloud.tsx";


interface ApplicationBodyProps {
    forks: Repository[],
    commits: Commit[];
}
function ApplicationBody({ forks, commits }: ApplicationBodyProps) {

    const { visData, handlers, defaultBranches } =
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

    const [measureRefCommitTimeline, { width }] = useMeasure();
    const heightCommitTimelineSVG = 600;

    return (
        <Stack>
            <Dropdown
                summaryText="Histogram"
                infoButton={
                    <InfoButton
                        title="Histogram"
                        hoverDescription={visualizationDescriptions.histogram.short}
                        description={visualizationDescriptions.histogram.full}
                    />
                }
            >
                <Histogram commitData={histogramData.commitData} handleHistogramSelection={handleHistogramSelection} />
            </Dropdown>

            <Dropdown
                summaryText="Fork List"
                infoButton={
                    <InfoButton
                        title="Fork List"
                        hoverDescription={visualizationDescriptions.forkList.short}
                        description={visualizationDescriptions.forkList.full}
                    />
                }
            >
                <ForkList {...forkListData} />
            </Dropdown>
            <Dropdown summaryText="Commit Timeline"
                infoButton={
                    <InfoButton
                        title="Commit Timeline"
                        hoverDescription={visualizationDescriptions.commitTimeline.short}
                        description={visualizationDescriptions.commitTimeline.full}
                    />
                }
            >
                <Box ref={measureRefCommitTimeline}
                    style={{
                        resize: "vertical",
                        overflow: "hidden", // Ensure resizing works
                        minHeight: "200px", // Set an initial height
                    }}>

                    <Heading variant="medium" style={{ textAlign: "center" }}>Commit Timeline</Heading>
                    <CommitTimeline
                        commitData={timelineData.commitData}
                        handleTimelineSelection={handleTimelineSelection}
                        c_width={width ?? 0}
                        c_height={heightCommitTimelineSVG}
                        defaultBranches={defaultBranches}/>
                </Box>
            </Dropdown>
            <Dropdown summaryText="Commit Table"
                infoButton={
                    <InfoButton
                        title="Commit Table"
                        hoverDescription={visualizationDescriptions.commitTable.short}
                        description={visualizationDescriptions.commitTable.full}
                    />
                }
            >
                <CommitTable {...commitTableData} />
            </Dropdown>
            <Dropdown summaryText="Word Cloud"
                infoButton={
                    <InfoButton
                        title="Word Cloud"
                        hoverDescription={visualizationDescriptions.wordCloud.short}
                        description={visualizationDescriptions.wordCloud.full}
                    />
                }
            >
                <WordCloud {...wordCloudData} />
            </Dropdown>
            <Dropdown summaryText="Sankey Diagram"
                infoButton={
                    <InfoButton
                        title="Sankey Diagram"
                        hoverDescription={visualizationDescriptions.sankeyDiagram.short}
                        description={visualizationDescriptions.sankeyDiagram.full}
                    />
                }
            >
                <SankeyDiagram {...sankeyData} />
            </Dropdown>
            <Dropdown summaryText="Collaboration Graph"
                infoButton={
                    <InfoButton
                        title="Collaboration Graph"
                        hoverDescription={visualizationDescriptions.collaborationGraph.short}
                        description={visualizationDescriptions.collaborationGraph.full}
                    />
                }
            >
                <CollaborationGraph {...collabGraphData} />
            </Dropdown>
        </Stack>
    );
}

export default ApplicationBody;
