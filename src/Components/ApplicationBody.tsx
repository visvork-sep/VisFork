import { Stack } from "@primer/react";
import commitData from "./Plots/commit_data_example.json";
import WordCloudBox from "../Components/Plots/WordCloudBox"; // Import the WordCloudBox component

function ApplicationBody() {
    return (
        <Stack>
            <Stack.Item key="wordcloud">
                <WordCloudBox />
            </Stack.Item>
        </Stack>
    );
}

export default ApplicationBody;
