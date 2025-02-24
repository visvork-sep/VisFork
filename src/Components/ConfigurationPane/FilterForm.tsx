import { Box, Button, Checkbox, CheckboxGroup, FormControl, Select, Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";
import { useState } from "react";

import {RepositoryInput, RepositoryInputValidation} 
    from "@Components/ConfigurationPane/FilterFormElements/RepositoryInput";
import { ForksCountInput, ForksCountInputValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/ForksCountInput";
import { RecentlyUpdatedInput, RecentlyUpdatedInputValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/RecentlyUpdatedInput";
import { CommitDateRangeInputs, CommitDateRangeInputsValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/CommitsDateRangeInputs";
import { ForksQueryOrderInput } from "@Components/ConfigurationPane/FilterFormElements/ForksQueryOrderInput";

function FilterForm() {
    const [repositoryInputValidation, setRepositoryInputValidation] = useState<RepositoryInputValidation>();
    const [forksCountInputValidation, setForksCountInputValidation] = useState<ForksCountInputValidation>();
    const [recentlyUpdatedInputValidation, setRecentlyUpdatedInputValidation] =
         useState<RecentlyUpdatedInputValidation>();
    const [commitDateRangeInputsValidation, setCommitDateRangeInputsValidation] = 
        useState<CommitDateRangeInputsValidation>();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();  
        setRepositoryInputValidation("repositoryNameError");
        setForksCountInputValidation("lessThanMinForksError");
        setRecentlyUpdatedInputValidation("outOfInputRange");
        setCommitDateRangeInputsValidation("futureUntilDateError");
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
                        <ForksQueryOrderInput/> 
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

                    <Stack.Item>
                        <CommitDateRangeInputs validation={commitDateRangeInputsValidation}/> 
                    </Stack.Item>

                    
                </Stack>
            </Stack.Item>

            <Pagehead>Client side filters</Pagehead>

            <Stack.Item>
                <Stack direction="horizontal" wrap="wrap" gap="spacious">
                    <Stack.Item>
                        <CheckboxGroup>
                            <CheckboxGroup.Label>Included forks</CheckboxGroup.Label>
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
                            <CheckboxGroup.Label>Included Owners</CheckboxGroup.Label>
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

                    <Stack.Item>
                        <RecentlyUpdatedInput validation={recentlyUpdatedInputValidation}/>
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