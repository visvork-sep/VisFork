import { CommitsDateRangeFromInputValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/CommitsDateRangeFromInput";
import { CommitsDateRangeUntilInputValidation }
    from "@Components/ConfigurationPane/FilterFormElements/CommitsDateRangeUntilInput";
import { ForksCountInputValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/ForksCountInput";
import { RecentlyUpdatedInputValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/RecentlyUpdatedInput";
import { RepositoryInputValidation } 
    from "@Components/ConfigurationPane/FilterFormElements/RepositoryInput";
import { FormState } from "@Hooks/useFilterForm";
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
