import { ForkFilter, UnprocessedRepository } from "@Types/LogicLayerTypes";


// TODO: Change ForkInfo to whichever type/interface we have invented for forks.
export class ForkFilterService {

    /**
     * Filters an array of {@link UnprocessedRepository} objects according to the passed {@link ForkFilter}.
     *
     * @param forks Collection of {@link UnprocessedRepository}s to be filtered.
     * @param filter The {@link ForkFilter} based on which the function picks out the desired forks.
     */
    filterForks(forks: UnprocessedRepository[], filter?: ForkFilter): UnprocessedRepository[] {
        if (!filter) return forks;
        const resultForks: UnprocessedRepository[] = [];

        for (let fork of forks) {
            fork = this.#applyFilter(fork, filter);
            // FIXME: needs criteria: only add fork if it passed the filter.
            resultForks.push(fork);
        }

        return resultForks;
    }

    /**
     * Private function to apply a filter to a single {@link UnprocessedRepository} object.
     *
     * @param fork the {@link UnprocessedRepository} object to be filtered.
     * @param filter the {@link ForkFilter} to be applied.
     *
     * @returns the filtered {@link UnprocessedRepository}.
     */
    #applyFilter(fork: UnprocessedRepository, filter: ForkFilter): UnprocessedRepository {
        // Loops through all properties of ForkInfo that have a value.
        for (const [key, value] of Object.entries(filter)) {
            if (value !== undefined && value !== null) {
            }
        }

        return fork;
    }
}
