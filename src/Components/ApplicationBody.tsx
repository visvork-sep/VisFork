import { Box } from "@primer/react";
import Configuration from "@Components/Configuration/Configuration";
import Plot1 from "./Plots/Plot1";

function ApplicationBody() {
  return (
    <Box display="flex" flexDirection="column">
        <Configuration />
        <Plot1/>
    </Box>
  );
}


export default ApplicationBody;
