import {   Spinner, Stack } from "@primer/react";

import { Blankslate, UnderlinePanels } from "@primer/react/experimental";
//import exampleData from "../Components/Plots/commit_data_example.json";

const plotsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ApplicationBody() {

    const children = plotsData.map((plot) => {
        return (
            <Stack.Item key={plot}>
                <Blankslate border>
                    <Blankslate.Heading>Plot{plot}</Blankslate.Heading>
                    <Blankslate.Visual>
                        <Spinner/>
                    </Blankslate.Visual>
                </Blankslate>
            </Stack.Item>
        );
    });
  
    return (
        <UnderlinePanels>
            <UnderlinePanels.Tab>Plots 1</UnderlinePanels.Tab>
            <UnderlinePanels.Panel>
                <Stack>{children}</Stack>
            </UnderlinePanels.Panel>
            <UnderlinePanels.Tab>Plots 2</UnderlinePanels.Tab>
            <UnderlinePanels.Panel>
                <Stack>{children}</Stack>
            </UnderlinePanels.Panel>

            <UnderlinePanels.Tab>Plots 3</UnderlinePanels.Tab>
            <UnderlinePanels.Panel>
                <Stack>{children}</Stack>
            </UnderlinePanels.Panel>

            <UnderlinePanels.Tab>Plots 4</UnderlinePanels.Tab>
            <UnderlinePanels.Panel>
                <Stack>{children}</Stack>
            </UnderlinePanels.Panel>
        </UnderlinePanels>
    );
}


export default ApplicationBody;
