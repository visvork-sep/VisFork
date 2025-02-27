import { Stack } from "@primer/react";

import { Blankslate } from "@primer/react/experimental";
import { SankeyChartBuild } from "./Plots/SankeyDiagram";// Ensure this path is correct
import commitData from "./Plots/commit_data_example.json";// Ensure this path is correct
const plotsData = [1];

function ApplicationBody() {
    const children = plotsData.map((plot) => {
        return (
            <Stack.Item key={plot}>
                <Blankslate border>
                    <Blankslate.Heading>Sankey Diagram</Blankslate.Heading>
                    <Blankslate.Visual>
                        <SankeyChartBuild data={commitData} />
                    </Blankslate.Visual>
                </Blankslate>
            </Stack.Item>
        );
    });
  
    return children;
}

export default ApplicationBody;
