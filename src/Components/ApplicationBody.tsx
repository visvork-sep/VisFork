import { Stack } from "@primer/react";

<<<<<<< HEAD
import { Blankslate } from "@primer/react/experimental";
import { SankeyChartBuild } from "./Plots/SankeyDiagram";// Ensure this path is correct
import commitData from "./Plots/commit_data_example.json";// Ensure this path is correct
const plotsData = [1];
=======
import ForkList from "@Components/Plots/ForkList";
import { Dropdown } from "@Components/Dropdown";

const plotsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
>>>>>>> 4e41b8af2cd956ab86c47a6cb7b55e17192819d3

function ApplicationBody() {
    const children = plotsData.map((plot) => {
        return (
            <Stack.Item key={plot}>
<<<<<<< HEAD
                <Blankslate border>
                    <Blankslate.Heading>Sankey Diagram</Blankslate.Heading>
                    <Blankslate.Visual>
                        <SankeyChartBuild data={commitData} />
                    </Blankslate.Visual>
                </Blankslate>
=======
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
>>>>>>> 4e41b8af2cd956ab86c47a6cb7b55e17192819d3
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
