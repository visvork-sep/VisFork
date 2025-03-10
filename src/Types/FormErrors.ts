import { MAX_QUERIABLE_FORKS, MIN_QUERIABLE_FORKS, RECENT_ACTIVITY_MAX_MONTHS, RECENT_ACTIVITY_MIN_MONTHS }
    from "@Utils/Constants";

const CommitsDateRangeFromInputErrors = {
    LaterFromDateError: { message: "The date range is not valid, make sure the from date is before the until date." },
    UnknownError: { message: "Unknown error" },
} as const;

const CommitsDateRangeUntilInputErrors = {
    LaterFromDateError: { message: "The date range is not valid, make sure the from date is before the until date." },
    UnknownError: { message: "Unknown error" },
    FutureUntilDateError: { message: "Future dates are not allowed for the until field" },
} as const;

const ForksCountInputErrors = {
    LessThanMinForksError: { message: `Number of forks must be greater than ${MIN_QUERIABLE_FORKS}` },
    GreaterThanMaxForksError: { message: `Number of forks must be less than ${MAX_QUERIABLE_FORKS}` },
    UnknownError: { message: "Unknown error" },
} as const;

const RepositoryInputErrors = {
    SyntaxError: { message: "Syntax must match <Owner>/<RepositoryName>" },
    OwnerError: { message: "Invalid repository owner" },
    RepositoryNameError: { message: "Invalid repository name" },
    UnknownError: { message: "Unknown error" },
} as const;

const RecentlyUpdatedInputErrors = {
    OutOfInputRangeError: {
        message: `Can only filter on recent updates between 
            ${RECENT_ACTIVITY_MIN_MONTHS} ago and ${RECENT_ACTIVITY_MAX_MONTHS} ago`
    },
    UnknownError: { message: "Unknown error" },
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
