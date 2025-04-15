import { Box, Button, Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";

import { RepositoryInput } from "@FormElements/RepositoryInput/RepositoryInput";
import { ForksCountInput } from "@FormElements/ForksCountInput/ForksCountInput";
import { RecentlyUpdatedInput } from "@FormElements/RecentlyUpdatedInput/RecentlyUpdatedInput";
import { CommitsDateRangeFromInput } from "@FormElements/CommitsDateRangeFromInput/CommitsDateRangeFromInput";
import { ForksQueryOrderInput } from "@FormElements/ForksQueryOrderInput/ForksQueryOrderInput";
import { CommitTypeFilterInput } from "@FormElements/CommitsTypeFilterInput/CommitsTypeFilterInput";
import { OwnerTypeFilterInput } from "@FormElements/OwnerTypeFilterInput/OwnerTypeFilterInput";
import { CommitsDateRangeUntilInput } from "@FormElements/CommitsDateRangeUntilInput/CommitsDateRangeUntilInput";
import { useFilterForm } from "@Hooks/useFilterForm";
import { useFormSubmission } from "@Hooks/useFormSubmission";
import { FilterChangeHandler } from "@Hooks/useFilteredData";
import { useAuth } from "@Providers/AuthProvider";
import { memo, useMemo } from "react";

interface FilterFormProps {
    filterChangeHandler: FilterChangeHandler;
    isDataLoading: boolean;
}

/**
 * Component that renders the filter form for the configuration pane.
 * It includes various input fields for filtering repositories based on different criteria.
 */
function FilterForm({ filterChangeHandler, isDataLoading }: FilterFormProps) {
    // Hook to manage form state and handle changes
    const {
        form,
        handleRepositoryChange,
        handleForksCountChange,
        handleForksOrderChange,
        handleCommitsDateRangeFromChange,
        handleCommitsDateRangeUntilChange,
        handleCommitsTypeFilterChange,
        handleOwnerTypeFilterChange,
        handleRecentlyUpdatedChange,
    } = useFilterForm();

    // Hook to handle form submission and validation
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

    // Hook to manage authentication state
    const { isAuthenticated } = useAuth();

    // Memoize the form inputs to avoid unnecessary re-renders

    // Repository field
    const repositoryInput = useMemo(
        () => (
            <RepositoryInput
                error={repositoryInputError}
                onChangeHandler={handleRepositoryChange}
                value={form.repository}
            />
        ),
        [repositoryInputError, handleRepositoryChange, form.repository]
    );

    // Number of forks to select
    const forksCountInput = useMemo(
        () => (
            <ForksCountInput
                error={forksCountInputError}
                onChangeHandler={handleForksCountChange}
                value={form.forksCount}
            />
        ),
        [forksCountInputError, handleForksCountChange, form.forksCount]
    );

    // Order criteria of forks to select
    const forksOrderInput = useMemo(
        () => (
            <ForksQueryOrderInput
                onChangeHandler={handleForksOrderChange}
                selected={form.forksOrder}
                error={forksOrderInputError}
            />
        ),
        [forksOrderInputError, handleForksOrderChange, form.forksOrder]
    );

    // Start date of commits to select
    const commitsDateRangeFromInput = useMemo(
        () => (
            <CommitsDateRangeFromInput
                error={commitsDateRangeFromInputError}
                onChangeHandler={handleCommitsDateRangeFromChange}
                value={form.commitsDateRangeFrom}
            />
        ),
        [commitsDateRangeFromInputError, handleCommitsDateRangeFromChange, form.commitsDateRangeFrom]
    );

    // End date of commits to select
    const commitsDateRangeUntilInput = useMemo(
        () => (
            <CommitsDateRangeUntilInput
                error={commitsDateRangeUntilInputError}
                onChangeHandler={handleCommitsDateRangeUntilChange}
                value={form.commitsDateRangeUntil}
            />
        ),
        [commitsDateRangeUntilInputError, handleCommitsDateRangeUntilChange, form.commitsDateRangeUntil]
    );

    // Commit types to include in the visualization
    const commitTypeFilterInput = useMemo(
        () => (
            <CommitTypeFilterInput
                onChangeHandler={handleCommitsTypeFilterChange}
                checked={form.commitTypeFilter}
                error={commitsTypeFilterInputError}
            />
        ),
        [commitsTypeFilterInputError, handleCommitsTypeFilterChange, form.commitTypeFilter]
    );

    // Owner types to include in the visualization
    // (e.g., user, organization)
    const ownerTypeFilterInput = useMemo(
        () => (
            <OwnerTypeFilterInput
                onChangeHandler={handleOwnerTypeFilterChange}
                checked={form.ownerTypeFilter}
                error={ownerTypeFilterInputError}
            />
        ),
        [ownerTypeFilterInputError, handleOwnerTypeFilterChange, form.ownerTypeFilter]
    );

    // How recent the forks should be updated to include
    const recentlyUpdatedInput = useMemo(
        () => (
            <RecentlyUpdatedInput
                error={recentlyUpdatedInputError}
                onChangeHandler={handleRecentlyUpdatedChange}
                value={form.recentlyUpdated}
            />
        ),
        [recentlyUpdatedInputError, handleRecentlyUpdatedChange, form.recentlyUpdated]
    );

    // Render the form with all the inputs
    return (
        <Box as="form" onSubmit={onSubmit}>
            <Stack direction={"vertical"}>
                <Stack.Item>{repositoryInput}</Stack.Item>

                <Pagehead>Choose main filters</Pagehead>

                <Stack.Item>
                    <Stack direction={"horizontal"} wrap="wrap" gap="spacious">
                        <Stack.Item>{forksCountInput}</Stack.Item>
                        <Stack.Item>{forksOrderInput}</Stack.Item>
                        <Stack.Item>{commitsDateRangeFromInput}</Stack.Item>
                        <Stack.Item>{commitsDateRangeUntilInput}</Stack.Item>
                    </Stack>
                </Stack.Item>

                <Pagehead>Additional filters</Pagehead>

                <Stack.Item>
                    <Stack direction="horizontal" wrap="wrap" gap="spacious">
                        <Stack.Item>{commitTypeFilterInput}</Stack.Item>
                        <Stack.Item>{ownerTypeFilterInput}</Stack.Item>
                        <Stack.Item>{recentlyUpdatedInput}</Stack.Item>
                    </Stack>
                </Stack.Item>

                <Stack.Item>
                    <Button
                        type="submit"
                        disabled={!isAuthenticated || isDataLoading}
                        loading={isDataLoading}
                        size="large"
                        block>
                        Submit
                    </Button>
                </Stack.Item>
            </Stack>
        </Box>
    );
};

export default memo(FilterForm);
