import { ForkFilter, RepositoryInfo } from "@Types/LogicLayerTypes";


// TODO: Change ForkInfo to whichever type/interface we have invented for forks.
export class ForkFilterService {

    /**
     * Filters an array of {@link RepositoryInfo} objects according to the passed {@link ForkFilter}.
     *
     * @param forks Collection of {@link RepositoryInfo}s to be filtered.
     * @param filter The {@link ForkFilter} based on which the function picks out the desired forks.
     */
    filterForks(forks: RepositoryInfo[], filter?: ForkFilter): RepositoryInfo[] {
        if (!filter) return forks;
        const resultForks: RepositoryInfo[] = [];

        for (let fork of forks) {
            fork = this.#applyFilter(fork, filter);
            // FIXME: needs criteria: only add fork if it passed the filter.
            resultForks.push(fork);
        }

        return resultForks;
    }

    /**
     * Private function to apply a filter to a single {@link RepositoryInfo} object.
     *
     * @param fork the {@link RepositoryInfo} object to be filtered.
     * @param filter the {@link ForkFilter} to be applied.
     *
     * @returns the filtered {@link RepositoryInfo}.
     */
    #applyFilter(fork: RepositoryInfo, filter: ForkFilter): RepositoryInfo {
        // Loops through all properties of ForkInfo that have a value.
        for (const [key, value] of Object.entries(filter)) {
            if (value !== undefined && value !== null) {
                console.log(key + ": " + value); // placeholder
            }
        }

        return fork;
    }
}
