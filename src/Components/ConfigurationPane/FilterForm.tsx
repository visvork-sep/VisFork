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
                            <FormControl.Label>Sort forks by</FormControl.Label>
                            <Select>
                                <Select.Option value="date">Date of creation</Select.Option>
                                <Select.Option value="stargazers">Starsgazers</Select.Option>
                                <Select.Option value="watchers">Watchers</Select.Option>
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