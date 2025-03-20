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
//TODO: Replace with actual data when proper hooks is implemented
//=================================================================================================
const dummyForks = [
    {
        id: 1,
        name: "Fork 1",
        description: "Description 1"
    }
];
const dummyCommits = [
    {
        repo: "Repo 1",
        sha: "123",
        message: "Message 1",
        author: "Author 1",
        login: "Login 1",
        date: new Date(),
        branch: "Branch 1",
        url: "URL 1",
        parentIds: [],
        type: "adaptive" as "adaptive" | "corrective" | "perfective" | "unknown"
    },
    {
        repo: "Repo 2",
        sha: "321",
        message: "Message 33333",
        author: "Author 1",
        login: "Login 1",
        date: new Date(2025, 0),
        branch: "Branch 1",
        url: "URL 1",
        parentIds: [],
        type: "corrective" as "adaptive" | "corrective" | "perfective" | "unknown"
    }
];
//=================================================================================================

// TODO: add props passed down from the parent component containing Commit and Fork data
function ApplicationBody() {

    // TODO: Add props as initial data when provided
    const { visData, handlers } =
        useVisualizationData(dummyForks, dummyCommits);

    // TODO: Extract props from visData when more visualizations need them
    const {
        forkListData, timelineData, commitTableData, histogramData, sankeyData, collabGraphData } = visData;

    const { handleHistogramSelection, handleTimelineSelection } = handlers;

    const [measureRefCommitTimeline, { width }] = useMeasure();
    const heightCommitTimelineSVG = 600;


    //TODO: Add other visualizations and pass respective props
    return (
        <Stack>
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
            <Dropdown summaryText="Histogram">
                <Histogram commitData={histogramData.commitData}
                    handleHistogramSelection={handleHistogramSelection} />
            </Dropdown>
            <Dropdown summaryText="Fork List">
                <ForkList {...forkListData} />
            </Dropdown>
            <Dropdown summaryText="Commit Table">
                <CommitTable {...commitTableData} />
            </Dropdown>
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
