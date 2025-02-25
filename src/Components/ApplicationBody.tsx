import {   Spinner, Stack } from "@primer/react";

import { Blankslate } from "@primer/react/experimental";

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
  
    return children;
}

export default ApplicationBody;