import { FORKSASCDESC, FORKSCOUNT_INITAL_VALUE, FORKSORDER_OPTIONS, FORKTYPES, OWNERTYPES } from "@Utils/Constants";
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
    forksCount: FORKSCOUNT_INITAL_VALUE,
    forksOrder: FORKSORDER_OPTIONS[0],
    forksAscDesc: FORKSASCDESC[0],
    forksTypeFilter: FORKTYPES,
    ownerTypeFilter: OWNERTYPES,
};

function useFilterForm() {
    const [form, setForm] = useState<FormState>(initialForm);

    const handleRepositoryChange = useCallback((input: string) => {
        const words = input.split("/");
        if (words.length !== 2) {
            setForm((previousForm) => ({
                ...previousForm,
                repositoryOwner: words[0]
            }));
        }

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
        if (!FORKSORDER_OPTIONS.includes(value)) return;

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
export type { FormState };
