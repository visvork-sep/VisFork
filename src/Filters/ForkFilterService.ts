import { ACTIVE_FORK_NROF_MONTHS } from "@Utils/Constants";
import { ForkFilter, DateRange, ForkType, OwnerType } from "../Types/ForkFilter";
import { ForkInfo } from "@Types/DataLayerTypes";


// TODO: Change ForkInfo to whichever type/interface we have invented for forks.
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
            this.#isValidForkByFilter(fork, filter);
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

        let result: boolean = false;
        if (dateRange.start instanceof Date) {
            result = Date.parse(fork.created_at) >= Date.parse(dateRange.start.toISOString());
        }

        if (dateRange.end instanceof Date) {
            result = Date.parse(fork.created_at) <= Date.parse(dateRange.end.toISOString());
        }

        // If both are defined, it is not enough to check them separately, but they need
        // to hold at the same time.
        if (dateRange.start instanceof Date && dateRange.end instanceof Date) {
            result = Date.parse(fork.created_at) >= Date.parse(dateRange.start.toString())
                  && Date.parse(fork.created_at) <= Date.parse(dateRange.end.toString());
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
        let result: boolean = false;

        if (activeForksOnly == null || !activeForksOnly) {
            result = true; // since activity is not a criterion in this case
        } else {
            result = this.#isForkUpdatedInLastMonths(fork, ACTIVE_FORK_NROF_MONTHS);
        }

        return result;
    }

    /**
     * If {@param forkType} is not undefined or null, this function determines whether
     * {@param fork} is of type {@param forkType}.  
     * 
     * @returns True if {@code forkType === undefined || forkType === null || fork.type === forkType}, false otherwise.
     */
    #isForkOfType(fork: ForkInfo, forkType?: ForkType): boolean {
        if (forkType == null) {
            return true; // since the user is not filtering based on this
        }

        let result: boolean = false; // placeholder

        // let result: boolean = forkType === fork.type;

        return result;
    }

    /**
     * If {@param ownerType} is not undefined or null, this function determines whether
     * the owner of {@param fork} is of type {@param ownerType}.
     * 
     * @returns True if {@code ownerType === undefined || ownerType === null || fork.owner.login.toLowerCase() === ownerType}, false otherwise.
     */
    #isOwnerOfType(fork: ForkInfo, ownerType?: OwnerType): boolean {
        if (ownerType == null) {
            return true; // since the user is not filtering based on this
        }

        return fork.owner.login.toLowerCase() === ownerType;
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

        let lastUpdatedMilliseconds: number = -1;

        if (fork.last_pushed != null) {
            lastUpdatedMilliseconds = Date.parse(fork.last_pushed);
        }

        const now = new Date(); // reference date object
        const thresholdDate = new Date(now);
        thresholdDate.setMonth(now.getMonth() - nrOfMonths);

        return lastUpdatedMilliseconds >= thresholdDate.getTime();
    }
}
