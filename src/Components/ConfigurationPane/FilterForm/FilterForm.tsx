import { Box, Button, Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";

import { RepositoryInput } from "@Components/ConfigurationPane/FilterForm/RepositoryInput/RepositoryInput";
import { ForksCountInput } from "@Components/ConfigurationPane/FilterForm/ForksCountInput/ForksCountInput";
import { RecentlyUpdatedInput } from "@Components/ConfigurationPane/FilterForm/RecentlyUpdatedInput/RecentlyUpdatedInput";
import { CommitsDateRangeFromInput } from "@Components/ConfigurationPane/FilterForm/CommitsDateRangeFromInput/CommitsDateRangeFromInput";
import { ForksQueryOrderInput } from "@Components/ConfigurationPane/FilterForm/ForksQueryOrderInput/ForksQueryOrderInput";
import { ForksQueryOrderAscDescInput }
    from "@Components/ConfigurationPane/FilterForm/ForksQueryOrderAscDescInput/ForksQueryOrderAscDescInput";
import { ForksTypeFilterInput } from "@Components/ConfigurationPane/FilterForm/ForksTypeFilterInput/ForksTypeFilter";
import { OwnerTypeFilterInput } from "@Components/ConfigurationPane/FilterForm/OwnerTypeFilterInput/OwnertypeFilterInput";
import { CommitsDateRangeUntilInput }
    from "@Components/ConfigurationPane/FilterForm/CommitsDateRangeUntilInput/CommitsDateRangeUntilInput";
import { useFilterForm } from "@Hooks/useFilterForm/useFilterForm";
import { useFormSubmission } from "@Hooks/useFormSubmission/useFormSubmission";

function FilterForm() {
    const {
        form,
        handleRepositoryChange,
        handleForksCountChange,
        handleForksOrderChange,
        handleForksOrderAscDescChange,
        handleCommitsDateRangeFromChange,
        handleCommitsDateRangeUntilChange,
        handleForksTypeFilterChange,
        handleOwnerTypeFilterChange,
        handleRecentlyUpdatedChange
    } = useFilterForm();

    const {
        onSubmit,
        repositoryInputValidation,
        forksCountInputValidation,
        recentlyUpdatedInputValidation,
        commitsDateRangeFromInputValidation,
        commitsDateRangeUntilInputValidation
    } = useFormSubmission(form);

    return <Box as="form" onSubmit={onSubmit}>
        <Stack direction={"vertical"}>
            <Stack.Item>
                <RepositoryInput validation={repositoryInputValidation} onChangeHandler={handleRepositoryChange} />
            </Stack.Item>

            <Pagehead>Choose main filters</Pagehead>

            <Stack.Item>
                <Stack direction={"horizontal"} wrap="wrap" gap="spacious">
                    <Stack.Item>
                        <ForksCountInput validation={forksCountInputValidation}
                            onChangeHandler={handleForksCountChange} />
                    </Stack.Item>

                    <Stack.Item>
                        <ForksQueryOrderInput onChangeHandler={handleForksOrderChange} />
                    </Stack.Item>

                    <Stack.Item>
                        <ForksQueryOrderAscDescInput onChangeHandler={handleForksOrderAscDescChange} />
                    </Stack.Item>

                    <Stack.Item>
                        <CommitsDateRangeFromInput validation={commitsDateRangeFromInputValidation}
                            onChangeHandler={handleCommitsDateRangeFromChange} />
                    </Stack.Item>

                    <Stack.Item>
                        <CommitsDateRangeUntilInput validation={commitsDateRangeUntilInputValidation}
                            onChangeHandler={handleCommitsDateRangeUntilChange} />
                    </Stack.Item>
                </Stack>
            </Stack.Item>

            <Pagehead>Additional filters</Pagehead>

            <Stack.Item>
                <Stack direction="horizontal" wrap="wrap" gap="spacious">
                    <Stack.Item>
                        <ForksTypeFilterInput onChangeHandler={handleForksTypeFilterChange} />
                    </Stack.Item>

                    <Stack.Item>
                        <OwnerTypeFilterInput onChangeHandler={handleOwnerTypeFilterChange} />
                    </Stack.Item>

                    <Stack.Item>
                        <RecentlyUpdatedInput validation={recentlyUpdatedInputValidation}
                            onChangeHandler={handleRecentlyUpdatedChange} />
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
