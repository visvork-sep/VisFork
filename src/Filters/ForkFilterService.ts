import { ForkFilter, DateRange, ForkType, OwnerType } from "../Types/ForkFilter";
import { Fork } from "../Components/Plots/ForkList";


export class ForkFilterService {
    /**
     * Filters an array of {@link Fork} objects according to the passed {@link ForkFilter}.
     *
     * @param forks Collection of {@link Fork}s to be filtered.
     * @param filter The {@link ForkFilter} based on which the function picks out the desired forks.
     * 
     * @returns an array of {@link Fork}s that do not contain forks that do not pass the filter,
     * and all forks that do are in the returned array.
     */
    filterAll(forks: Fork[], filter: ForkFilter): Fork[] {
        const resultForks: Fork[] = [];

        for (let fork of forks) {
            const filteredFork: Fork | null = this.filter(fork, filter);
            if (filteredFork !== null) {
                resultForks.push(filteredFork);
            }
        }

        /* TODO sortBy */

        return resultForks;
    }

    /**
     * Function to apply a filter to a single {@link Fork} object.
     *
     * @param fork the {@link Fork} object to be filtered.
     * @param filter the {@link ForkFilter} to be applied.
     *
     * @returns the {@param fork} if it is valid according to the filter, {@code null} otherwise.
     */
    filter(fork: Fork, filter: ForkFilter): Fork | null {
        return this.#isValidForkByFilter(fork, filter) ? fork : null;
    }

    /**
     * Determines whether {@param fork} is valid or not.
     * 
     * @returns True if {@code fork} is valid according to the {@param filter}, false otherwise.
     * 
     * @throws Error, if {@param fork} is null or undefined.
     */
    #isValidForkByFilter(fork: Fork, filter: ForkFilter): boolean {
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
     * Determines if the {@param fork} is in the date range given by {@param dateRange}.
     * 
     * @returns True if {@code fork.date >= dateRange.start && fork.date <= dateRange.end}.
     * 
     * @throws TypeError, if the date property of {@param fork} is undefined.
     * @throws TypeError, if both the start and end properties of {@param dateRange} are undefined.
     */
    #isForkInDateRange(fork: Fork, dateRange: DateRange): boolean {
        // if (fork.date === undefined) {
        //     throw TypeError("Fork date property is undefined");
        // }

        if (dateRange.start === undefined && dateRange.end === undefined) {
            throw TypeError("dateRange is improperly defined (no start and end property)");
        }

        let result: boolean = false;

        // TODO result = fork.date >= dateRange.start;

        // TODO result = fork.date <= dateRange.end;

        return result;
    }

    /**
     * If {@param activeForksOnly} is not undefined or false, this function determines
     * whether {@param fork} is active or not.
     * 
     * @returns True if {@code activeForksOnly === undefined || !activeForksOnly || fork.active === true}, false otherwise.
     */
    #isForkActive(fork: Fork, activeForksOnly: boolean | undefined): boolean {
        let result: boolean = false;

        if (activeForksOnly === undefined || !activeForksOnly) {
            result = true; // since activity is not a criterion in this case
        } else {
            // result = fork.active;
        }

        return result;
    }

    /**
     * If {@param forkType} is not undefined, this function determines whether
     * {@param fork} is of type {@param forkType}.  
     * 
     * @returns True if {@code forkType === undefined || fork.type === forkType}, false otherwise.
     */
    #isForkOfType(fork: Fork, forkType: ForkType | undefined): boolean {
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
    #isOwnerOfType(fork: Fork, ownerType: OwnerType | undefined): boolean {
        if (ownerType === undefined) {
            return true; // since the user is not filtering based on this
        }

        let result: boolean = false; // placeholder

        // let result: boolean = fork.ownerType === ownerType;

        return result;
    }

    /**
     * If {@param nrOfMonths} is not undefined, this function determines whether
     * the {@param fork} was updated in the previous {@code nrOfMonths}.
     * 
     * @returns True if {@code fork} was updated in the previous {@code nrOfMonths}, false otherwise.
     */
    #isForkUpdatedInLastMonths(fork: Fork, nrOfMonths: number | undefined): boolean {
        if (nrOfMonths === undefined) {
            return true; // since the user is not filtering based on this
        }

        let result: boolean = false; // placeholder

        // let result: boolean = fork.lastUpdated.getMilliseconds() > Date.now() - nrOfMonths.toMilliseconds();

        return result;
    }
}