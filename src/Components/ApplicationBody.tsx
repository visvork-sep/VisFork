import { Stack } from "@primer/react";
import exampleData from "../Components/Plots/commit_data_example.json";
import facebookData from "../Components/Plots/facebook_react-commit_data.json";
import { Blankslate } from "@primer/react/experimental";
import Barchart from "./Plots/Barchart";

function ApplicationBody() {
  return (
    <Stack>
      
      <Blankslate border>
        <Barchart rawData={exampleData} />
      </Blankslate>
    </Stack>
  );
}

export default ApplicationBody;
