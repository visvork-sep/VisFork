import { Box, Button, Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";
import { ChangeEvent, useCallback, useState } from "react";

import {RepositoryInput, RepositoryInputValidation} 
    from "@Components/ConfigurationPane/FilterFormElements/RepositoryInput";
import { ForksCountInput, ForksCountInputValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/ForksCountInput";
import { RecentlyUpdatedInput, RecentlyUpdatedInputValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/RecentlyUpdatedInput";
import { CommitDateRangeInputs, CommitDateRangeInputsValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/CommitsDateRangeInputs";
import { ForksQueryOrderInput } from "@Components/ConfigurationPane/FilterFormElements/ForksQueryOrderInput";
import { ForksQueryOrderAscDescInput } 
    from "@Components/ConfigurationPane/FilterFormElements/ForksQueryOrderAscDescInput";
import { ForksTypeFilterInput } from "@Components/ConfigurationPane/FilterFormElements/ForksTypeFilter";
import { OrganizationTypeFilterInput } 
    from "@Components/ConfigurationPane/FilterFormElements/OrganizationTypeFilterInput";


interface FormState {
    repositoryOwner: string,
    repositoryName: string,
    forksCount: number,
    forksOrder: "stargazers" | "watchers" | "creation date"
    forksAscDesc: "ascending" | "descending"
    commitsStart: Date,
    commitsEnd: Date,
    adaptiveForksIncluded: boolean,
    correctiveForksIncluded: boolean,
    perfectiveForksIncluded: boolean,
    ownerForksUserIncluded: boolean,
    ownerForksOrganizationIncluded: boolean,
    recentlyUpdatedMonths: number,
};

const initialForm : FormState = {
    repositoryOwner: "",
    repositoryName: "",
    forksCount: 0,
    forksOrder: "stargazers",
    forksAscDesc: "ascending",
    commitsStart: new Date(),
    commitsEnd: new Date(),
    adaptiveForksIncluded: false,
    correctiveForksIncluded: false,
    perfectiveForksIncluded: false,
    ownerForksUserIncluded: false,
    ownerForksOrganizationIncluded: false,
    recentlyUpdatedMonths: 0
};

function FilterForm() {
    const [repositoryInputValidation, setRepositoryInputValidation] = useState<RepositoryInputValidation>();
    const [forksCountInputValidation, setForksCountInputValidation] = useState<ForksCountInputValidation>();
    const [recentlyUpdatedInputValidation, setRecentlyUpdatedInputValidation] =
         useState<RecentlyUpdatedInputValidation>();
    const [commitDateRangeInputsValidation, setCommitDateRangeInputsValidation] = 
        useState<CommitDateRangeInputsValidation>();

    const [form, setForm] = useState<FormState>(initialForm);


    const handleRepositoryInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        // maybe seperate
        const words = value.split("/");
        if (words.length != 2) {
            return;
        }

        setForm((previousForm) => {
            return {
                ...previousForm,
                repositoryOwner: words[0],
                repositoryName: words[1]
            };
        });
    }, [setForm]);

    const handleForksCountInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const regex = new RegExp(/[1-9]([0-9]*)/);
        if (!regex.test(value)) {
            return;
        }
        const parsed = Number(value);

        if (!Number.isSafeInteger(parsed)) {
            return;
        }

        setForm((previousForm) => {
            return {
                ...previousForm,
                forksCount: parsed
            };
        });
    }, []);

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();  
        console.log(form);
        setRepositoryInputValidation("repositoryNameError");
        setForksCountInputValidation("lessThanMinForksError");
        setRecentlyUpdatedInputValidation("outOfInputRange");
        setCommitDateRangeInputsValidation("futureUntilDateError");
        // set url variables
    };

    return <Box as="form" onSubmit={onSubmit}>
        <Stack direction={"vertical"}>
            <Stack.Item>
                <RepositoryInput validation={repositoryInputValidation} onChangeHandler={handleRepositoryInputChange}/> 
            </Stack.Item>

            <Pagehead>Data retrieval</Pagehead>

            <Stack.Item>
                <Stack direction={"horizontal"} wrap="wrap" gap="spacious">
                    <Stack.Item>
                        <ForksCountInput validation={forksCountInputValidation} 
                            onChangeHandler={handleForksCountInputChange}/>
                    </Stack.Item>

                    <Stack.Item>
                        <ForksQueryOrderInput/> 
                    </Stack.Item>

                    <Stack.Item>
                        <ForksQueryOrderAscDescInput/> 
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
                        <ForksTypeFilterInput/> 
                    </Stack.Item>

                    <Stack.Item>
                        <OrganizationTypeFilterInput/>
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
