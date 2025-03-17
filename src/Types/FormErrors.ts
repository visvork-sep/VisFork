import { MAX_QUERIABLE_FORKS, MIN_QUERIABLE_FORKS, RECENT_ACTIVITY_MAX_MONTHS, RECENT_ACTIVITY_MIN_MONTHS }
    from "@Utils/Constants"; 

// Base error class for input validation errors
class InputError extends Error {
    constructor(message: string) {
        super(message); 
        this.name = this.constructor.name; 
    }
}

// Generic error class for unknown errors
class UnknownError extends InputError {
    constructor() {
        super("Unknown error"); // Setting a default error message
    }
}

class ForbiddenCharactersError extends InputError {
    constructor(forbidden: string[]) {
        super("Forbidden characters: " + forbidden.toLocaleString);
    }
}

// Error for invalid date range where 'from' date is later than 'until' date
class LaterFromDateError extends InputError {
    constructor() {
        super("The date range is not valid, make sure the from date is before the until date.");
    }
}

// Error for when the 'until' date is set in the future
class FutureUntilDateError extends InputError {
    constructor() {
        super("Future dates are not allowed for the until field");
    }
}

// Error for when the number of forks is less than the minimum allowed
class LessThanMinForksError extends InputError {
    constructor() {
        super(`Number of forks must be greater than ${MIN_QUERIABLE_FORKS}`);
    }
}

// Error for when the number of forks exceeds the maximum allowed
class GreaterThanMaxForksError extends InputError {
    constructor() {
        super(`Number of forks must be less than ${MAX_QUERIABLE_FORKS}`);
    }
}

// Error for incorrect repository syntax (should be in the format "Owner/RepositoryName")
class RepositorySyntaxError extends InputError {
    constructor() {
        super("Syntax must match <Owner>/<RepositoryName>");
    }
}

// Error for an invalid repository owner
class RepositoryOwnerError extends InputError {
    constructor() {
        super("Invalid repository owner");
    }
}

// Error for an invalid repository name
class RepositoryNameError extends InputError {
    constructor() {
        super("Invalid repository name");
    }
}


// Error for when the recent updates filter is out of the allowed range
class OutOfRecentlyUpdatedRangeError extends InputError {
    constructor() {
        super(`Can only filter on recent updates between 
            ${RECENT_ACTIVITY_MIN_MONTHS} ago and ${RECENT_ACTIVITY_MAX_MONTHS} ago`);
    }
}

class NonIntegralError extends InputError {
    constructor() {
        super("Value must be integral");
    }
}

/**
 * Errors related to the "From" date field in commit date range filters.
 */
const CommitsDateRangeFromInputErrors = {
    LaterFromDateError,
    UnknownError,
    ForbiddenCharactersError
} as const;

/**
 * Errors related to the "Until" date field in commit date range filters.
 */
const CommitsDateRangeUntilInputErrors = {
    LaterFromDateError,
    UnknownError,
    FutureUntilDateError,
    ForbiddenCharactersError
} as const;

/**
 * Errors related to the fork count input field.
 */
const ForksCountInputErrors = {
    LessThanMinForksError,
    GreaterThanMaxForksError,
    UnknownError,
    NonIntegralError,
    ForbiddenCharactersError
} as const;

/**
 * Errors related to repository input validation.
 */
const RepositoryInputErrors = {
    RepositorySyntaxError,
    RepositoryOwnerError,
    RepositoryNameError,
    UnknownError,
    ForbiddenCharactersError
} as const;

/**
 * Errors related to the "Recently Updated" filter.
 */
const RecentlyUpdatedInputErrors = {
    OutOfRecentlyUpdatedRangeError,
    UnknownError,
    NonIntegralError,
    ForbiddenCharactersError
} as const;




export {
    UnknownError,
    LaterFromDateError,
    FutureUntilDateError,
    LessThanMinForksError,
    GreaterThanMaxForksError,
    RepositorySyntaxError,
    RepositoryOwnerError,
    RepositoryNameError,
    OutOfRecentlyUpdatedRangeError,
    NonIntegralError,
    ForbiddenCharactersError,
    RepositoryInputErrors,
    ForksCountInputErrors,
    RecentlyUpdatedInputErrors,
    CommitsDateRangeFromInputErrors,
    CommitsDateRangeUntilInputErrors,
    InputError
};
