import { Dispatch, FormEvent, SetStateAction, useCallback, useState } from "react";
import { FilterFormState } from "../Types/FilterForm";
import { InputError, UnknownError } from "../Types/FormErrors";
import { 
    prepareRepository,
    prepareForksCount, 
    prepareForksOrder, 
    prepareForksSortDirection, 
    prepareCommitsDateRangeFrom, 
    prepareCommitsDateRangeUntil, 
    prepareForksTypeFilter, 
    prepareOwnerTypeFilter, 
    prepareRecentlyUpdated 
} from "@Utils/Sanitize";

function setInputError(e: unknown, setter: Dispatch<SetStateAction<InputError | null>>) {
    if (e instanceof InputError) {
        setter(e);
    } else {
        setter(new UnknownError());
    }
}

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
        let owner: string | undefined = undefined;
        let repositoryName: string | undefined = undefined;
        let forksCount: number | undefined = undefined;
        let forksOrder: unknown | undefined = undefined;
        let forksSortDirection: unknown | undefined = undefined;
        let commitsDateRangeFrom: Date | undefined = undefined;
        let commitsDateRangeUntil: Date | undefined = undefined;
        let forksTypeFilter: unknown[] | undefined = undefined;
        let ownerTypeFilter: unknown[] | undefined = undefined;
        let recentlyUpdated: unknown | undefined = undefined;
        
        try {
            const output = prepareRepository(form.repository);
            owner = output.owner;
            repositoryName = output.repositoryName;
        } catch(e) {
            setInputError(e, setRepositoryInputError);
        };

        try {
            forksCount = prepareForksCount(form.forksCount);
        } catch (e) {
            setInputError(e, setForksCountInputError);
        }

        try {
            forksOrder = prepareForksOrder(form.forksOrder);
        } catch (e) {
            alert(e);
        }

        try {
            forksSortDirection = prepareForksSortDirection(form.forksAscDesc);
        } catch (e) {
            alert(e);
        }

        try {
            commitsDateRangeFrom = prepareCommitsDateRangeFrom(form.commitsDateRangeFrom);
        } catch (e) {
            setInputError(e, setCommitsDateRangeFromInputError);
        }

        try {
            commitsDateRangeUntil = prepareCommitsDateRangeUntil(form.commitsDateRangeUntil);
        } catch (e) {
            setInputError(e, setCommitsDateRangeUntilInputError);
        }

        try {
            forksTypeFilter = prepareForksTypeFilter(form.forksTypeFilter);
        } catch (e) {
            alert(e);
        }

        try {
            ownerTypeFilter = prepareOwnerTypeFilter(form.ownerTypeFilter);
        } catch (e) {
            alert(e);
        }

        try {
            recentlyUpdated = prepareRecentlyUpdated(form.recentlyUpdated);
        } catch (e) {
            setInputError(e, setRecentlyUpdatedInputError);
        }
        
        if (!owner 
            || !repositoryName 
            || !forksCount 
            || !forksOrder 
            || !forksSortDirection 
            || !commitsDateRangeFrom 
            || !commitsDateRangeUntil 
            || !forksTypeFilter 
            || !ownerTypeFilter 
            || !recentlyUpdated
        ) {
            return;
        }

    }, []);

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
