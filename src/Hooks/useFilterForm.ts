import { useState, useCallback } from "react";

interface FormState {
  repositoryOwner: string;
  repositoryName: string;
  forksCount: number;
  forksOrder: string;
  forksAscDesc: string;
  commitsDateRangeFrom?: string;
  commitsDateRangeUntil?: string;
  forksTypeFilter: string[];
  ownerTypeFilter: string[];
  recentlyUpdated?: string;
}

const initialForm: FormState = {
    repositoryOwner: "",
    repositoryName: "",
    forksCount: 0,
    forksOrder: "stargazers",
    forksAscDesc: "ascending",
    forksTypeFilter: [],
    ownerTypeFilter: [],
};

function useFilterForm() {
    const [form, setForm] = useState<FormState>(initialForm);

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
        const regex = /^[1-9]\d*$/;
        if (!regex.test(input)) return;

        const parsed = Number(input);
        if (!Number.isSafeInteger(parsed)) return;

        setForm((prev) => ({ ...prev, forksCount: parsed }));
    }, []);

    const handleForksOrderChange = useCallback((value: string) => {
        const validOrders = ["stargazers", "watchers", "last commit", "author", "date"];
        if (!validOrders.includes(value)) return;

        setForm((prev) => ({ ...prev, forksOrder: value }));
    }, []);

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
export type { FormState };
