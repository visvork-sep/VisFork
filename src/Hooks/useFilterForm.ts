import { useState, useCallback } from "react";
import { FilterFormState } from "../Types/FilterForm";
import { FORK_TYPES, FORKS_COUNT_INPUT_INITIAL, FORKS_SORTING_ORDERS, OWNER_TYPES, SORT_DIRECTION }
    from "@Utils/Constants";
import { assert } from "@Utils/Assert";

const initialForm: FilterFormState = {
    repository: "",
    forksCount: FORKS_COUNT_INPUT_INITIAL,
    forksOrder: FORKS_SORTING_ORDERS.STARGAZERS.value,
    forksAscDesc: SORT_DIRECTION.ASCENDING.value,
    forksTypeFilter: Object.values(FORK_TYPES).map(t => t.value),
    ownerTypeFilter: Object.values(OWNER_TYPES).map(t => t.value),
    commitsDateRangeFrom: "",
    commitsDateRangeUntil: "",
    recentlyUpdated: ""
};

function useFilterForm() {
    const [form, setForm] = useState<FilterFormState>(initialForm);

    const handleRepositoryChange = useCallback((input: string) => {
        setForm((prev) => ({
            ...prev,
            repository: input
        }));
    }, []);

    /**
     * Modifies the state of forksCount
     * Note that the count will be set to undefined if the input is not a number.
     */
    const handleForksCountChange = useCallback((input: string) => {


        setForm((prev) => ({ ...prev, forksCount: input }));
    }, []);


    /**
     * Changes the state for forksOrder,
     * 
     * @precondition value \in Object.values(FORKS_SORTING_ORDERS).map(t => t.value)
     */
    const handleForksOrderChange = useCallback((value: string) => {
        assert(Object.values(FORKS_SORTING_ORDERS).map(t => t.value).includes(value), "Precondition broken");

        setForm((prev) => ({ ...prev, forksOrder: value }));
    }, []);

    /**
     * Changes the state for forksOrderAscDesc
     * 
     * @precondition value \in Object.values(SORT_DIRECTION).map(t => t.value) 
     */
    const handleForksOrderAscDescChange = useCallback((value: string) => {
        setForm((prev) => ({ ...prev, forksAscDesc: value }));
    }, []);

    /**
     * Changes the state of commitsDateRangeFrom
     */
    const handleCommitsDateRangeFromChange = useCallback((input: string) => {
        setForm((prev) => ({ ...prev, commitsDateRangeFrom: input }));
    }, []);

    /**
     * Changes the state of commitsDateRangeUntil
     */
    const handleCommitsDateRangeUntilChange = useCallback((input: string) => {
        setForm((prev) => ({ ...prev, commitsDateRangeUntil: input }));
    }, []);

    /**
     * Changes the state of forksTypeFilter
     * 
     * @precondition (\all : string s \in selected : s \in FORK_TYPES)
     */
    const handleForksTypeFilterChange = useCallback((selected: string[]) => {
        setForm((prev) => ({ ...prev, forksTypeFilter: selected }));
    }, []);

    /**
     * Changes the state of onwerTypeFilter
     * 
     * @precondition (\all : string s \in selected : s \in OWNER_TYPES)
     */
    const handleOwnerTypeFilterChange = useCallback((selected: string[]) => {
        setForm((prev) => ({ ...prev, ownerTypeFilter: selected }));
    }, []);

    /**
     * Modifies the state of recentlyUpdated
     * Note that the count will be set to undefined if the input is not a number.
     */
    const handleRecentlyUpdatedChange = useCallback((input: string) => {
        setForm((prev) => ({ ...prev, recentlyUpdated: input}));
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
