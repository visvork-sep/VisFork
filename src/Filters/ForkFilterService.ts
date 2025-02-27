import { ForkFilter } from "../Types/ForkFilter";
import { ForkJSON } from "../Types/GithubTypes";


// TODO: Change ForkJSON to whichever type/interface we have invented for forks. 
export class ForkFilterService {

    constructor() {

    }

    /**
     * Filters an array of {@link ForkJSON} objects according to the passed {@link ForkFilter}.
     * 
     * @param forks Collection of {@link ForkJSON}s to be filtered.
     * @param filter The {@link ForkFilter} based on which the function picks out the desired forks.
     */
    filterForks(forks: ForkJSON[], filter: ForkFilter): ForkJSON[] {
        let resultForks: ForkJSON[] = [];

        for (let fork of forks) {
            fork = this.#applyFilter(fork, filter);
            // FIXME: needs criteria: only add fork if it passed the filter. 
            resultForks.push(fork);
        }

        return resultForks;
    }

    /**
     * Private function to apply a filter to a single {@link ForkJSON} object.
     * 
     * @param fork the {@link ForkJSON} object to be filtered.
     * @param filter the {@link ForkFilter} to be applied.
     * 
     * @returns the filtered {@link ForkJSON}.
     */
    #applyFilter(fork: ForkJSON, filter: ForkFilter): ForkJSON {
        // Loops through all properties of ForkJSON that have a value.
        for (const [key, value] of Object.entries(filter)) {
            if (value !== undefined && value !== null) {
                console.log(key + ": " + value); // placeholder
            }
        }

        return fork;
    }
}