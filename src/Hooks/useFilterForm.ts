import { useState, useCallback } from "react";
import { FilterFormState } from "../Types/UIFormTypes";
import {
    COMMIT_TYPES,
    FORKS_COUNT_INPUT_INITIAL,
    FORKS_SORTING_ORDERS,
    OWNER_TYPES,
    SORT_DIRECTION,
    ForksSortingOrder,
    SortDirection,
    CommitType,
    OwnerType
} from "@Utils/Constants";

const date = new Date();
date.setFullYear(date.getFullYear() - 1);
const lastYear = date.toISOString().split("T")[0];


// Initial state for the filter form
const initialForm: FilterFormState = {
    repository: "", // Repository name input
    forksCount: FORKS_COUNT_INPUT_INITIAL, // Default fork count input
    forksOrder: FORKS_SORTING_ORDERS.STARGAZERS.value, // Default sorting order (by stargazers)
    forksAscDesc: SORT_DIRECTION.ASCENDING.value, // Default sorting direction (ascending)
    commitTypeFilter: [
        COMMIT_TYPES.ADAPTIVE.value,
        COMMIT_TYPES.PERFECTIVE.value,
        COMMIT_TYPES.UNKNOWN.value,
        COMMIT_TYPES.CORRECTIVE.value
    ],  // Default commit type filter (all types selected)
    ownerTypeFilter: [
        OWNER_TYPES.ORGANIZATION.value,
        OWNER_TYPES.USER.value
    ], // Default owner type filter (all types selected)
    commitsDateRangeFrom: lastYear,
    commitsDateRangeUntil: new Date().toISOString().split("T")[0], // End date for commits filter
    recentlyUpdated: "" // Recently updated filter input
};

function useFilterForm() {
    const [form, setForm] = useState<FilterFormState>(initialForm);

    /**
     * Updates the repository input field in the form state.
     * @param {string} input - The new repository name entered by the user.
     */
    const handleRepositoryChange = useCallback((input: string) => {
        setForm((prev) => ({
            ...prev,
            repository: input
        }));
    }, []);

    /**
     * Updates the forks count filter in the form state.
     * @param {string} input - The new fork count input as a string.
     */
    const handleForksCountChange = useCallback((input: string) => {
        setForm((prev) => ({ ...prev, forksCount: input }));
    }, []);

    /**
     * Updates the forks sorting order.
     * @param {string} value - 
     * The selected sorting order. Must be one of the defined sorting options in FORKS_SORTING_ORDERS.
     */
    const handleForksOrderChange = useCallback((value: string) => {
        setForm((prev) => ({ ...prev, forksOrder: value as ForksSortingOrder }));
    }, []);

    /**
     * Updates the sorting direction (ascending/descending) for forks.
     * @param {string} value - 
     * The selected sorting direction. Must be one of the defined sorting directions in SORT_DIRECTION.
     */
    const handleForksOrderAscDescChange = useCallback((value: string) => {
        setForm((prev) => ({ ...prev, forksAscDesc: value as SortDirection }));
    }, []);

    /**
     * Updates the start date for commit filtering.
     * @param {string} input - The new start date entered by the user.
     */
    const handleCommitsDateRangeFromChange = useCallback((input: string) => {
        setForm((prev) => ({ ...prev, commitsDateRangeFrom: input }));
    }, []);

    /**
     * Updates the end date for commit filtering.
     * @param {string} input - The new end date entered by the user.
     */
    const handleCommitsDateRangeUntilChange = useCallback((input: string) => {
        setForm((prev) => ({ ...prev, commitsDateRangeUntil: input }));
    }, []);

    /**
     * Updates the selected commit types for filtering.
     * 
     * @param {string[]} selected - 
     * An array of selected commit type values. Each value must be present in the predefined COMMIT_TYPES.
     */
    const handleCommitsTypeFilterChange = useCallback((selected: string[]) => {
        setForm((prev) => ({ ...prev, commitTypeFilter: selected as CommitType[] }));
    }, []);

    /**
     * Updates the selected owner types for filtering.
     * 
     * @param {string[]} selected - 
     * An array of selected owner type values. Each value must be present in the predefined OWNER_TYPES.
     */
    const handleOwnerTypeFilterChange = useCallback((selected: string[]) => {
        setForm((prev) => ({ ...prev, ownerTypeFilter: selected as OwnerType[] }));
    }, []);

    /**
     * Updates the recently updated filter input.
     * @param {string} input - The new value for the recently updated filter.
     */
    const handleRecentlyUpdatedChange = useCallback((input: string) => {
        setForm((prev) => ({ ...prev, recentlyUpdated: input }));
    }, []);

    return {
        form,
        handleRepositoryChange,
        handleForksCountChange,
        handleForksOrderChange,
        handleForksOrderAscDescChange,
        handleCommitsDateRangeFromChange,
        handleCommitsDateRangeUntilChange,
        handleCommitsTypeFilterChange,
        handleOwnerTypeFilterChange,
        handleRecentlyUpdatedChange,
    };
}

export {
    useFilterForm
};
