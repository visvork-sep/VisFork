import { Stack } from "@primer/react";
import Histogram from "./Plots/Histogram";

function ApplicationBody() {
    const sampleCommitData = {
        commits: [
            { fork: "my-fork", date: new Date("2021-01-01") },
            { fork: "my-fork", date: new Date("2021-02-15") },
            { fork: "another-fork", date: new Date("2021-03-20") },
            { fork: "another-fork", date: new Date("2021-04-05") },
            { fork: "my-fork", date: new Date("2021-05-10") },
            { fork: "another-fork", date: new Date("2021-06-15") },
            { fork: "my-fork", date: new Date("2021-07-20") },
            { fork: "another-fork", date: new Date("2021-08-25") },
            { fork: "my-fork", date: new Date("2021-09-30") },
            { fork: "another-fork", date: new Date("2021-10-05") },
            { fork: "my-fork", date: new Date("2021-11-10") },
            { fork: "another-fork", date: new Date("2021-12-15") },
            { fork: "third-fork", date: new Date("2021-12-16") },
            { fork: "third-fork", date: new Date("2021-12-17") },
            { fork: "third-fork", date: new Date("2021-12-18") },
            { fork: "more-forks", date: new Date("2021-12-19") },
            { fork: "so-many-forks", date: new Date("2022-05-02") },

        ],
    };
    return (
        <Stack>
            <Histogram commits={sampleCommitData.commits} />
        </Stack>
    );
}

export default ApplicationBody;
