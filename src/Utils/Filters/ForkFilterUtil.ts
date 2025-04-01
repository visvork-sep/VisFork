import { UnprocessedRepository } from "@Types/LogicLayerTypes";
import { ForkFilter } from "@Types/LogicLayerTypes";
import { OwnerType } from "@Utils/Constants";

/**
     * Determines whether {@param fork} is valid or not.
     * 
     * @returns True if {@code fork} is valid according to the {@param filter}, false otherwise.
     * 
     */
function isValidForkByFilter(fork: UnprocessedRepository, filter: ForkFilter): boolean {

    if (!isForkWithOwnerOfType(fork, filter.ownerTypes)) {
        return false;
    }

    if (fork.last_pushed &&
        filter.updatedInLastMonths &&
        !isForkUpdatedInLastMonths(fork, filter.updatedInLastMonths)
    ) {
        return false;
    }

    return true;
}

/**
 * If {@param ownerTypes} is not undefined or null, this function determines whether
 * the owner of {@param fork} is of any of the types in {@param ownerTypes}.
 * 
 * @returns True if {@code onwerTypes.includes(fork.ownerType).
 */
function isForkWithOwnerOfType(fork: UnprocessedRepository, ownerTypes: OwnerType[]): boolean {
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
function isForkUpdatedInLastMonths(fork: UnprocessedRepository, nrOfMonths: number): boolean {
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
