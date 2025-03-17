
import { FormEvent, useCallback, useState } from "react";
import { FilterFormState } from "../Types/FilterForm";
import { InputError } from "../Types/FormErrors";


function useFormSubmission(form: FilterFormState) {
    const [repositoryInputError, setRepositoryInputError] = useState<InputError | null>(null);
    const [forksCountInputError, setForksCountInputError] = useState<InputError | null>(null);
    const [recentlyUpdatedInputError, setRecentlyUpdatedInputError] =
        useState<InputError | null>(null);
    const [commitsDateRangeFromInputError, setCommitsDateRangeFromInputError] =
        useState<InputError | null>(null);
    const [commitsDateRangeUntilInputError, setCommitsDateRangeUntilInputError]
        = useState<InputError | null>(null);

    const onSubmit = useCallback((event: FormEvent) => {
        // Prevents the page from refreshing on submission
        event.preventDefault();

        console.log(form);
        //TODO add proper verification and error handling
        //Error passing - not implemented
        setRepositoryInputError(null);
        setForksCountInputError(null);
        setRecentlyUpdatedInputError(null);
        setCommitsDateRangeFromInputError(null);
        setCommitsDateRangeUntilInputError(null);
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
