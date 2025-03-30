import { Stack } from "@primer/react";
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
            <Dropdown summaryText="Commit Timeline"
                infoButton={
                    <InfoButton
                        title="Commit Timeline"
                        shortDescription={visualizationDescriptions.commitTimeline.short}
                        fullDescription={visualizationDescriptions.commitTimeline.full}
                    />
                }
            >
                <CommitTimeline
                    commitData={exampleData}
                    //commitData={timelineData.commitData}
                    handleTimelineSelection={handleTimelineSelection}/>
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
