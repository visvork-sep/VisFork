/// TODO: Modularize it, nesting too deep.
import { Box, Button, FormControl, Select, Stack, TextInput } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";

const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
// set url variables
};
export const BACKEND_URL = import.meta.env.BACKEND_URL;

function Configuration() {
    return (
        <Stack gap="spacious">
            <Stack.Item>
                <Box as="form" onSubmit={onSubmit} >
                    <Stack direction={"vertical"}>
                        <Stack.Item >
                            <FormControl required id="repository">
                                <FormControl.Label>Repository</FormControl.Label>
                                <TextInput type="text" placeholder="torvalds/linux" />
                                <FormControl.Caption>
                                    This is the repository that the visualizations will be based upon
                                </FormControl.Caption>
                                {/* <FormControl.Validation variant="error">Repository must be of
                                form repositoryOwner/RepositoryName or a GitHub URL</FormControl.Validation> */}
                            </FormControl>
                        </Stack.Item>

                        <Pagehead>Advanced</Pagehead>

                        <Stack.Item>
                            <Stack direction={"horizontal"} wrap="wrap">
                                <Stack.Item>
                                    <FormControl id="forksCount">
                                        <FormControl.Label>Forks</FormControl.Label>
                                        <TextInput type="number" placeholder="5" min={1} max={500}/>
                                    </FormControl>
                                </Stack.Item> 

                                <Stack.Item>
                                    <FormControl id="sortingOrder">
                                        <FormControl.Label>Sort by</FormControl.Label>
                                        <Select>
                                            <Select.Option value={"date"}>Date</Select.Option>
                                            <Select.Option value={"stars"}>Stars</Select.Option>
                                        </Select>
                                    </FormControl>
                                </Stack.Item>

                                <Stack.Item>
                                    <FormControl>
                                        <FormControl.Label>Order</FormControl.Label>
                                        <Select>
                                            <Select.Option value={"ascending"}>asc</Select.Option>
                                            <Select.Option value={"descending"}>desc</Select.Option>
                                        </Select>
                                    </FormControl>
                                </Stack.Item>

                                <Stack.Item>
                                    <FormControl>
                                        <FormControl.Label>Order</FormControl.Label>
                                        <Select>
                                            <Select.Option value={"ascending"}>asc</Select.Option>
                                            <Select.Option value={"descending"}>desc</Select.Option>
                                        </Select>
                                    </FormControl>
                                </Stack.Item>
                
                                <Stack.Item>
                                    <FormControl>
                                        <FormControl.Label>Order</FormControl.Label>
                                        <Select>
                                            <Select.Option value={"ascending"}>asc</Select.Option>
                                            <Select.Option value={"descending"}>desc</Select.Option>
                                        </Select>
                                    </FormControl>
                                </Stack.Item>
                
                                <Stack.Item>
                                    <FormControl>
                                        <FormControl.Label>Order</FormControl.Label>
                                        <Select>
                                            <Select.Option value={"ascending"}>asc</Select.Option>
                                            <Select.Option value={"descending"}>desc</Select.Option>
                                        </Select>
                                    </FormControl>
                                </Stack.Item>
                
                            </Stack>
                        </Stack.Item>
                        <Stack.Item>
                            <Button type="submit">Submit</Button>
                        </Stack.Item>
                    </Stack>
                </Box>
            </Stack.Item> 


            <Pagehead>Import/Export</Pagehead>
            <Stack.Item>
                <Stack direction={"horizontal"} wrap="wrap">
                    <Stack.Item>
                        <Button>
                            Download as JSON
                        </Button>
                    </Stack.Item>
                    <Stack.Item>
                        <Button>
                            Import JSON
                        </Button>
                    </Stack.Item>
                </Stack>

            </Stack.Item>             
        </Stack>
    );
}

export default Configuration;