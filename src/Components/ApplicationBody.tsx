import {   Box, Details, Spinner, Stack } from "@primer/react";

import ForkList from "./Plots/ForkList";

const plotsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ApplicationBody() {

    const children = plotsData.map((plot) => {
        return (
            <Stack.Item key={plot}>
                <Details sx={{
                    "> summary::-webkit-details-marker": {
                        display: "revert"
                    },
                    "> summary": {
                        backgroundColor: "neutral.muted",
                        padding: "5px"
                    }
                }}>
                    <Details.Summary>Fork list</Details.Summary>
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
                    ]}/>
                </Details>
            </Stack.Item>
        );
    });
  
    return(
    <Stack>
        {children}
    </Stack>
    );
}

export default ApplicationBody;
