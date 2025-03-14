import { MAX_QUERIABLE_FORKS, MIN_QUERIABLE_FORKS, RECENT_ACTIVITY_MAX_MONTHS, RECENT_ACTIVITY_MIN_MONTHS }
    from "@Utils/Constants";

interface FormError {
    message: string
};

// Dynamic error-generating methods that return objects
const unknownError = (): FormError => ({ message: "Unknown error" });

const laterFromDateError = (from: string, until: string) => (
    { message: `The date range is not valid, make sure the from date is before the until date.
        from: ${from}, until: ${until}` }
);

const futureUntilDateError = (date: string) => (
    { message: `Future dates are not allowed for the until field: ${date}` }
);

const forksCountLessThanMinForksError = () => (
    { message: `Number of forks must be greater than ${MIN_QUERIABLE_FORKS}` }
);

const forksCountGreaterThanMaxForksError = () => ({ message: `Number of forks must be less than ${MAX_QUERIABLE_FORKS}` });

const nonIntegralError = () => ({ message: "Value must be integral"});

const repositorySyntaxError = () => ({ message: "Syntax must match <Owner>/<RepositoryName>" });

const ownerError = () => ({ message: "Invalid repository owner" });

const repositoryNameError = () => ({ message: "Invalid repository name" });

const forbiddenCharacterError = (forbidden: string): FormError => (
    { message: `Forbidden character in input: ${forbidden}` }
);

const outOfRecentlyUpdatedRangeError = () => ({
    message: `Can only filter on recent updates between 
            ${RECENT_ACTIVITY_MIN_MONTHS} ago and ${RECENT_ACTIVITY_MAX_MONTHS} ago`
});

// Error objects with dynamic methods
const CommitsDateRangeFromInputErrors = {
    LaterFromDateError: laterFromDateError,
    UnknownError: unknownError,
    ForbiddenCharacterError: forbiddenCharacterError
} as const;

const CommitsDateRangeUntilInputErrors = {
    LaterFromDateError: laterFromDateError,
    UnknownError: unknownError,
    FutureUntilDateError: futureUntilDateError,
    ForbiddenCharacterError: forbiddenCharacterError
} as const;

const ForksCountInputErrors = {
    LessThanMinForksError: forksCountLessThanMinForksError,
    GreaterThanMaxForksError: forksCountGreaterThanMaxForksError,
    UnknownError: unknownError,
    ForbiddenCharacterError: forbiddenCharacterError,
    NonIntegralError: nonIntegralError
} as const;

const RepositoryInputErrors = {
    RepositorySyntaxError: repositorySyntaxError,
    OwnerError: ownerError,
    RepositoryNameError: repositoryNameError,
    UnknownError: unknownError,
    ForbiddenCharacterError: forbiddenCharacterError
} as const;

const RecentlyUpdatedInputErrors = {
    OutOfRecentlyUpdatedRangeError: outOfRecentlyUpdatedRangeError,
    UnknownError: unknownError,
    ForbiddenCharacterError: forbiddenCharacterError,
    NonIntegralError: nonIntegralError
} as const;

// Deriving types based on the returned object structure (the error message)
type CommitsDateRangeFromInputErrorsType =
    ReturnType<typeof CommitsDateRangeFromInputErrors[keyof typeof CommitsDateRangeFromInputErrors]>;
type CommitsDateRangeUntilInputErrorsType =
    ReturnType<typeof CommitsDateRangeUntilInputErrors[keyof typeof CommitsDateRangeUntilInputErrors]>;
type ForksCountInputErrorsType =
    ReturnType<typeof ForksCountInputErrors[keyof typeof ForksCountInputErrors]>;
type RepositoryInputErrorsType =
    ReturnType<typeof RepositoryInputErrors[keyof typeof RepositoryInputErrors]>;
type RecentlyUpdatedInputErrorsType =
    ReturnType<typeof RecentlyUpdatedInputErrors[keyof typeof RecentlyUpdatedInputErrors]>;

// Exporting the error objects and types
export {
    CommitsDateRangeFromInputErrors,
    CommitsDateRangeUntilInputErrors,
    ForksCountInputErrors,
    RepositoryInputErrors,
    RecentlyUpdatedInputErrors
};

export type {
    CommitsDateRangeFromInputErrorsType,
    CommitsDateRangeUntilInputErrorsType,
    ForksCountInputErrorsType,
    RepositoryInputErrorsType,
    RecentlyUpdatedInputErrorsType
};
