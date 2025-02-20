import { Stack } from "@primer/react";
import RangeSlider from "./Plots/RangeSlider";
import exampleData from "../Components/Plots/commit_data_example.json";

function ApplicationBody() {
  return (
    <Stack>
      <RangeSlider
        raw={exampleData}
        onSelection={(selected: any) => console.log(selected)}
      />
    </Stack>
  );
}

export default ApplicationBody;
