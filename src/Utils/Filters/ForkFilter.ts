import { ForkFilter, ForkInfo, DateRange } from "@Types/LogicLayerTypes";
import { ACTIVE_FORK_NROF_MONTHS, OwnerType } from "@Utils/Constants";

/**
     * Determines whether {@param fork} is valid or not.
     * 
     * @returns True if {@code fork} is valid according to the {@param filter}, false otherwise.
     * 
     */
function isValidForkByFilter(fork: ForkInfo, filter: ForkFilter): boolean {
    if (fork.created_at && !isForkInDateRange(fork, filter.dateRange)) {
        return false;
    }

    if (!isForkWithOwnerOfType(fork, filter.ownerTypes)) {
        return false;
    }

    if (fork.last_pushed &&
        filter.updatedInLastMonths && 
        !isForkUpdatedInLastMonths(fork, filter.updatedInLastMonths)
    ) {
        return false;
    } else if (fork.last_pushed && 
        filter.activeForksOnly && 
        !isForkActive(fork)
    ) {
        return false;
    }

    return true;
}

/**
 * Determines if the {@param fork} was created in the date range given by {@param dateRange}.
 * 
 * @returns True if {@code fork.date >= dateRange.start && fork.date <= dateRange.end}.
 * 
 * @throws TypeError, if the date property of {@param fork} is null or undefined.
 * @throws TypeError, if both the start and end properties of {@param dateRange} are null or undefined.
 * @throws TypeError, if both the start and end properties of {@param dateRange} are not of type Date.
 */
function isForkInDateRange(fork: ForkInfo, dateRange: DateRange): boolean {
    if (!fork.created_at) {
        throw TypeError("Fork date is null or undefined");
    }    

    return fork.created_at >= dateRange.start && fork.created_at <= dateRange.end; 
}

/**
 * If {@param activeForksOnly} is not undefined, null or false, this function determines
 * whether {@param fork} is active or not.
 * 
 * @returns {@link isForkUpdatedInLastMonths(fork, ACTIVE_FORK_NROF_MONTHS)}
 */
function isForkActive(fork: ForkInfo): boolean {
    return isForkUpdatedInLastMonths(fork, ACTIVE_FORK_NROF_MONTHS);
}

/**
 * If {@param ownerTypes} is not undefined or null, this function determines whether
 * the owner of {@param fork} is of any of the types in {@param ownerTypes}.
 * 
 * @returns True if {@code onwerTypes.includes(fork.ownerType).
 */
function isForkWithOwnerOfType(fork: ForkInfo, ownerTypes: OwnerType[]): boolean {
    return ownerTypes.includes(fork.ownerType);
}

/**
 * If {@param nrOfMonths} is not undefined or null, this function determines whether
 * the {@param fork} was updated in the previous {@code nrOfMonths}.
 * 
 * If {@code fork.last_pushed} is undefined or null, the function will fail, 
 * Typecheck before using
 * 
 * @throws TypeError, if {@param fork.last_pushed} is null or undefined.
 * 
 * @returns True if {@code fork} was updated in the previous {@code nrOfMonths}, false otherwise.
 */
function isForkUpdatedInLastMonths(fork: ForkInfo, nrOfMonths: number): boolean {
    if (!fork.last_pushed) {
        throw TypeError("Fork last pushed date is null or undefined");
    }
    const thresholdDate = new Date();
    thresholdDate.setMonth(new Date().getMonth() - nrOfMonths);

    return fork.last_pushed >= thresholdDate;
}

export {
    isValidForkByFilter
};
