import { useCallback } from "react";
import { 
    RepositoryInputErrors,
    ForksCountInputErrors,
    CommitsDateRangeFromInputErrors,
    CommitsDateRangeUntilInputErrors,
    RecentlyUpdatedInputErrors 
} from "../Types/FormErrors";

function sanitizeString(str: string) {
    const pattern = /[^a-z0-9áéíóúñü .,_-`/]/gim;

    const output = str.replace(pattern, "").trim();
    const conflicts = str.match(pattern);
    return {
        output,
        conflicts
    };
}

function isValidDate(input: string): boolean {
    // eslint-disable-next-line max-len
    const regex = /(^(y{4}|y{2})[./-](m{1,2})[./-](d{1,2})$)|(^(m{1,2})[./-](d{1,2})[./-]((y{4}|y{2})$))|(^(d{1,2})[./-](m{1,2})[./-]((y{4}|y{2})$))/gi;

    return regex.test(input);
}

function isValidInteger(input: string): boolean {
    const regex = /^(0|[1-9][0-9]*)$/;

    return regex.test(input);
}

const prepareRepository = useCallback((input: string): { owner: string, repositoryName: string } => {
    const { output, conflicts } = sanitizeString(input);
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

    const { output, conflicts } = sanitizeString(input);
    if (conflicts) {
        throw new ForksCountInputErrors.ForbiddenCharactersError(conflicts);
    }

    if (!isValidInteger(input)) {
        throw new ForksCountInputErrors.NonIntegralError();
    }

    return Number(input);
}, []);

const prepareForksOrder = useCallback((input: string): unknown => {
    const { output } = sanitizeString(input);



    return output;
}, []);

const prepareForksSortDirection = useCallback((input: string): unknown => {
    const { output } = sanitizeString(input);

    return output;
}, []);

const prepareCommitsDateRangeFrom = useCallback((input: string): Date => {
    const { output, conflicts } = sanitizeString(input);
    if (conflicts) {
        throw new CommitsDateRangeFromInputErrors.ForbiddenCharactersError(conflicts);
    }

    if (!isValidDate(output)) {
        throw new CommitsDateRangeFromInputErrors.UnknownError();
    }

    return new Date(input);
}, []);

const prepareCommitsDateRangeUntil = useCallback((input: string): Date => {
    const { output, conflicts } = sanitizeString(input);
    if (conflicts) {
        throw new CommitsDateRangeUntilInputErrors.ForbiddenCharactersError(conflicts);
    }

    if (!isValidDate) {
        throw new CommitsDateRangeUntilInputErrors.UnknownError();
    }

    return new Date(input);
}, []);

const prepareForksTypeFilter = useCallback((forkTypes: string[]): unknown[] => {
    const outputs: string[] = [];
    forkTypes.forEach(element => {
        const { output } = sanitizeString(element);

        outputs.push(output);
    });

    return outputs;
}, []);

const prepareOwnerTypeFilter = useCallback((ownerTypes: string[]): unknown[] => {
    const outputs: string[] = [];
    ownerTypes.forEach(element => {
        const { output, conflicts } = sanitizeString(element);

        outputs.push(output);
    });

    return outputs;
}, []);

const prepareRecentlyUpdated = useCallback((input?: string): number => {
    if (!input) {
        throw new RecentlyUpdatedInputErrors.NonIntegralError();
    }

    const { output, conflicts } = sanitizeString(input);
    if (conflicts) {
        throw new RecentlyUpdatedInputErrors.ForbiddenCharactersError(conflicts);
    }

    if (!isValidInteger(output)) {
        throw new RecentlyUpdatedInputErrors.NonIntegralError();
    }

    return Number(input);
}, []);

export {
    prepareRepository,
    prepareForksCount,
    prepareForksOrder,
    prepareForksSortDirection,
    prepareCommitsDateRangeFrom,
    prepareCommitsDateRangeUntil,
    prepareForksTypeFilter,
    prepareOwnerTypeFilter,
    prepareRecentlyUpdated
};
