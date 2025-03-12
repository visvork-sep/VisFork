import { MAX_QUERIABLE_FORKS, MIN_QUERIABLE_FORKS, RECENT_ACTIVITY_MAX_MONTHS, RECENT_ACTIVITY_MIN_MONTHS }
    from "@Utils/Constants";

const unknownError = { message: "Unknown error" };

const laterFromDateError =
    { message: "The date range is not valid, make sure the from date is before the until date." };

const futureUntilDateError = { message: "Future dates are not allowed for the until field" };

const lessThanMinForksError = { message: `Number of forks must be greater than ${MIN_QUERIABLE_FORKS}` };

const greaterThanMaxForksError = { message: `Number of forks must be less than ${MAX_QUERIABLE_FORKS}` };

const repositorySyntaxError = { message: "Syntax must match <Owner>/<RepositoryName>" };

const ownerError = { message: "Invalid repository owner" };

const repositoryNameError = { message: "Invalid repository name" };

const outOfRecentlyUpdatedRangeError = {
    message: `Can only filter on recent updates between 
            ${RECENT_ACTIVITY_MIN_MONTHS} ago and ${RECENT_ACTIVITY_MAX_MONTHS} ago`
};

const CommitsDateRangeFromInputErrors = {
    LaterFromDateError: laterFromDateError,
    UnknownError: unknownError
} as const;

const CommitsDateRangeUntilInputErrors = {
    LaterFromDateError: laterFromDateError,
    UnknownError: unknownError,
    FutureUntilDateError: futureUntilDateError
} as const;

const ForksCountInputErrors = {
    LessThanMinForksError: lessThanMinForksError,
    GreaterThanMaxForksError: greaterThanMaxForksError,
    UnknownError: unknownError
} as const;

const RepositoryInputErrors = {
    RepositorySyntaxError: repositorySyntaxError,
    OwnerError: ownerError,
    RepositoryNameError: repositoryNameError,
    UnknownError: unknownError
} as const;

const RecentlyUpdatedInputErrors = {
    OutOfRecentlyUpdatedRangeError: outOfRecentlyUpdatedRangeError,
    UnknownError: unknownError
} as const;

// Derive strict types from error objects
type CommitsDateRangeFromInputErrorsType =
    typeof CommitsDateRangeFromInputErrors[keyof typeof CommitsDateRangeFromInputErrors];
type CommitsDateRangeUntilInputErrorsType =
    typeof CommitsDateRangeUntilInputErrors[keyof typeof CommitsDateRangeUntilInputErrors];
type ForksCountInputErrorsType = typeof ForksCountInputErrors[keyof typeof ForksCountInputErrors];
type RepositoryInputErrorsType = typeof RepositoryInputErrors[keyof typeof RepositoryInputErrors];
type RecentlyUpdatedInputErrorsType = typeof RecentlyUpdatedInputErrors[keyof typeof RecentlyUpdatedInputErrors];

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
