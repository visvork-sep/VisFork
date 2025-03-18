import { FormEvent, useState } from "react";
import { FilterFormState, preparedForm, preparedFormComplete } from "../Types/FilterForm";
import { CommitsDateRangeFromInputErrors, InputError } from "../Types/FormErrors";
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
import { FilterChangeHandler } from "./useFilteredData";
import { setInputError, filterFactory } from "@Utils/FormSubmissionUtils";
import { ForksSortingOrder, ForkType, OwnerType, SortDirection } from "@Utils/Constants";



function useFormSubmission(form: FilterFormState, onFiltersChange: FilterChangeHandler) {
    const [repositoryInputError, setRepositoryInputError] = useState<InputError | null>(null);
    const [forksCountInputError, setForksCountInputError] = useState<InputError | null>(null);
    const [recentlyUpdatedInputError, setRecentlyUpdatedInputError] =
        useState<InputError | null>(null);
    const [commitsDateRangeFromInputError, setCommitsDateRangeFromInputError] =
        useState<InputError | null>(null);
    const [commitsDateRangeUntilInputError, setCommitsDateRangeUntilInputError]
        = useState<InputError | null>(null);
    const [forksTypeFilterInputError, setForksTypeFilterInputError] = useState<InputError | null>(null);
    const [ownerTypeFilterInputError, setOwnerTypeFilterInputError] = useState<InputError | null>(null);
    const [forksOrderInputError, setForksOrderInputError] = useState<InputError | null>(null);
    const [forksAscDescInputError, setForksAscDescInputError] = useState<InputError | null>(null);

    /**
     * Prepares the form state for submission.
     * Any errors in the format of the form will be caught and the error will be set.
     * 
     * If any error is caught, that field will be set to null.
     * 
     * @returns {preparedForm} The prepared form state.
     */
    const prepareForm = (): preparedForm =>{
        let owner: string | null = null;
        let repositoryName: string | null = null;
        let forksCount: number | null = null;
        let forksOrder: ForksSortingOrder | null = null;
        let forksSortDirection: SortDirection | null = null;
        let commitsDateRangeFrom: Date | null = null;
        let commitsDateRangeUntil: Date | null = null;
        let forksTypeFilter: ForkType[] | null = null;
        let ownerTypeFilter: OwnerType[] | null = null;
        let recentlyUpdated: number | null = null; // non required

        try {
            const output = prepareRepository(form.repository);
            owner = output.owner;
            repositoryName = output.repositoryName;
            setRepositoryInputError(null);
        } catch (e) {
            setInputError(e, setRepositoryInputError);
        };

        try {
            forksCount = prepareForksCount(form.forksCount);
            setForksCountInputError(null);
        } catch (e) {
            setInputError(e, setForksCountInputError);
        }

        try {
            forksOrder = prepareForksOrder(form.forksOrder);
            setForksOrderInputError(null);
        } catch (e) {
            setInputError(e, setForksOrderInputError);
        }

        try {
            forksSortDirection = prepareForksSortDirection(form.forksAscDesc);
            setForksAscDescInputError(null);
        } catch (e) {
            setInputError(e, setForksAscDescInputError);
        }

        try {
            commitsDateRangeFrom = prepareCommitsDateRangeFrom(form.commitsDateRangeFrom);
            setCommitsDateRangeFromInputError(null);
        } catch (e) {
            setInputError(e, setCommitsDateRangeFromInputError);
        }

        try {
            commitsDateRangeUntil = prepareCommitsDateRangeUntil(form.commitsDateRangeUntil);
            setCommitsDateRangeUntilInputError(null);
        } catch (e) {
            setInputError(e, setCommitsDateRangeUntilInputError);
        }

        try {
            forksTypeFilter = prepareForksTypeFilter(form.forksTypeFilter);
            setForksTypeFilterInputError(null);
        } catch (e) {
            setInputError(e, setForksTypeFilterInputError);
        }

        try {
            ownerTypeFilter = prepareOwnerTypeFilter(form.ownerTypeFilter);
            setOwnerTypeFilterInputError(null);
        } catch (e) {
            setInputError(e, setOwnerTypeFilterInputError);
        }

        try {
            recentlyUpdated = prepareRecentlyUpdated(form.recentlyUpdated);
            setRecentlyUpdatedInputError(null);
        } catch (e) {
            setInputError(e, setRecentlyUpdatedInputError);
        }

        if (commitsDateRangeFrom && commitsDateRangeUntil && commitsDateRangeFrom > commitsDateRangeUntil) {
            setCommitsDateRangeFromInputError(new CommitsDateRangeFromInputErrors.LaterFromDateError());
            setCommitsDateRangeUntilInputError(new CommitsDateRangeFromInputErrors.LaterFromDateError());
            commitsDateRangeFrom = null;
            commitsDateRangeUntil = null;
        }

        return {
            owner,
            repositoryName,
            forksCount,
            forksOrder,
            forksSortDirection,
            commitsDateRangeFrom,
            commitsDateRangeUntil,
            forksTypeFilter,
            ownerTypeFilter,
            recentlyUpdated
        };
    };

    const onSubmit = (event: FormEvent) => {
        // Prevents the page from refreshing on submission
        event.preventDefault();
        
        const preparedForm = prepareForm();
        
        // If any of the required fields are null, the form is not ready for submission
        if (
            !preparedForm.owner
            || !preparedForm.repositoryName
            || !preparedForm.forksCount
            || !preparedForm.forksOrder
            || !preparedForm.forksSortDirection
            || !preparedForm.commitsDateRangeFrom
            || !preparedForm.commitsDateRangeUntil
            || !preparedForm.forksTypeFilter
            || !preparedForm.ownerTypeFilter
        ) {
            return;
        }
        
        // Type assertion because we know that the form is complete
        onFiltersChange(filterFactory(preparedForm as preparedFormComplete));
    };

    return {
        onSubmit,
        repositoryInputError,
        forksCountInputError,
        commitsDateRangeFromInputError,
        commitsDateRangeUntilInputError,
        recentlyUpdatedInputError,
        forksTypeFilterInputError,
        ownerTypeFilterInputError,
        forksOrderInputError,
        forksAscDescInputError
    };
}

export {
    useFormSubmission
};
