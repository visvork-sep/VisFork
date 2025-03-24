import { Box, Heading, Stack } from "@primer/react";
import { useMeasure } from "@uidotdev/usehooks";

import Histogram from "./Plots/Histogram.tsx";
import ForkList from "@Components/Plots/ForkList";
import CommitTimeline from "./Plots/CommitTimeline.tsx";
import CommitTable from "./Plots/CommitTable";
import { SankeyDiagram } from "./Plots/SankeyDiagram.tsx";
import CollaborationGraph from "./Plots/CollaborationGraph.tsx";
import { Dropdown } from "@Components/Dropdown";

import { useVisualizationData } from "@Hooks/useVisualizationData";
import { Commit, Repository } from "@Types/LogicLayerTypes.ts";


interface ApplicationBodyProps {
    forks: Repository[],
    commits: Commit[]
}
// TODO: add props passed down from the parent component containing Commit and Fork data
function ApplicationBody({ forks, commits } : ApplicationBodyProps) {

    // TODO: Add props as initial data when provided
    const { visData, handlers } =
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
            <Dropdown summaryText="Histogram">
                <Histogram commitData={histogramData.commitData}
                    handleHistogramSelection={handleHistogramSelection} />
            </Dropdown>
            <Dropdown summaryText="Fork List">
                <ForkList {...forkListData} />
            </Dropdown>
            <Dropdown summaryText="Commit Timeline">
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
                        defaultBranches={{ /* Default branches go here */ }} merged={false} />
                </Box>
            </Dropdown>
            <Dropdown summaryText="Commit Table">
                <CommitTable {...commitTableData} />
            </Dropdown>
            {/* <Dropdown summaryText="Word Cloud">
                <WordCloud {...wordCloudData} />
            </Dropdown> */}
            <Dropdown summaryText="Sankey Diagram">
                <SankeyDiagram {...sankeyData} />
            </Dropdown>
            <Dropdown summaryText="Collaboration Graph">
                <CollaborationGraph {...collabGraphData} />
            </Dropdown>
        </Stack>
    );
}

export default ApplicationBody;
