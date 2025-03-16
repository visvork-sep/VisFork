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
    },
    commitTableData: {
        commitData: [
            {
                "repo": "CarterLi/iina",
                "sha": "a7e5cb961b8f4b209d3532e8653ef73f0d88415c",
                "id": "a7e5cb961b8f4b209d3532e8653ef73f0d88415c",
                "author": "Carter Li",
                "login": "CarterLi",
                "date": "2023-03-03T20:15:31Z",
                "message": "HDR: useDisplayBacklight if ReferencePeakHDRLuminance is not found"
            },
            {
                "repo": "CarterLi/iina",
                "sha": "423c208a495f745c3128d4960f144b235d88c129",
                "id": "423c208a495f745c3128d4960f144b235d88c129",
                "author": "low-batt",
                "login": "low-batt",
                "date": "2023-03-02T20:15:31Z",
                "message": "Update README to reflect use of FFmpeg 6.0"
            }
        ]
    }
};
// const commitTableDummyData = [];
function ApplicationBody() {
    const { forkListData, commitTableData, setVisData, handleForkListDataChange }
        = useVisualizationData(dummyDataForHook);
    return (
        <Stack>
            <Stack.Item >
                <Dropdown summaryText="Fork List">
                    {/* Might not be good practice but not sure */}
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
