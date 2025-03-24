import { Box, Heading, Stack } from "@primer/react";
import { useMeasure } from "@uidotdev/usehooks";

import Histogram from "./Plots/Histogram.tsx";
import ForkList from "@Components/Plots/ForkList";
import CommitTimeline from "./Plots/CommitTimeline.tsx";
import CommitTable from "./Plots/CommitTable";
import { SankeyDiagram } from "./Plots/SankeyDiagram.tsx";
import CollaborationGraph from "./Plots/CollaborationGraph.tsx";
import WordCloud from "./Plots/WordCloud/WordCloud.tsx";
import { Dropdown } from "@Components/Dropdown";

import { useVisualizationData } from "@Hooks/useVisualizationData";
import { CommitInfo, RepositoryInfo } from "@Types/LogicLayerTypes.ts";
//TODO: Replace with actual data when proper hooks is implemented
//=================================================================================================
const dummyForks : RepositoryInfo[] = [
    {
        id: 1,
        name: "Fork 1",
        owner: { login: "user1" },
        description: "Test repo",
        created_at: new Date(),
        last_pushed: new Date(),
        ownerType: "User",
    },
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
        message: "not yes and i am will, . !",
        author: "Author 1",
        login: "Login 1",
        date: new Date(2025, 0),
        branch: "Branch 1",
        url: "URL 1",
        parentIds: [],
        type: "corrective" as "adaptive" | "corrective" | "perfective" | "unknown"
    },
    {
        repo: "Repo 3",
        sha: "333333",
        message: "plants vs zombies",
        author: "Author 2",
        login: "Login 1",
        date: new Date(2025, 3),
        branch: "Branch 1",
        url: "URL 1",
        parentIds: ["321"],
        type: "adaptive" as "adaptive" | "corrective" | "perfective" | "unknown"
    }
];
//=================================================================================================

interface ApplicationBodyProps {
    forks: RepositoryInfo[],
    commits: CommitInfo[]
}
// TODO: add props passed down from the parent component containing Commit and Fork data
function ApplicationBody({ forks, commits } : ApplicationBodyProps) {

    // TODO: Add props as initial data when provided
    const { visData, handlers } =
        useVisualizationData(forks, dummyCommits);

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
