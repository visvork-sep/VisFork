import { 
    RepositoryInputErrors,
    ForksCountInputErrors,
    CommitsDateRangeFromInputErrors,
    CommitsDateRangeUntilInputErrors,
    RecentlyUpdatedInputErrors 
} from "../Types/UIFormErrors";
import {
    ForksSortingOrder, 
    CommitType, 
    MAX_QUERIABLE_FORKS, 
    MIN_QUERIABLE_FORKS, 
    OwnerType, 
    RECENT_ACTIVITY_MAX_MONTHS, 
    RECENT_ACTIVITY_MIN_MONTHS, 
    SortDirection
} from "./Constants";

/**
 * Trim the input and remove forbidden characters from the input.
 * 
 * @param {string} str input
 * @returns output - The sanitized string
 * @returns conflicts - The forbidden characters found in the input
 */
function sanitizeString(str: string): {output: string, conflicts: RegExpMatchArray | null} {
    const pattern = /[^a-z0-9 /_.-]/gi;

    const output = str.replace(pattern, "").trim();
    const conflicts = str.match(pattern);
    return {
        output,
        conflicts
    };
}

/**
 * Validator for date strings.
 * 
 * rules: must be in the format "yyyy-mm-dd"
 * 
 * note: this function does not check for valid dates, only for the format.
 * 
 * @param input date string
 * @returns true if the input is a valid date string 
 */
function isValidDate(input: string): boolean {
    const regex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

    return regex.test(input);
}

/**
 * Validator for integer strings.
 * 
 * rules: no leading zeroes, no decimal points, no commas, no whitespace.
 * 
 * @param input integer string
 * @returns true if the input is a valid integer string
 */
function isValidInteger(input: string): boolean {
    const regex = /^(0|[1-9][0-9]*)$/;

    return regex.test(input);
}

/**
 * Prepare the repository input for passing to logic layer.
 * 
 * @param {String} input repository input
 * @throws {ForbiddenCharactersError} if the input contains forbidden characters
 * @throws {RepositorySyntaxError} if the input does not match the required syntax (Owner/RepositoryName)
 * @returns owner and repository name
 */
function prepareRepository(input: string): { owner: string, repositoryName: string } {
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
}

/**
 * Prepare the forks count input for passing to logic layer.
 * 
 * @param {String} input forks count input
 * @throws {NonIntegralError} if the input is not an integer
 * @throws {ForbiddenCharactersError} if the input contains forbidden characters
 * @throws {LessThanMinForksError} if the input is less than the minimum allowed forks
 * @throws {GreaterThanMaxForksError} if the input is greater than the maximum allowed forks
 * @returns forks count
 */
function prepareForksCount(input?: string): number {
    if (!input) {
        throw new ForksCountInputErrors.NonIntegralError();
    }

    const { output, conflicts } = sanitizeString(input);
    if (conflicts) {
        throw new ForksCountInputErrors.ForbiddenCharactersError(conflicts);
    }

    if (!isValidInteger(output)) {
        throw new ForksCountInputErrors.NonIntegralError();
    }

    const num = Number(output);

    if (num < MIN_QUERIABLE_FORKS) {
        throw new ForksCountInputErrors.LessThanMinForksError();
    }

    if (num > MAX_QUERIABLE_FORKS) {
        throw new ForksCountInputErrors.GreaterThanMaxForksError();
    }

    return Number(output);
}

/**
 * Prepare the forks order input for passing to logic layer.
 * 
 * @param {String} input forks order input
 * @throws {ForbiddenCharactersError} if the input contains forbidden characters
 * @returns forks order
 */
function prepareForksOrder(input: ForksSortingOrder): ForksSortingOrder{
    const { conflicts } = sanitizeString(input);

    if (conflicts) {
        throw new ForksCountInputErrors.DeveloperFaultError("Invalid sort order selected");
    }

    return input;
}

/**
 * Prepare the forks sort direction input for passing to logic layer.
 * 
 * @param {String} input forks sort direction input
 * @throws {ForbiddenCharactersError} if the input contains forbidden characters
 * @returns forks sort direction
 */
