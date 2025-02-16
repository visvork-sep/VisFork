import { Box, Button, Details, FormControl, TextInput, useDetails } from "@primer/react";


function Configuration() {
  return (
    <Box as="form" border={1} borderRadius={2} display="grid" p={3}>
      <FormControl required id="repository">
        <FormControl.Label>Repository</FormControl.Label>
        <TextInput type="text" placeholder="torvalds/linux" />
        <FormControl.Caption>This is the repository that the visualizations will be based upon</FormControl.Caption>
        {/* <FormControl.Validation variant="error">Repository must be of form repositoryOwner/RepositoryName or a GitHub URL</FormControl.Validation> */}
      </FormControl>

      <Box>
        <Details>
          <Details.Summary as={Button}>Advanced</Details.Summary>
            <FormControl id="forks">
              <FormControl.Label>Forks</FormControl.Label>
              <TextInput type="number" placeholder="5" min="1" max="500"/>
            </FormControl>
        </Details>
      </Box>

      <Button type="submit">Submit</Button>
    </Box>

  );
}

export default Configuration;