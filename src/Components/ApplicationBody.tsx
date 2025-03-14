import { Stack } from "@primer/react";
import ForkList from "@Components/Plots/ForkList";
import CommitTable from "./Plots/CommitTable";
import { Dropdown } from "@Components/Dropdown";

import { useVisualizationData } from "@Hooks/useVisualizationData";
//TODO: Replace with actual data when proper hooks is implemented
const dummyDataForHook = {
    forkListData: {
        forks: [
            {
                id: 0,
                forkName: "name",
                description: "description"
            },
            {
                id: 1,
                forkName: "name2",
                description: "description 2"
            }
        ]
    }
};
// const commitTableDummyData = [];

function ApplicationBody() {
    const { forkListData, setVisData, handleForkListDataChange } = useVisualizationData(dummyDataForHook);
    return (
        <Stack>
            <Stack.Item >
                <Dropdown summaryText="Fork List">
                    {/* Might not be good practice but not sure */}
                    <ForkList {...forkListData} />
                </Dropdown>
            </Stack.Item>
        </Stack>
    );
}

export default ApplicationBody;
