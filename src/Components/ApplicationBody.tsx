import { Stack } from "@primer/react";
import Histogram from "./Plots/Histogram";

function ApplicationBody() {
    const sampleCommitData = {
        commits: [
            { fork: "my-fork", date: new Date("2021-01-01") }
        ],
    };
    return (
        <Stack>
            <Histogram commits={sampleCommitData.commits} />
        </Stack>
    );
}

export default ApplicationBody;
