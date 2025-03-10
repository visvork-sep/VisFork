import { Spinner, Stack } from "@primer/react";
import { Blankslate } from "@primer/react/experimental";
import CommitTimeline from "../Components/Plots/Plot2.tsx";
import commitData from "./Plots/commit_data_example.json";
import { useMeasure } from "@uidotdev/usehooks";

import ForkList from "@Components/Plots/ForkList";
import { Dropdown } from "@Components/Dropdown";

const plotsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ApplicationBody() {
    const [measureRefCommitTimeline, { width }] = useMeasure();
    const widthMeasurementError = 40;
    const maxHeightCommitTimeline = 1000;

    const children = plotsData.map((plot) => {
        return (
            <Stack.Item key={plot}>
                {plot === 1 && <div ref={measureRefCommitTimeline}>
                    <Blankslate border>
                        <Blankslate.Heading>Plot{plot}</Blankslate.Heading>
                        <Blankslate.Visual>
                            {plot === 1 ? <CommitTimeline data={commitData}
                                width={(width ?? widthMeasurementError) - widthMeasurementError} 
                                maxHeight={maxHeightCommitTimeline}/> : <Spinner/>}
                        </Blankslate.Visual>
                    </Blankslate>
                </div>}
                {plot === 2 &&
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
                </Dropdown>}
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
