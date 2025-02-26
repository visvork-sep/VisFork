import { Box, Button, Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";
import { useCallback, useState } from "react";

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
import { OwnerTypeFilterInput } 
    from "@Components/ConfigurationPane/FilterFormElements/OwnertypeFilterInput";
import { CommitsDateRangeUntilInputValidation, CommitsDateRangeUntilInput } 
    from "./FilterFormElements/CommitsDateRangeUntilInput";

// TODO: extract form logic to some other file
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

// Change to another way to set initial values
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


    const handleRepositoryChange = useCallback((input: string) => {

        // maybe seperate
        const words = input.split("/");
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

    const handleForksCountChange = useCallback((input: string) => {
        const regex = new RegExp(/[1-9]([0-9]*)/);
        if (!regex.test(input)) {
            return;
        }
        const parsed = Number(input);

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

    const handleForksOrderChange = useCallback((value: string) => {        
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

    const handleForksOrderAscDescChange = useCallback((value: string) => {        
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

    const handleCommitsDateRangeFromChange = useCallback((input: string) => {
        console.log(input);
    }, []);

    const handleCommitsDateRangeUntilChange = useCallback((input: string) => {
        console.log(input);
    }, []);

    const handleForksTypeFilterChange = useCallback((selected: string[]) => {
        console.log(selected);
        console.log(event);
    }, []);

    const handleOwnerTypeFilterChange = useCallback((selected: string[]) => {
        console.log(selected);
        console.log(event);
    }, []);

    const handleRecentlyUpdatedChange = useCallback((input: string) => {
        console.log(input);
    }, []);


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
                        <ForksTypeFilterInput onChangeHandler={handleForksTypeFilterChange}/> 
                    </Stack.Item>

                    <Stack.Item>
                        <OwnerTypeFilterInput onChangeHandler={handleOwnerTypeFilterChange}/>
                    </Stack.Item>

                    <Stack.Item>
                        <RecentlyUpdatedInput validation={recentlyUpdatedInputValidation} 
                            onChangeHandler={handleRecentlyUpdatedChange}/>
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
