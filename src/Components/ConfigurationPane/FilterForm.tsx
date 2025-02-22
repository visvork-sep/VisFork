import { Box, Button, FormControl, Select, Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";
import { useState } from "react";
import {RepositoryInput, RepositoryInputValidation} from "./FilterFormElements/RepositoryInput";
import { ForksCountInput, ForksCountInputValidation } from "./FilterFormElements/ForksCountInput";


function FilterForm() {
    const [repositoryInputValidation, setRepositoryInputValidation] = useState<RepositoryInputValidation>();
    const [forksCountInputValidation, setForksCountInputValidation] = useState<ForksCountInputValidation>();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();  
        setRepositoryInputValidation("repositoryNameError");
        setForksCountInputValidation("LessThanMinForksError");
        // set url variables
    };

    return <Box as="form" onSubmit={onSubmit}>
        <Stack direction={"vertical"}>
            <Stack.Item>
                <RepositoryInput validation={repositoryInputValidation} /> 
            </Stack.Item>

            <Pagehead>Filters</Pagehead>

            <Stack.Item>
                <Stack direction={"horizontal"} wrap="wrap">
                    <Stack.Item>
                        <ForksCountInput validation={forksCountInputValidation}/>
                    </Stack.Item>

                    <Stack.Item>
                        <FormControl>
                            <FormControl.Label>Select forks by</FormControl.Label>
                            <FormControl.Caption>The metric to select forks by</FormControl.Caption>
                            <Select>
                                <Select.Option value="date">Date of creation</Select.Option>
                                <Select.Option value="stargazers">Starsgazers</Select.Option>
                                <Select.Option value="watchers">Watchers</Select.Option>
                                <Select.Option value="last commit">Date of Last Commit</Select.Option>
                            </Select>
                        </FormControl>
                    </Stack.Item>

                    <Stack.Item>
                        <FormControl>
                            <FormControl.Label>Retrieval order</FormControl.Label>
                            <FormControl.Caption>Order of fork retrieval</FormControl.Caption>
                            <Select>
                                <Select.Option value="ascending">asc</Select.Option>
                                <Select.Option value="descending">desc</Select.Option>
                            </Select>
                        </FormControl>
                    </Stack.Item>

                    <Stack.Item>
                        <FormControl>
                            <FormControl.Label>Filter fork type</FormControl.Label>
                            <FormControl.Caption>Only show forks of set type</FormControl.Caption>
                            <Select>
                                <Select.Option value="any">Any</Select.Option>
                                <Select.Option value="adaptive">Adaptive</Select.Option>
                                <Select.Option value="corrective">Corrective</Select.Option>
                                <Select.Option value="perfective">Perfective</Select.Option>
                            </Select>
                        </FormControl>
                    </Stack.Item>

                    <Stack.Item>

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