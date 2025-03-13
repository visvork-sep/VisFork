import {
    MAX_QUERIABLE_FORKS,
    MIN_QUERIABLE_FORKS,
    RECENT_ACTIVITY_MAX_MONTHS,
    RECENT_ACTIVITY_MIN_MONTHS
} from "@Utils/Constants";

/**
 * Default error message for unknown issues.
 */
const unknownError = { message: "Unknown error" };

/**
 * Error message for invalid date ranges where the "from" date is after the "until" date.
 */
const laterFromDateError = {
    message: "The date range is not valid, make sure the 'from' date is before the 'until' date."
};

/**
 * Error message when the "until" date is set in the future.
 */
const futureUntilDateError = {
    message: "Future dates are not allowed for the 'until' field."
};

/**
 * Error message for forks count being below the minimum allowed threshold.
 */
const lessThanMinForksError = {
    message: `Number of forks must be greater than ${MIN_QUERIABLE_FORKS}.`
};

/**
 * Error message for forks count exceeding the maximum allowed threshold.
 */
const greaterThanMaxForksError = {
    message: `Number of forks must be less than ${MAX_QUERIABLE_FORKS}.`
};

/**
 * Error message for invalid repository input format.
 * Expected format: <Owner>/<RepositoryName>
 */
const repositorySyntaxError = {
    message: "Syntax must match <Owner>/<RepositoryName>."
};

/**
 * Error message when the repository owner is invalid.
 */
const ownerError = {
    message: "Invalid repository owner."
};

/**
 * Error message when the repository name is invalid.
 */
const repositoryNameError = {
    message: "Invalid repository name."
};

/**
 * Error message for recently updated filter values outside the allowed range.
 */
const outOfRecentlyUpdatedRangeError = {
    message: `Can only filter on recent updates between 
              ${RECENT_ACTIVITY_MIN_MONTHS} months ago and ${RECENT_ACTIVITY_MAX_MONTHS} months ago.`
};

/**
 * Errors related to the "From" date field in commit date range filters.
 */
const CommitsDateRangeFromInputErrors = {
    LaterFromDateError: laterFromDateError,
    UnknownError: unknownError
} as const;

/**
 * Errors related to the "Until" date field in commit date range filters.
 */
const CommitsDateRangeUntilInputErrors = {
    LaterFromDateError: laterFromDateError,
    UnknownError: unknownError,
    FutureUntilDateError: futureUntilDateError
} as const;

/**
 * Errors related to the fork count input field.
 */
const ForksCountInputErrors = {
    LessThanMinForksError: lessThanMinForksError,
    GreaterThanMaxForksError: greaterThanMaxForksError,
    UnknownError: unknownError
} as const;

/**
 * Errors related to repository input validation.
 */
const RepositoryInputErrors = {
    RepositorySyntaxError: repositorySyntaxError,
    OwnerError: ownerError,
    RepositoryNameError: repositoryNameError,
    UnknownError: unknownError
} as const;

/**
 * Errors related to the "Recently Updated" filter.
 */
const RecentlyUpdatedInputErrors = {
    OutOfRecentlyUpdatedRangeError: outOfRecentlyUpdatedRangeError,
    UnknownError: unknownError
} as const;

// Derive strict types from error objects
type CommitsDateRangeFromInputErrorsType =
    typeof CommitsDateRangeFromInputErrors[keyof typeof CommitsDateRangeFromInputErrors];

type CommitsDateRangeUntilInputErrorsType =
    typeof CommitsDateRangeUntilInputErrors[keyof typeof CommitsDateRangeUntilInputErrors];

type ForksCountInputErrorsType =
    typeof ForksCountInputErrors[keyof typeof ForksCountInputErrors];

type RepositoryInputErrorsType =
    typeof RepositoryInputErrors[keyof typeof RepositoryInputErrors];

type RecentlyUpdatedInputErrorsType =
    typeof RecentlyUpdatedInputErrors[keyof typeof RecentlyUpdatedInputErrors];

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
