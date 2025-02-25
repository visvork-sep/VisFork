import { Box, Button, Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";
import { ChangeEvent, useCallback, useState } from "react";

import {RepositoryInput, RepositoryInputValidation} 
    from "@Components/ConfigurationPane/FilterFormElements/RepositoryInput";
import { ForksCountInput, ForksCountInputValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/ForksCountInput";
import { RecentlyUpdatedInput, RecentlyUpdatedInputValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/RecentlyUpdatedInput";
import {CommitsDateRangeFromInput, CommitsDateRangeFromInputValidation}
    from "@Components/ConfigurationPane/FilterFormElements/CommitsDateRangeFromInput";
import { ForksQueryOrderInput } from "@Components/ConfigurationPane/FilterFormElements/ForksQueryOrderInput";
import { ForksQueryOrderAscDescInput } 
    from "@Components/ConfigurationPane/FilterFormElements/ForksQueryOrderAscDescInput";
import { ForksTypeFilterInput } from "@Components/ConfigurationPane/FilterFormElements/ForksTypeFilter";
import { OrganizationTypeFilterInput } 
    from "@Components/ConfigurationPane/FilterFormElements/OrganizationTypeFilterInput";
import { CommitsDateRangeUntilInputValidation, CommitsDateRangeUntilInput } 
    from "./FilterFormElements/CommitsDateRangeUntilInput";



interface FormState {
    repositoryOwner: string,
    repositoryName: string,
    forksCount: number,
    forksOrder: "stargazers" | "watchers" | "last commit" | "author" | "date",
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
    const [commitsDateRangeFromInputValidation, setCommitsDateRangeFromInputValidation] = 
        useState<CommitsDateRangeFromInputValidation>();
    const [commitsDateRangeUntilInputValidation, setCommitsDateRangeUntilInputValidation] 
        = useState<CommitsDateRangeUntilInputValidation>();

    const [form, setForm] = useState<FormState>(initialForm);


    const handleRepositoryChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
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
    }, []);

    const handleForksCountChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
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

    const handleForksOrderChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        
        //TODO: add validation
        if (value != "stargazers" && value != "watchers" &&
            value != "last commit" && value != "author" && value != "date") {
            return;
        }
        
        setForm((perviousform) => {
            return {
                ...perviousform,
                forksOrder: value
            };
        });
    }, []);

    const handleForksOrderAscDescChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        
        //TODO: add validation
        if (value != "ascending" && value != "descending") {
            return;
        }
        
        setForm((perviousform) => {
            return {
                ...perviousform,
                forksAscDesc: value
            };
        });
    }, []);

    const handleCommitsDateRangeFromChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value);
    }, []);

    const handleCommitsDateRangeUntilChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value);
    }, []);;

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();  
        console.log(form);
        setRepositoryInputValidation("repositoryNameError");
        setForksCountInputValidation("lessThanMinForksError");
        setRecentlyUpdatedInputValidation("outOfInputRange");
        setCommitsDateRangeFromInputValidation("laterFromDateError");
        setCommitsDateRangeUntilInputValidation("laterFromDateError");
        // set url variables
    };

    return <Box as="form" onSubmit={onSubmit}>
        <Stack direction={"vertical"}>
            <Stack.Item>
                <RepositoryInput validation={repositoryInputValidation} onChangeHandler={handleRepositoryChange}/> 
            </Stack.Item>

            <Pagehead>Data retrieval</Pagehead>

            <Stack.Item>
                <Stack direction={"horizontal"} wrap="wrap" gap="spacious">
                    <Stack.Item>
                        <ForksCountInput validation={forksCountInputValidation} 
                            onChangeHandler={handleForksCountChange}/>
                    </Stack.Item>

                    <Stack.Item>
                        <ForksQueryOrderInput onChangeHandler={handleForksOrderChange}/> 
                    </Stack.Item>

                    <Stack.Item>
                        <ForksQueryOrderAscDescInput onChangeHandler={handleForksOrderAscDescChange}/> 
                    </Stack.Item>

                    <Stack.Item>
                        <CommitsDateRangeFromInput validation={commitsDateRangeFromInputValidation} 
                            onChangeHandler={handleCommitsDateRangeFromChange}/>
                    </Stack.Item>

                    <Stack.Item>
                        <CommitsDateRangeUntilInput validation={commitsDateRangeUntilInputValidation} 
                            onChangeHandler={handleCommitsDateRangeUntilChange}/>
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
