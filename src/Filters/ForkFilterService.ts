import { ACTIVE_FORK_NROF_MONTHS } from "@Utils/Constants";
import { ForkFilter, DateRange, ForkType, OwnerType } from "../Types/ForkFilter";
import { ForkJSON } from "../Types/GithubTypes";


export class ForkFilterService {
    /**
     * Filters an array of {@link ForkJSON} objects according to the passed {@link ForkFilter}.
     *
     * @param forks Collection of {@link ForkJSON}s to be filtered.
     * @param filter The {@link ForkFilter} based on which the function picks out the desired forks.
     * 
     * @returns an array of {@link ForkJSON}s that do not contain forks that do not pass the filter,
     * and all forks that do are in the returned array.
     */
    applyAll(forks: ForkJSON[], filter: ForkFilter): ForkJSON[] {
         const resultForks: ForkJSON[] = forks.filter(fork => {
            this.#isValidForkByFilter(fork, filter);
         });

        /* TODO sortBy */

        return resultForks;
    }

    /**
     * Function to apply a filter to a single {@link ForkJSON} object.
     *
     * @param fork the {@link ForkJSON} object to be filtered.
     * @param filter the {@link ForkFilter} to be applied.
     *
     * @returns the {@param fork} if it is valid according to the filter, {@code null} otherwise.
     */
    apply(fork: ForkJSON, filter: ForkFilter): ForkJSON | null {
        return this.#isValidForkByFilter(fork, filter) ? fork : null;
    }

    /**
     * Determines whether {@param fork} is valid or not.
     * 
     * @returns True if {@code fork} is valid according to the {@param filter}, false otherwise.
     * 
     * @throws Error, if {@param fork} is null or undefined.
     */
    #isValidForkByFilter(fork: ForkJSON, filter: ForkFilter): boolean {
        if (fork === null || fork === undefined) {
            throw Error("Fork is null or undefined");
        }

        return this.#isForkInDateRange(fork, filter.dateRange)
            && this.#isForkActive(fork, filter.activeForksOnly)
            && this.#isForkOfType(fork, filter.forkType)
            && this.#isOwnerOfType(fork, filter.ownerType)
            && this.#isForkUpdatedInLastMonths(fork, filter.updatedInLastMonths);
    }

    /**
     * Determines if the {@param fork} was created in the date range given by {@param dateRange}.
     * 
     * @returns True if {@code fork.date >= dateRange.start && fork.date <= dateRange.end}.
     * 
     * @throws TypeError, if the date property of {@param fork} is undefined.
     * @throws TypeError, if both the start and end properties of {@param dateRange} are undefined.
     */
    #isForkInDateRange(fork: ForkJSON, dateRange: DateRange): boolean {
        if (fork.created_at === undefined || fork.created_at === null) {
            throw TypeError("Fork date property is undefined");
        }

        if (dateRange.start === undefined && dateRange.end === undefined) {
            throw TypeError("dateRange is improperly defined (no start and end property)");
        }

        let result: boolean = false;
        if (dateRange.start !== undefined) {
            result = fork.created_at >= dateRange.start;
        }

        if (dateRange.end !== undefined) {
            result = fork.created_at <= dateRange.end;
        }
        
        return result;
    }

    /**
     * If {@param activeForksOnly} is not undefined or false, this function determines
     * whether {@param fork} is active or not.
     * 
     * @returns True if {@code activeForksOnly === undefined || !activeForksOnly || fork.archived || fork.disabled},
     * false otherwise.
     */
    #isForkActive(fork: ForkJSON, activeForksOnly?: boolean): boolean {
        let result: boolean = false;

        if (activeForksOnly === undefined || !activeForksOnly) {
            result = true; // since activity is not a criterion in this case
        } else {
            result = this.#isForkUpdatedInLastMonths(fork, ACTIVE_FORK_NROF_MONTHS);
        }

        return result;
    }

    /**
     * If {@param forkType} is not undefined, this function determines whether
     * {@param fork} is of type {@param forkType}.  
     * 
     * @returns True if {@code forkType === undefined || fork.type === forkType}, false otherwise.
     */
    #isForkOfType(fork: ForkJSON, forkType?: ForkType): boolean {
        if (forkType === undefined) {
            return true; // since the user is not filtering based on this
        }

        let result: boolean = false; // placeholder

        // let result: boolean = forkType === fork.type;

        return result;
    }

    /**
     * If {@param ownerType} is not undefined, this function determines whether
     * the owner of {@param fork} is of type {@param ownerType}.
     * 
     * @returns True if {@code ownerType === undefined || fork.ownerType === ownerType}, false otherwise.
     */
    #isOwnerOfType(fork: ForkJSON, ownerType?: OwnerType): boolean {
        if (ownerType === undefined) {
            return true; // since the user is not filtering based on this
        }

        return fork.owner.type.toLowerCase() === ownerType;
    }

    /**
     * If {@param nrOfMonths} is not undefined, this function determines whether
     * the {@param fork} was updated in the previous {@code nrOfMonths}.
     * 
     * If {@code fork.updated_at} is undefined or null, the function will return false (since it was not updated
     * in the previous {@code nrOfMonths} months).
     * 
     * @returns True if {@code fork} was updated in the previous {@code nrOfMonths}, false otherwise.
     */
    #isForkUpdatedInLastMonths(fork: ForkJSON, nrOfMonths?: number): boolean {
        if (nrOfMonths === undefined) {
            return true; // since the user is not filtering based on this
        }

        let lastUpdatedMilliseconds: number = -1;

        if (fork.updated_at !== undefined && fork.updated_at !== null) {
            lastUpdatedMilliseconds = Date.parse(fork.updated_at);
        }

        const thresholdMilliseconds = Date.now() - this.#getDateMonthsBeforeMilliseconds(nrOfMonths);

        return lastUpdatedMilliseconds >= thresholdMilliseconds;
    }

    #getDateMonthsBeforeMilliseconds(nrOfMonths: number): number {
        const now = new Date();
        now.setMonth(now.getMonth() - nrOfMonths);
        return now.getMilliseconds();
    }
}
