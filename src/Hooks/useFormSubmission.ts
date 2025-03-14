
import { FormEvent, useCallback, useState } from "react";
import { FilterFormState } from "../Types/FilterForm";
import sanitizeString from "@Utils/Sanitize";


function isValidDate(input: string): boolean {
    // eslint-disable-next-line max-len
    const regex = /(^(y{4}|y{2})[./-](m{1,2})[./-](d{1,2})$)|(^(m{1,2})[./-](d{1,2})[./-]((y{4}|y{2})$))|(^(d{1,2})[./-](m{1,2})[./-]((y{4}|y{2})$))/gi;

    return regex.test(input);
}

function isValidInteger(input: string): boolean {
    const regex = /^(0|[1-9][0-9]*)$/;

    return regex.test(input);
}


function useFormSubmission(form: FilterFormState) {
    const [repositoryInputError, setRepositoryInputError] = useState<RepositoryInputErrorsType>();
    const [forksCountInputError, setForksCountInputError] = useState<ForksCountInputErrorsType>();
    const [recentlyUpdatedInputError, setRecentlyUpdatedInputError] =
        useState<RecentlyUpdatedInputErrorsType>();
    const [commitsDateRangeFromInputError, setCommitsDateRangeFromInputError] =
        useState<CommitsDateRangeFromInputErrorsType>();
    const [commitsDateRangeUntilInputError, setCommitsDateRangeUntilInputError]
        = useState<CommitsDateRangeUntilInputErrorsType>();

    const prepareRepository = useCallback((input: string): 
        {owner: string, repositoryName: string} | RepositoryInputErrorsType => {
        const {output, conflicts} = sanitizeString(input);
        if (conflicts) {
            return RepositoryInputErrors.ForbiddenCharacterError(conflicts.toLocaleString());
        }

        const words = output.split("/");

        if (words.length != 2) {
            return RepositoryInputErrors.RepositorySyntaxError();    
        }

        const owner = words[0];
        const repositoryName = words[1];

        return {
            owner,
            repositoryName
        };
    }, []);

    const prepareForksCount = useCallback((input?: string): number | ForksCountInputErrorsType => {
        if (!input) {
            return ForksCountInputErrors.NonIntegralError();
        }


        const {output, conflicts} = sanitizeString(input);
        if (conflicts) {
            return ForksCountInputErrors.ForbiddenCharacterError(conflicts.toLocaleString());
        }

        if (!isValidInteger(input)) {
            return ForksCountInputErrors.NonIntegralError();
        }

        return Number(input);
    }, []);

    const prepareForksOrder = useCallback((input: string): null => {
        const {output, conflicts} = sanitizeString(input);

        return null;
    }, []);

    const prepareForksOrderAscDesc = useCallback((input: string): null => {
        const {output, conflicts} = sanitizeString(input);

        return null;
    }, []);

    const prepareCommitsDateRangeFrom = useCallback((input: string): Date | CommitsDateRangeFromInputErrorsType => {
        const {output, conflicts} = sanitizeString(input);
        if (conflicts) {
            return CommitsDateRangeFromInputErrors.ForbiddenCharacterError(conflicts.toLocaleString());
        }

        if(!isValidDate(output)) {
            return CommitsDateRangeFromInputErrors.UnknownError();
        }

        return new Date(input);
    }, []);

    const prepareCommitsDateRangeUntil = useCallback((input: string): Date | CommitsDateRangeUntilInputErrorsType => {
        const { output, conflicts } = sanitizeString(input);
        if (conflicts) {
            return CommitsDateRangeUntilInputErrors.ForbiddenCharacterError(conflicts.toLocaleString());
        }

        if(!isValidDate) {
            return CommitsDateRangeUntilInputErrors.UnknownError();
        }

        return new Date(input);
    }, []);

    const prepareForksTypeFilter = useCallback((forkTypes: string[]) => {
        const outputs = [];
        forkTypes.forEach(element => {
            const {output, conflicts} = sanitizeString(element);

            outputs.push(output);
        });

        return null;
    }, []);

    const prepareOwnerTypeFilter = useCallback((ownerTypes: string[]) => {
        const outputs = [];
        ownerTypes.forEach(element => {
            const { output, conflicts } = sanitizeString(element);

            outputs.push(output);
        });

        return null;
    }, []);

    const prepareRecentlyUpdated = useCallback((input?: string): number | RecentlyUpdatedInputErrorsType => {
        if (!input) {
            return RecentlyUpdatedInputErrors.NonIntegralError());
        }

        const {output, conflicts} = sanitizeString(input);
        if (conflicts) {
            return RecentlyUpdatedInputErrors.ForbiddenCharacterError(conflicts.toLocaleString());
        }

        if(!isValidInteger(output)) {
            return RecentlyUpdatedInputErrors.NonIntegralError();
        }

        return Number(input);
    } ,[]);

    const onSubmit = useCallback((event: FormEvent) => {
        // Prevents the page from refreshing on submission
        event.preventDefault();
        const result = prepareRepository(form.repository);
        const forksCount = prepareForksCount("");
        const forksOrder = prepareForksOrder(form.forksOrder);
        const forksAscDesc = prepareForksOrderAscDesc(form.forksAscDesc);
        const commitsDateRangeFrom = prepareCommitsDateRangeFrom(form.commitsDateRangeFrom);
        const commitsDateRangeUntil = prepareCommitsDateRangeUntil(form.commitsDateRangeUntil);
        const forksTypeFilter = prepareForksTypeFilter(form.forksTypeFilter);
        const ownerTypeFilter = prepareOwnerTypeFilter(form.ownerTypeFilter);
        const recentlyUpdated = prepareRecentlyUpdated(form.recentlyUpdated);

        if (result instanceof RepositoryInputErrorType)


        //TODO add proper verification and error handling
        //Error passing - not implemented
        setForksCountInputError(ForksCountInputErrors.UnknownError());
        setRecentlyUpdatedInputError(RecentlyUpdatedInputErrors.UnknownError());
        setCommitsDateRangeFromInputError(CommitsDateRangeFromInputErrors.UnknownError());
        setCommitsDateRangeUntilInputError(CommitsDateRangeUntilInputErrors.UnknownError());
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
