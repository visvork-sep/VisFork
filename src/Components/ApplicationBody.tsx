import { Stack } from "@primer/react";
//import exampleData from "../Components/Plots/commit_data_example.json";
//import facebookData from "../Components/Plots/facebook_react-commit_data.json";
import Barchart from "./Plots/Barchart";
import Histogram from "./Plots/Histogram";
import facebookData from "../Components/Plots/facebook_react-commit_data.json";
function ApplicationBody() {
    const exampleData: Date[] = facebookData.map((d: { date: string | number | Date; }) => new Date(d.date));
    const data: Date[] = facebookData.map((d: { date: string }) => new Date(d.date));
    return (
        <Stack>
            <Histogram />
        </Stack>
    );
}

export default ApplicationBody;
