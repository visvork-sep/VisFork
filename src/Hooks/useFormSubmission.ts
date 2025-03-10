
import { FormEvent, useCallback, useState } from "react";
import { FilterFormState } from "../Types/FilterForm";
import {
    CommitsDateRangeFromInputErrors,
    CommitsDateRangeFromInputErrorsType,
    CommitsDateRangeUntilInputErrors,
    CommitsDateRangeUntilInputErrorsType,
    ForksCountInputErrors,
    ForksCountInputErrorsType,
    RecentlyUpdatedInputErrors,
    RecentlyUpdatedInputErrorsType,
    RepositoryInputErrors,
    RepositoryInputErrorsType
} from "../Types/FormErrors";

function useFormSubmission(form: FilterFormState) {
    const [repositoryInputError, setRepositoryInputError] = useState<RepositoryInputErrorsType>();
    const [forksCountInputError, setForksCountInputError] = useState<ForksCountInputErrorsType>();
    const [recentlyUpdatedInputError, setRecentlyUpdatedInputError] =
        useState<RecentlyUpdatedInputErrorsType>();
    const [commitsDateRangeFromInputError, setCommitsDateRangeFromInputError] =
        useState<CommitsDateRangeFromInputErrorsType>();
    const [commitsDateRangeUntilInputError, setCommitsDateRangeUntilInputError]
        = useState<CommitsDateRangeUntilInputErrorsType>();

    const onSubmit = useCallback((event: FormEvent) => {
        // Prevents the page from refreshing on submission
        event.preventDefault();

        console.log(form);
        setRepositoryInputError(RepositoryInputErrors.UnknownError);
        setForksCountInputError(ForksCountInputErrors.UnknownError);
        setRecentlyUpdatedInputError(RecentlyUpdatedInputErrors.UnknownError);
        setCommitsDateRangeFromInputError(CommitsDateRangeFromInputErrors.UnknownError);
        setCommitsDateRangeUntilInputError(CommitsDateRangeUntilInputErrors.UnknownError);
        // set url variables
    }, [form]);

    return {
        onSubmit,
        repositoryInputError,
        forksCountInputError,
        commitsDateRangeFromInputError,
        commitsDateRangeUntilInputError,
        recentlyUpdatedInputError
    };
}

export {
    useFormSubmission
};
