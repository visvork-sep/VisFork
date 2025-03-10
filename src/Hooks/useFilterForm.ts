import { useState, useCallback } from "react";
import { FilterFormState } from "../Types/FilterForm";
import { FORK_TYPES, FORKS_COUNT_INPUT_INITIAL, FORKS_SORTING_ORDERS, OWNER_TYPES, SORT_DIRECTION }
    from "@Utils/Constants";

const initialForm: FilterFormState = {
    repository: "",
    forksCount: FORKS_COUNT_INPUT_INITIAL,
    forksOrder: FORKS_SORTING_ORDERS.STARGAZERS.value,
    forksAscDesc: SORT_DIRECTION.ASCENDING.value,
    forksTypeFilter: [FORK_TYPES.ADAPTIVE.value, FORK_TYPES.CORRECTIVE.value, FORK_TYPES.PERFECTIVE.value],
    ownerTypeFilter: [OWNER_TYPES.ORGANIZATION.value, OWNER_TYPES.USER.value],
};

function useFilterForm() {
    const [form, setForm] = useState<FilterFormState>(initialForm);

    const handleRepositoryChange = useCallback((input: string) => {
        const words = input.split("/");
        if (words.length !== 2) return;

        setForm((prev) => ({
            ...prev,
            repositoryOwner: words[0],
            repositoryName: words[1],
        }));
    }, []);

    const handleForksCountChange = useCallback((input: string) => {
        const value = Number(input);

        setForm((prev) => ({ ...prev, forksCount: value ? value : undefined }));
    }, []);

    const handleForksOrderChange = useCallback((value: string) => {
        const validOrders = ["stargazers", "watchers", "last commit", "author", "date"];
        if (!validOrders.includes(value)) return;

        setForm((prev) => ({ ...prev, forksOrder: value }));
    }, []);

    // TODO add better form validation
    const handleForksOrderAscDescChange = useCallback((value: string) => {
        if (value !== "ascending" && value !== "descending") return;

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
