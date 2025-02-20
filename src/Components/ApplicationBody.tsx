import { Stack } from "@primer/react";
import RangeSlider from "./Plots/RangeSlider";
import exampleData from "../Components/Plots/commit_data_example.json";
import { Blankslate } from "@primer/react/experimental";

function ApplicationBody() {
  return (
    <Stack>
      <Blankslate border>
      <RangeSlider
        raw={exampleData}
        onSelection={(selected: any) => console.log(selected)}
      />
      </Blankslate>
    </Stack>
  );
}

export default ApplicationBody;
