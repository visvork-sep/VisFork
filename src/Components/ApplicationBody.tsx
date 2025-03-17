import { Stack } from "@primer/react";

import ForkList from "@Components/Plots/ForkList";
import { Dropdown } from "@Components/Dropdown";
import { deleteDuplicateCommits } from "@Utils/BranchingInference";

const plotsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ApplicationBody() {
    console.log(deleteDuplicateCommits([]));
    const children = plotsData.map((plot) => {
        return (
            <Stack.Item key={plot}>
                <Dropdown summaryText="Fork List">
                    <ForkList forks={[
                        {
                            id: 0,
                            full_name: "name",
                            description: "description"
                        },
                        {
                            id: 1,
                            full_name: "name2",
                            description: "description 2"
                        }
                    ]} />
                </Dropdown>
            </Stack.Item>
        );
    });

    return (
        <Stack>
            {children}
        </Stack>
    );
}

export default ApplicationBody;
