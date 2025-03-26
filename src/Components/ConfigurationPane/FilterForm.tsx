import { Box, Button, Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";

import { RepositoryInput } from "@Components/ConfigurationPane/FilterFormElements/RepositoryInput";
import { ForksCountInput } from "@Components/ConfigurationPane/FilterFormElements/ForksCountInput";
import { RecentlyUpdatedInput } from "@Components/ConfigurationPane/FilterFormElements/RecentlyUpdatedInput";
import { CommitsDateRangeFromInput } from "@Components/ConfigurationPane/FilterFormElements/CommitsDateRangeFromInput";
import { ForksQueryOrderInput } from "@Components/ConfigurationPane/FilterFormElements/ForksQueryOrderInput";
import { CommitTypeFilterInput } from "@Components/ConfigurationPane/FilterFormElements/CommitsTypeFilterInput";
import { OwnerTypeFilterInput } from "@Components/ConfigurationPane/FilterFormElements/OwnerTypeFilterInput";
import { CommitsDateRangeUntilInput }
    from "@Components/ConfigurationPane/FilterFormElements/CommitsDateRangeUntilInput";
import { useFilterForm } from "@Hooks/useFilterForm";
import { useFormSubmission } from "@Hooks/useFormSubmission";
import { FilterChangeHandler } from "@Hooks/useFilteredData";
import { useAuth } from "@Providers/AuthProvider";

interface FilterFormProps {
    filterChangeHandler: FilterChangeHandler;
};

function FilterForm({ filterChangeHandler }: FilterFormProps) {
    const {
        form,
        handleRepositoryChange,
        handleForksCountChange,
        handleForksOrderChange,
        handleCommitsDateRangeFromChange,
        handleCommitsDateRangeUntilChange,
        handleCommitsTypeFilterChange,
        handleOwnerTypeFilterChange,
        handleRecentlyUpdatedChange
    } = useFilterForm();

    const {
        onSubmit,
        repositoryInputError,
        forksCountInputError,
        recentlyUpdatedInputError,
        commitsDateRangeFromInputError,
        commitsDateRangeUntilInputError,
        commitsTypeFilterInputError,
        ownerTypeFilterInputError,
        forksOrderInputError,
    } = useFormSubmission(form, filterChangeHandler);

    const { isAuthenticated } = useAuth();

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
                        <ForksQueryOrderInput
                            onChangeHandler={handleForksOrderChange}
                            selected={form.forksOrder}
                            error={forksOrderInputError} />
                    </Stack.Item>

                    {/* <Stack.Item>
                        <ForksQueryOrderAscDescInput
                            onChangeHandler={handleForksOrderAscDescChange} 
                            selected={form.forksAscDesc} 
                            error={forksOrderInputError}/>
                    </Stack.Item> */}

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
                        <CommitTypeFilterInput
                            onChangeHandler={handleCommitsTypeFilterChange}
                            checked={form.commitTypeFilter}
                            error={commitsTypeFilterInputError} />
                    </Stack.Item>

                    <Stack.Item>
                        <OwnerTypeFilterInput
                            onChangeHandler={handleOwnerTypeFilterChange}
                            checked={form.ownerTypeFilter}
                            error={ownerTypeFilterInputError} />
                    </Stack.Item>

                    <Stack.Item>
                        <RecentlyUpdatedInput error={recentlyUpdatedInputError}
                            onChangeHandler={handleRecentlyUpdatedChange} value={form.recentlyUpdated} />
                    </Stack.Item>
                </Stack>
            </Stack.Item>

            <Stack.Item>
                <Button type="submit" disabled={ !isAuthenticated }>Submit</Button>
            </Stack.Item>
        </Stack>
    </Box>;
}

export default FilterForm;
