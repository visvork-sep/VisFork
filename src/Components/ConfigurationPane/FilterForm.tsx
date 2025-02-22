import { Box, Button, FormControl, Select, Stack, TextInput } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";
import { useState } from "react";
import {RepositoryInput, RepositoryInputError} from "./FilterFormElements/RepositoryInput";


function FilterForm() {
    const [repositoryInputError, setRepositoryInputError] = useState<RepositoryInputError>();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();  
        setRepositoryInputError("name");
        // set url variables
    };

    return <Box as="form" onSubmit={onSubmit}>
        <Stack direction={"vertical"}>
            <Stack.Item>
                <RepositoryInput error={repositoryInputError} /> 
            </Stack.Item>

            <Pagehead>Filters</Pagehead>

            <Stack.Item>
                <Stack direction={"horizontal"} wrap="wrap">
                    <Stack.Item>
                        <FormControl id="forksCount">
                            <FormControl.Label>Forks</FormControl.Label>
                            <TextInput type="number" placeholder="5" min={1} max={500} />
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
    </Box>;
}

export default FilterForm;