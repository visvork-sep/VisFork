import { Box, Heading, Spinner, Stack } from "@primer/react";
import CommitTimeline from "../Components/Plots/Plot2.tsx";
import commitData from "./Plots/commit_data_example.json";
import { useMeasure } from "@uidotdev/usehooks";

import ForkList from "@Components/Plots/ForkList";
import { Dropdown } from "@Components/Dropdown";
import { useEffect } from "react";

const plotsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ApplicationBody() {
    const [measureRefCommitTimeline, { width }] = useMeasure();
    // Since the svg has padding on the left, it needs to be compensated on the right side 
    // to make sure the graph does not go out of the box.
    const compensationOfPadding = 33.6;
    const maxHeightCommitTimeline = 1000;
    useEffect(() => {
        console.log(width);
    }, [width]);

    const children = plotsData.map((plot) => {
        return (
            <Stack.Item key={plot}>
                {plot === 1 && <div ref={measureRefCommitTimeline}>
                    <Box
                        sx={{
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: "border.default",
                            borderRadius: 2,
                            p: 3,
                        }}
                    >
                        <Heading variant="medium" sx={{ textAlign: "center" }}>Commit Timeline</Heading>
                        {plot === 1 ? <CommitTimeline data={commitData}
                            c_width={(width ?? compensationOfPadding) - compensationOfPadding} 
                            maxHeight={maxHeightCommitTimeline}
                            merged = {false}
                            defaultBranches={{/* Default branches go here */}}/> : <Spinner/>}
                    </Box>
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