function prepareForksSortDirection(input: SortDirection): SortDirection {
    const { conflicts } = sanitizeString(input);

    if (conflicts) {
        throw new ForksCountInputErrors.DeveloperFaultError("Invalid sort direction selected");
    }

    return input;
}

/**
 * Prepare the commits date range from input for passing to logic layer.
 * 
 * @param {String} input commits date range from input
 * @throws {ForbiddenCharactersError} if the input contains forbidden characters
 * @throws {UnknownError} if the input is not a valid date (TODO: create new error type)
 * @returns commits date range from
 */
function prepareCommitsDateRangeFrom(input: string): Date {
    const { output, conflicts } = sanitizeString(input);
    console.log(output, conflicts);
    
    if (conflicts) {
        throw new CommitsDateRangeFromInputErrors.ForbiddenCharactersError(conflicts);
    }

    if (!isValidDate(output)) {
        throw new CommitsDateRangeFromInputErrors.InvalidDateError();
    }

    return new Date(output);
}

/**
 * Prepare the commits date range until input for passing to logic layer.
 * 
 * @param {String} input commits date range until input
 * @throws {ForbiddenCharactersError} if the input contains forbidden characters
 * @throws {UnknownError} if the input is not a valid date (TODO: create new error type)
 * @returns commits date range until
 */
function prepareCommitsDateRangeUntil(input: string): Date {
    const { output, conflicts } = sanitizeString(input);
    console.log(output, conflicts);
    if (conflicts) {
        throw new CommitsDateRangeUntilInputErrors.ForbiddenCharactersError(conflicts);
    }

    if (!isValidDate(output)) {
        throw new CommitsDateRangeUntilInputErrors.InvalidDateError();
    }

    return new Date(output);
}

/**
 * Prepare the commits type filter input for passing to logic layer.
 * 
 * @param {String[]} commitTypes - list of commit types
 * @returns commits type filter
 */
function prepareCommitsTypeFilter(commitTypes: CommitType[]): CommitType[] {
    commitTypes.forEach(element => {
        const { conflicts } = sanitizeString(element);
        if (conflicts) {
            //TODO
        }
    });

    return commitTypes;
}

/**
 * Prepare the owner type filter input for passing to logic layer.
 * 
 * @param {String[]} ownerTypes - list of owner types
 * @returns owner type filter
 */
function prepareOwnerTypeFilter(ownerTypes: OwnerType[]): OwnerType[] {
    ownerTypes.forEach(element => {
        const { conflicts } = sanitizeString(element);
        if (conflicts) {
            throw new ForksCountInputErrors.DeveloperFaultError("Invalid owner type selected");
        }
    });

    return ownerTypes;
}

/**
 * Prepare the recently updated input for passing to logic layer.
 * 
 * @param {String} input recently updated input
 * @throws {NonIntegralError} if the input is not an integer
 * @throws {ForbiddenCharactersError} if the input contains forbidden characters
 * @throws {OutOfRecentlyUpdatedRangeError} if the input is out of the allowed range
 * @returns recently updated
 */
function prepareRecentlyUpdated(input?: string): number | null {
    if (!input) {
        return null;
    }

    const { output, conflicts } = sanitizeString(input);
    if (conflicts) {
        throw new RecentlyUpdatedInputErrors.ForbiddenCharactersError(conflicts);
    }

    if (!isValidInteger(output)) {
        throw new RecentlyUpdatedInputErrors.NonIntegralError();
    }
    
    const num = Number(output);

    if (num < RECENT_ACTIVITY_MIN_MONTHS || num > RECENT_ACTIVITY_MAX_MONTHS) {
        throw new RecentlyUpdatedInputErrors.OutOfRecentlyUpdatedRangeError();
    }

    return num;
}

export {
    prepareRepository,
    prepareForksCount,
    prepareForksOrder,
    prepareForksSortDirection,
    prepareCommitsDateRangeFrom,
    prepareCommitsDateRangeUntil,
    prepareCommitsTypeFilter,
    prepareOwnerTypeFilter,
    prepareRecentlyUpdated
};
