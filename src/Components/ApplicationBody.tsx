import { Stack } from "@primer/react";
import ForkList from "@Components/Plots/ForkList";
import CommitTable from "./Plots/CommitTable";
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
        type: "adaptive" as "adaptive" | "corrective" | "perfective" | "uknown"
    }
];
//=================================================================================================

// TODO: add props passed down from the parent component containing Commit and Fork data
function ApplicationBody() {

    // TODO: Add props as initial data when provided
    const { visData, handlers } =
        useVisualizationData(dummyForks, dummyCommits);

    const {
        forkListData,
        histogramData,
        timelineData,
        commitTableData,
        wordCloudData,
        sankeyData,
        collabGraphData,
    } = visData;

    // const { handleHistogramSelection, handleTimelineSelection } = handlers;

    //TODO: Add other visualizations and pass respective props
    return (
        <Stack>
            <Stack.Item >
                <Dropdown summaryText="Fork List">
                    <ForkList {...forkListData} />
                </Dropdown>
            </Stack.Item>
            <Stack.Item >
                <Dropdown summaryText="Fork List">
                    <CommitTable {...commitTableData} />
                </Dropdown>
            </Stack.Item>
        </Stack>
    );
}

export default ApplicationBody;
