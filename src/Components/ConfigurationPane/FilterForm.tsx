import { Box, Button, Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";

import { RepositoryInput } from "@Components/ConfigurationPane/FilterFormElements/RepositoryInput";
import { ForksCountInput } from "@Components/ConfigurationPane/FilterFormElements/ForksCountInput";
import { RecentlyUpdatedInput } from "@Components/ConfigurationPane/FilterFormElements/RecentlyUpdatedInput";
import { CommitsDateRangeFromInput } from "@Components/ConfigurationPane/FilterFormElements/CommitsDateRangeFromInput";
import { ForksQueryOrderInput } from "@Components/ConfigurationPane/FilterFormElements/ForksQueryOrderInput";
import { ForksQueryOrderAscDescInput }
    from "@Components/ConfigurationPane/FilterFormElements/ForksQueryOrderAscDescInput";
import { ForksTypeFilterInput } from "@Components/ConfigurationPane/FilterFormElements/ForksTypeFilterInput";
import { OwnerTypeFilterInput } from "@Components/ConfigurationPane/FilterFormElements/OwnertypeFilterInput";
import { CommitsDateRangeUntilInput }
    from "@Components/ConfigurationPane/FilterFormElements/CommitsDateRangeUntilInput";
import { useFilterForm } from "@Hooks/useFilterForm";
import { useFormSubmission } from "@Hooks/useFormSubmission";

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
        repositoryInputError,
        forksCountInputError,
        recentlyUpdatedInputError,
        commitsDateRangeFromInputError,
        commitsDateRangeUntilInputError
    } = useFormSubmission(form);

    return <Box as="form" onSubmit={onSubmit}>
        <Stack direction={"vertical"}>
            <Stack.Item>
                <RepositoryInput error={repositoryInputError}
                    onChangeHandler={handleRepositoryChange} value={form.repository} />
            </Stack.Item>

            <Pagehead>Choose main filters</Pagehead>

            <Stack.Item>
                <Stack direction={"horizontal"} wrap="wrap" gap="spacious">
                    <Stack.Item>
                        <ForksCountInput error={forksCountInputError}
                            onChangeHandler={handleForksCountChange} value={form.forksCount} />
                    </Stack.Item>

                    <Stack.Item>
                        <ForksQueryOrderInput onChangeHandler={handleForksOrderChange} selected={form.forksOrder} />
                    </Stack.Item>

                    <Stack.Item>
                        <ForksQueryOrderAscDescInput
                            onChangeHandler={handleForksOrderAscDescChange} selected={form.forksAscDesc} />
                    </Stack.Item>

                    <Stack.Item>
                        <CommitsDateRangeFromInput error={commitsDateRangeFromInputError}
                            onChangeHandler={handleCommitsDateRangeFromChange} value={form.commitsDateRangeFrom} />
                    </Stack.Item>

                    <Stack.Item>
                        <CommitsDateRangeUntilInput error={commitsDateRangeUntilInputError}
                            onChangeHandler={handleCommitsDateRangeUntilChange} value={form.commitsDateRangeUntil} />
                    </Stack.Item>
                </Stack>
            </Stack.Item>

            <Pagehead>Additional filters</Pagehead>

            <Stack.Item>
                <Stack direction="horizontal" wrap="wrap" gap="spacious">
                    <Stack.Item>
                        <ForksTypeFilterInput
                            onChangeHandler={handleForksTypeFilterChange} checked={form.forksTypeFilter} />
                    </Stack.Item>

                    <Stack.Item>
                        <OwnerTypeFilterInput
                            onChangeHandler={handleOwnerTypeFilterChange} checked={form.ownerTypeFilter} />
                    </Stack.Item>

                    <Stack.Item>
                        <RecentlyUpdatedInput error={recentlyUpdatedInputError}
                            onChangeHandler={handleRecentlyUpdatedChange} value={form.recentlyUpdated} />
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
