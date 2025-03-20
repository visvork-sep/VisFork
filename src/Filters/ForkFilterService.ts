import { ForkFilter, ForkInfo, DateRange } from "@Types/LogicLayerTypes";
import { ACTIVE_FORK_NROF_MONTHS, OwnerType } from "@Utils/Constants";


export class ForkFilterService {
    /**
     * Filters an array of {@link ForkInfo} objects according to the passed {@link ForkFilter}.
     *
     * @param forks Collection of {@link ForkInfo}s to be filtered.
     * @param filter The {@link ForkFilter} based on which the function picks out the desired forks.
     * 
     * @returns an array of {@link ForkInfo}s that do not contain forks that do not pass the filter,
     * and all forks that do are in the returned array.
     */
    apply(forks: ForkInfo[], filter: ForkFilter): ForkInfo[] {
        const resultForks: ForkInfo[] = forks.filter(fork => {
            return this.#isValidForkByFilter(fork, filter);
        });

        return resultForks;
    }

    /**
     * Determines whether {@param fork} is valid or not.
     * 
     * @returns True if {@code fork} is valid according to the {@param filter}, false otherwise.
     * 
     * @throws TypeError, if {@param fork} is null or undefined.
     * @throws TypeError, if {@param filter} is null or undefined.
     */
    #isValidForkByFilter(fork: ForkInfo, filter: ForkFilter): boolean {
        if (fork == null) {
            throw TypeError("Fork is null or undefined");
        }

        if (filter == null) {
            throw TypeError("Filter is null or undefined");
        }

        let result: boolean = false;
        result = this.#isForkInDateRange(fork, filter.dateRange)
        result &&= this.#isForkActive(fork, filter.activeForksOnly)
        result &&= this.#isOwnerOfType(fork, filter.ownerTypes)
        result &&= this.#isForkUpdatedInLastMonths(fork, filter.updatedInLastMonths);

        return result;
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
    #isForkInDateRange(fork: ForkInfo, dateRange: DateRange): boolean {
        if (fork.created_at == null) {
            throw TypeError("Fork date property is undefined");
        }

        if (dateRange.start == null && dateRange.end == null) {
            throw TypeError("dateRange is improperly defined (no start and end property)");
        }

        if (!(dateRange.start instanceof Date) && !(dateRange.end instanceof Date)) {
            throw TypeError("dateRange is improperly defined (start and end is not of type Date)");
        }

        let result = false;
        if (dateRange.start instanceof Date) {
            result = new Date(fork.created_at.toString()).getTime() >= new Date(dateRange.start.toString()).getTime();
        }

        if (dateRange.end instanceof Date) {
            result = new Date(fork.created_at.toString()).getTime() <= new Date(dateRange.end.toString()).getTime();
        }

        // If both are defined, it is not enough to check them separately, but they need
        // to hold at the same time.
        if (dateRange.start instanceof Date && dateRange.end instanceof Date) {
            result = new Date(fork.created_at.toString()).getTime() >= new Date(dateRange.start.toString()).getTime()
                  && new Date(fork.created_at.toString()).getTime() <= new Date(dateRange.end.toString()).getTime();
        }
        
        return result;
    }

    /**
     * If {@param activeForksOnly} is not undefined, null or false, this function determines
     * whether {@param fork} is active or not.
     * 
     * @returns True if {@code activeForksOnly === null || activeForksOnly === undefined || !activeForksOnly
     *           || {@link this.#isForkUpdatedInLastMonths(fork, ACTIVE_FORK_NROF_MONTHS)}}, false otherwise.
     */
    #isForkActive(fork: ForkInfo, activeForksOnly?: boolean): boolean {
        let result = false;

        if (activeForksOnly == null || !activeForksOnly) {
            result = true; // since activity is not a criterion in this case
        } else {
            result = this.#isForkUpdatedInLastMonths(fork, ACTIVE_FORK_NROF_MONTHS);
        }

        return result;
    }

    /**
     * If {@param ownerTypes} is not undefined or null, this function determines whether
     * the owner of {@param fork} is of any of the types in {@param ownerTypes}.
     * 
     * @returns True if {@code ownerType === undefined || ownerType === null ||
     *                  ownerTypes.includes(fork.ownerType)}, false otherwise.
     */
    #isOwnerOfType(fork: ForkInfo, ownerTypes?: OwnerType[]): boolean {
        if (ownerTypes == null) {
            return true; // since the user is not filtering based on this
        }

        return ownerTypes.includes(fork.ownerType);
    }

    /**
     * If {@param nrOfMonths} is not undefined or null, this function determines whether
     * the {@param fork} was updated in the previous {@code nrOfMonths}.
     * 
     * If {@code fork.last_pushed} is undefined or null, the function will return false (since it was not updated
     * in the previous {@code nrOfMonths} months).
     * 
     * @returns True if {@code fork} was updated in the previous {@code nrOfMonths}, false otherwise.
     */
    #isForkUpdatedInLastMonths(fork: ForkInfo, nrOfMonths?: number): boolean {
        if (nrOfMonths == null) {
            return true; // since the user is not filtering based on this
        }

        let lastUpdatedMilliseconds = -1;

        if (fork.last_pushed != null) {
            lastUpdatedMilliseconds = new Date(fork.last_pushed.toString()).getTime();
        }

        const now = new Date(); // reference date object
        const thresholdDate = new Date(now);
        thresholdDate.setMonth(now.getMonth() - nrOfMonths);

        return lastUpdatedMilliseconds >= thresholdDate.getTime();
    }
}
