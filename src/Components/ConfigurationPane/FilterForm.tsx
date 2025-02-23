import { Box, Button, Checkbox, CheckboxGroup, FormControl, Select, Stack } from "@primer/react";
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

            <Pagehead>Data retrieval</Pagehead>

            <Stack.Item>
                <Stack direction={"horizontal"} wrap="wrap" gap="spacious">
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
                                <Select.Option value="ascending">Ascending</Select.Option>
                                <Select.Option value="descending">Descending</Select.Option>
                            </Select>
                        </FormControl>
                    </Stack.Item>
                    
                </Stack>
            </Stack.Item>

            <Pagehead>Client side filters</Pagehead>

            <Stack.Item>
                <Stack direction="horizontal" wrap="wrap" gap="spacious">
                    <Stack.Item>
                        <CheckboxGroup>
                            <CheckboxGroup.Label>Included fork types</CheckboxGroup.Label>
                            <CheckboxGroup.Caption>Fork types to include into visualizations</CheckboxGroup.Caption>
                            <FormControl>
                                <FormControl.Label>Adaptive</FormControl.Label>
                                <Checkbox value="adaptive"/>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Corrective</FormControl.Label>
                                <Checkbox value="corrective"/>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Perfective</FormControl.Label>
                                <Checkbox value="perfective"/>
                            </FormControl>
                        </CheckboxGroup>
                    </Stack.Item>

                    <Stack.Item>
                        <CheckboxGroup>
                            <CheckboxGroup.Label>Included Owner types</CheckboxGroup.Label>
                            <FormControl>
                                <FormControl.Label>User</FormControl.Label>
                                <Checkbox value="user"/>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Organization</FormControl.Label>
                                <Checkbox value="organization"/>
                            </FormControl>
                        </CheckboxGroup>
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