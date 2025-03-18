import { Box, Heading, Stack } from "@primer/react";
import CommitTimeline from "./Plots/CommitTimeline.tsx";
import commitData from "./Plots/commit_data_example.json";
import { useMeasure } from "@uidotdev/usehooks";

import ForkList from "@Components/Plots/ForkList";
import { Dropdown } from "@Components/Dropdown";

const plotsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ApplicationBody() {
    const [measureRefCommitTimeline, { width }] = useMeasure();
    const heightCommitTimelineSVG = 600;

    const children = plotsData.map((plot) => {
        return (
            <Stack.Item key={plot}>
                {plot === 1 && <Dropdown  summaryText="Commit Timeline">
                    <Box ref={measureRefCommitTimeline}
                        style={{
                            resize: "vertical",
                            overflow: "hidden", // Ensure resizing works
                            minHeight: "200px", // Set an initial height
                        }}>

                        <Heading variant="medium" style={{ textAlign: "center" }}>Commit Timeline</Heading>
                        <CommitTimeline data={commitData}
                            c_width={width ?? 0} 
                            c_height={heightCommitTimelineSVG}
                            merged = {false}
                            defaultBranches={{/* Default branches go here */}}/>
                    </Box>
                </Dropdown>}
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
