import { FormEvent, useState } from "react";
import { FilterFormState, preparedForm, preparedFormComplete } from "../Types/UIFormTypes";
import { CommitsDateRangeFromInputErrors, InputError } from "../Types/UIFormErrors";
import {
    prepareRepository,
    prepareForksCount,
    prepareForksOrder,
    prepareForksSortDirection,
    prepareCommitsDateRangeFrom,
    prepareCommitsDateRangeUntil,
    prepareCommitsTypeFilter,
    prepareOwnerTypeFilter,
    prepareRecentlyUpdated
} from "@Utils/Sanitize";
import { FilterChangeHandler } from "./useFilteredData";
import { filterFactory, forkQueryStateFactory, safePrepare } from "@Utils/FormSubmissionUtils";


// This hook is used to handle the form submission for the filter form.
function useFormSubmission(form: FilterFormState, onFiltersChange: FilterChangeHandler) {
    // States to set input errors per field
    const [repositoryInputError, setRepositoryInputError] = useState<InputError | null>(null);
    const [forksCountInputError, setForksCountInputError] = useState<InputError | null>(null);
    const [recentlyUpdatedInputError, setRecentlyUpdatedInputError] =
        useState<InputError | null>(null);
    const [commitsDateRangeFromInputError, setCommitsDateRangeFromInputError] =
        useState<InputError | null>(null);
    const [commitsDateRangeUntilInputError, setCommitsDateRangeUntilInputError]
        = useState<InputError | null>(null);
    const [commitsTypeFilterInputError, setCommitsTypeFilterInputError] = useState<InputError | null>(null);
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
    const prepareForm = (): preparedForm => {

        // Prepare each form field using safePrepare, destructuring the repository output into owner and repositoryName.
        // Each field's sanitized value is stored, and errors are set via corresponding error setters.
        // This ensures that invalid inputs become null for subsequent form validation.
        const output = safePrepare(prepareRepository, form.repository, setRepositoryInputError);
        const { owner, repositoryName } = output ?? { owner: null, repositoryName: null };

        const forksCount = safePrepare(prepareForksCount, form.forksCount, setForksCountInputError);

        const forksOrder = safePrepare(prepareForksOrder, form.forksOrder, setForksOrderInputError);

        const forksSortDirection = safePrepare(prepareForksSortDirection, form.forksAscDesc, setForksAscDescInputError);

        let commitsDateRangeFrom =
            safePrepare(prepareCommitsDateRangeFrom, form.commitsDateRangeFrom, setCommitsDateRangeFromInputError);

        let commitsDateRangeUntil =
            safePrepare(prepareCommitsDateRangeUntil, form.commitsDateRangeUntil, setCommitsDateRangeUntilInputError);

        const commitsTypeFilter =
            safePrepare(prepareCommitsTypeFilter, form.commitTypeFilter, setCommitsTypeFilterInputError);

        const ownerTypeFilter = safePrepare(prepareOwnerTypeFilter, form.ownerTypeFilter, setOwnerTypeFilterInputError);

        const recentlyUpdated = safePrepare(prepareRecentlyUpdated, form.recentlyUpdated, setRecentlyUpdatedInputError);

        // If the date range is invalid, set both dates to null and set the error
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
            commitsTypeFilter,
            ownerTypeFilter,
            recentlyUpdated
        };
    };

    // handle form submission
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
            || !preparedForm.commitsTypeFilter
            || !preparedForm.ownerTypeFilter
        ) {
            return;
        }

        const completeForm = preparedForm as preparedFormComplete;

        // Type assertion because we know that the form is complete
        onFiltersChange(filterFactory(completeForm), forkQueryStateFactory(completeForm));
    };

    return {
        onSubmit,
        repositoryInputError,
        forksCountInputError,
        commitsDateRangeFromInputError,
        commitsDateRangeUntilInputError,
        recentlyUpdatedInputError,
        commitsTypeFilterInputError,
        ownerTypeFilterInputError,
        forksOrderInputError,
        forksAscDescInputError
    };
}

export {
    useFormSubmission
};
