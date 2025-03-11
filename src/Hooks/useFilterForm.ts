import { useState, useCallback } from "react";
import { FilterFormState } from "../Types/FilterForm";
import { FORK_TYPES, FORKS_COUNT_INPUT_INITIAL, FORKS_SORTING_ORDERS, OWNER_TYPES, SORT_DIRECTION }
    from "@Utils/Constants";

const initialForm: FilterFormState = {
    repository: "",
    forksCount: FORKS_COUNT_INPUT_INITIAL,
    forksOrder: FORKS_SORTING_ORDERS.STARGAZERS.value,
    forksAscDesc: SORT_DIRECTION.ASCENDING.value,
    forksTypeFilter: Object.values(FORK_TYPES).map(t => t.value),
    ownerTypeFilter: Object.values(OWNER_TYPES).map(t => t.value),
    commitsDateRangeFrom: "",
    commitsDateRangeUntil: ""
};

function useFilterForm() {
    const [form, setForm] = useState<FilterFormState>(initialForm);

    const handleRepositoryChange = useCallback((input: string) => {
        setForm((prev) => ({
            ...prev,
            repository: input
        }));
    }, []);

    const handleForksCountChange = useCallback((input: string) => {
        const value = Number(input) || undefined;

        setForm((prev) => ({ ...prev, forksCount: value }));
    }, []);

    const handleForksOrderChange = useCallback((value: string) => {
        setForm((prev) => ({ ...prev, forksOrder: value }));
    }, []);

    // TODO add better form validation
    const handleForksOrderAscDescChange = useCallback((value: string) => {
        setForm((prev) => ({ ...prev, forksAscDesc: value }));
    }, []);

    const handleCommitsDateRangeFromChange = useCallback((input: string) => {
        setForm((prev) => ({ ...prev, commitsDateRangeFrom: input }));
    }, []);

    const handleCommitsDateRangeUntilChange = useCallback((input: string) => {
        setForm((prev) => ({ ...prev, commitsDateRangeUntil: input }));
    }, []);

    const handleForksTypeFilterChange = useCallback((selected: string[]) => {
        setForm((prev) => ({ ...prev, forksTypeFilter: selected }));
    }, []);

    const handleOwnerTypeFilterChange = useCallback((selected: string[]) => {
        setForm((prev) => ({ ...prev, ownerTypeFilter: selected }));
    }, []);

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
        handleForksTypeFilterChange,
        handleOwnerTypeFilterChange,
        handleRecentlyUpdatedChange,
    };
};

export {
    useFilterForm
};
