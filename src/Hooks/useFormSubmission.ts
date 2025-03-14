import { FormEvent, useCallback, useState } from "react";
import { FilterFormState } from "../Types/FilterForm";
import sanitizeString from "@Utils/Sanitize";
import { CommitsDateRangeFromInputErrors, CommitsDateRangeUntilInputErrors, ForksCountInputErrors, InputError, RecentlyUpdatedInputErrors, RepositoryInputErrors } from "../Types/FormErrors";

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
    const [repositoryInputError, setRepositoryInputError] = useState<InputError | null>(null);
    const [forksCountInputError, setForksCountInputError] = useState<InputError | null>(null);
    const [recentlyUpdatedInputError, setRecentlyUpdatedInputError] =
        useState<InputError | null>(null);
    const [commitsDateRangeFromInputError, setCommitsDateRangeFromInputError] =
        useState<InputError | null>(null);
    const [commitsDateRangeUntilInputError, setCommitsDateRangeUntilInputError]
        = useState<InputError | null>(null);

    const prepareRepository = useCallback((input: string): {owner: string, repositoryName: string} => {
        const {output, conflicts} = sanitizeString(input);
        if (conflicts) {
            throw new RepositoryInputErrors.ForbiddenCharactersError(conflicts);
        }

        const words = output.split("/");

        if (words.length != 2) {
            throw new RepositoryInputErrors.RepositorySyntaxError();    
        }

        const owner = words[0];
        const repositoryName = words[1];

        return {
            owner,
            repositoryName
        };
    }, []);

    const prepareForksCount = useCallback((input?: string): number => {
        if (!input) {
            throw new ForksCountInputErrors.NonIntegralError();
        }


        const {output, conflicts} = sanitizeString(input);
        if (conflicts) {
            throw new  ForksCountInputErrors.ForbiddenCharactersError(conflicts);
        }

        if (!isValidInteger(input)) {
            throw new ForksCountInputErrors.NonIntegralError();
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

    const prepareCommitsDateRangeFrom = useCallback((input: string): Date => {
        const {output, conflicts} = sanitizeString(input);
        if (conflicts) {
            throw new CommitsDateRangeFromInputErrors.ForbiddenCharactersError(conflicts);
        }

        if(!isValidDate(output)) {
            throw new CommitsDateRangeFromInputErrors.UnknownError();
        }

        return new Date(input);
    }, []);

    const prepareCommitsDateRangeUntil = useCallback((input: string): Date => {
        const { output, conflicts } = sanitizeString(input);
        if (conflicts) {
            throw new CommitsDateRangeUntilInputErrors.ForbiddenCharactersError(conflicts);
        }

        if(!isValidDate) {
            throw new CommitsDateRangeUntilInputErrors.UnknownError();
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

    const prepareRecentlyUpdated = useCallback((input?: string): number => {
        if (!input) {
            throw new RecentlyUpdatedInputErrors.NonIntegralError();
        }

        const {output, conflicts} = sanitizeString(input);
        if (conflicts) {
            throw new RecentlyUpdatedInputErrors.ForbiddenCharactersError(conflicts);
        }

        if(!isValidInteger(output)) {
            throw new RecentlyUpdatedInputErrors.NonIntegralError();
        }

        return Number(input);
    } ,[]);

    const onSubmit = useCallback((event: FormEvent) => {
        // Prevents the page from refreshing on submission
        event.preventDefault();
        const {owner, repositoryName} = prepareRepository(form.repository);
        const forksCount = prepareForksCount("");
        const forksOrder = prepareForksOrder(form.forksOrder);
        const forksAscDesc = prepareForksOrderAscDesc(form.forksAscDesc);
        const commitsDateRangeFrom = prepareCommitsDateRangeFrom(form.commitsDateRangeFrom);
        const commitsDateRangeUntil = prepareCommitsDateRangeUntil(form.commitsDateRangeUntil);
        const forksTypeFilter = prepareForksTypeFilter(form.forksTypeFilter);
        const ownerTypeFilter = prepareOwnerTypeFilter(form.ownerTypeFilter);
        const recentlyUpdated = prepareRecentlyUpdated(form.recentlyUpdated);

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
