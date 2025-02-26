import { Stack } from "@primer/react";
import exampleData from "../Components/Plots/commit_data_example.json";
import facebookData from "../Components/Plots/facebook_react-commit_data.json";
import { Blankslate } from "@primer/react/experimental";
import Barchart from "./Plots/Barchart";

function ApplicationBody() {
  return (
    <Stack>
      <Barchart rawData={facebookData} />
      <Barchart rawData={exampleData} />
    </Stack>
  );
}

export default ApplicationBody;
