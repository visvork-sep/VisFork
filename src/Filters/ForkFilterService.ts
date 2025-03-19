import { ForkFilter, ForkInfo } from "@Types/LogicLayerTypes";


// TODO: Change ForkInfo to whichever type/interface we have invented for forks.
export class ForkFilterService {

    /**
     * Filters an array of {@link ForkInfo} objects according to the passed {@link ForkFilter}.
     *
     * @param forks Collection of {@link ForkInfo}s to be filtered.
     * @param filter The {@link ForkFilter} based on which the function picks out the desired forks.
     */
    filterForks(forks: ForkInfo[], filter?: ForkFilter): ForkInfo[] {
        if (!filter) return forks;
        const resultForks: ForkInfo[] = [];

        for (let fork of forks) {
            fork = this.#applyFilter(fork, filter);
            // FIXME: needs criteria: only add fork if it passed the filter.
            resultForks.push(fork);
        }

        return resultForks;
    }

    /**
     * Private function to apply a filter to a single {@link ForkInfo} object.
     *
     * @param fork the {@link ForkInfo} object to be filtered.
     * @param filter the {@link ForkFilter} to be applied.
     *
     * @returns the filtered {@link ForkInfo}.
     */
    #applyFilter(fork: ForkInfo, filter: ForkFilter): ForkInfo {
        // Loops through all properties of ForkInfo that have a value.
        for (const [key, value] of Object.entries(filter)) {
            if (value !== undefined && value !== null) {
                console.log(key + ": " + value); // placeholder
            }
        }

        return fork;
    }
}
