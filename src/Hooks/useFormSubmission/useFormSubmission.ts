import { CommitsDateRangeFromInputValidation }
    from "@Components/ConfigurationPane/FilterForm/CommitsDateRangeFromInput/CommitsDateRangeFromInput";
import { CommitsDateRangeUntilInputValidation }
    from "@Components/ConfigurationPane/FilterForm/CommitsDateRangeUntilInput/CommitsDateRangeUntilInput";
import { ForksCountInputValidation }
    from "@Components/ConfigurationPane/FilterForm/ForksCountInput/ForksCountInput";
import { RecentlyUpdatedInputValidation }
    from "@Components/ConfigurationPane/FilterForm/RecentlyUpdatedInput/RecentlyUpdatedInput";
import { RepositoryInputValidation }
    from "@Components/ConfigurationPane/FilterForm/RepositoryInput/RepositoryInput";
import { FormState } from "@Hooks/useFilterForm/useFilterForm";
import React, { useCallback, useState } from "react";

function useFormSubmission(form: FormState) {
    const [repositoryInputValidation, setRepositoryInputValidation] = useState<RepositoryInputValidation>();
    const [forksCountInputValidation, setForksCountInputValidation] = useState<ForksCountInputValidation>();
    const [recentlyUpdatedInputValidation, setRecentlyUpdatedInputValidation] =
        useState<RecentlyUpdatedInputValidation>();
    const [commitsDateRangeFromInputValidation, setCommitsDateRangeFromInputValidation] =
        useState<CommitsDateRangeFromInputValidation>();
    const [commitsDateRangeUntilInputValidation, setCommitsDateRangeUntilInputValidation]
        = useState<CommitsDateRangeUntilInputValidation>();

    const onSubmit = useCallback((event: React.FormEvent) => {
        // Prevents the page from refreshing on submission
        event.preventDefault();

        console.log(form);
        setRepositoryInputValidation("repositoryNameError");
        setForksCountInputValidation("lessThanMinForksError");
        setRecentlyUpdatedInputValidation("outOfInputRange");
        setCommitsDateRangeFromInputValidation("laterFromDateError");
        setCommitsDateRangeUntilInputValidation("laterFromDateError");
        // set url variables
    }, [form]);

    return {
        onSubmit,
        repositoryInputValidation,
        forksCountInputValidation,
        commitsDateRangeFromInputValidation,
        commitsDateRangeUntilInputValidation,
        recentlyUpdatedInputValidation
    };
}

export {
    useFormSubmission
};
