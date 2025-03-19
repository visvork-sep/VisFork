import { Box, Heading, Stack } from "@primer/react";
import CommitTimeline from "./Plots/CommitTimeline.tsx";
import commitData from "./Plots/commit_data_example.json";
import { useMeasure } from "@uidotdev/usehooks";

import ForkList from "@Components/Plots/ForkList";
import CommitTable from "./Plots/CommitTable";
import { Dropdown } from "@Components/Dropdown";

import { useVisualizationData } from "@Hooks/useVisualizationData";
import { ForkInfo, CommitInfo } from "@Types/DataLayerTypes.ts";
import { useMemo } from "react";
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
        type: "adaptive" as "adaptive" | "corrective" | "perfective" | "uknown"
    }
];
//=================================================================================================
interface AppBodyProps {
    forks: ForkInfo[]
    commits: CommitInfo[]
}
// TODO: add props passed down from the parent component containing Commit and Fork data
function ApplicationBody({forks, commits}: AppBodyProps) {
    const proccessed = useMemo(() => commits.map((commit) => {
        return {...commit, type: "adaptive" as "adaptive" | "corrective" | "perfective" | "uknown", date: new Date(commit.date), branch: "no"};
    }), [commits]);
    // TODO: Add props as initial data when provided
    const { visData } =
        useVisualizationData(forks, proccessed);

    // TODO: Extract props from visData when more visualizations need them
    const {
        forkListData, commitTableData
    } = visData;
    console.log(forkListData, commitTableData);
    // const { handleHistogramSelection, handleTimelineSelection } = handlers;

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
                    <CommitTimeline data={commitData}
                        c_width={width ?? 0}
                        c_height={heightCommitTimelineSVG}
                        merged={false}
                        defaultBranches={{/* Default branches go here */ }} />
                </Box>
            </Dropdown>

            <Dropdown summaryText="Fork List">
                <ForkList {...forkListData} />
            </Dropdown>
            <Dropdown summaryText="Commit Table">
                <CommitTable {...commitTableData} />
            </Dropdown>
        </Stack>
    );
}

export default ApplicationBody;
