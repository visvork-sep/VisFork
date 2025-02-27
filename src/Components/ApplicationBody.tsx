import { Spinner, Stack } from "@primer/react";
import { Blankslate } from "@primer/react/experimental";
import CommitTimeline, { RawCommit } from "../Components/Plots/Plot2.tsx";
import commitData from "./Plots/commit_data_example.json";
import { useMeasure } from "@uidotdev/usehooks";

const plotsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ApplicationBody() {
    const [measureRefCommitTimeline, { width }] = useMeasure();
    const widthMeasurementError = 40;
    const maxHeightCommitTimeline = 1000;

    const children = plotsData.map((plot) => {
        return (
            <Stack.Item key={plot}>
                <div ref={plot === 1 ? measureRefCommitTimeline : undefined}>
                    <Blankslate border>
                        <Blankslate.Heading>Plot{plot}</Blankslate.Heading>
                        <Blankslate.Visual>
                            {plot === 1 ? <CommitTimeline data={commitData as RawCommit[]} 
                                width={(width ?? widthMeasurementError) - widthMeasurementError} 
                                maxHeight={maxHeightCommitTimeline}/> : <Spinner/>}
                        </Blankslate.Visual>
                    </Blankslate>
                </div>
            </Stack.Item>
        );
    });
  
    return children;
}

export default ApplicationBody;
