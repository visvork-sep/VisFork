import { SortingCriterionExtra } from "../Types/ForkSorter";
import { ForkJSON } from "../Types/DataLayerTypes";

export class ForkSortService {
    /**
     * Sorts an array of forks based on the sorting criterion in DESCENDING order.
     * 
     * @param forks the array of forks to be sorted.
     * @param by the sorting criterion to sort by.
     * 
     * @returns the sorted array of forks.
     * 
     * @throws Error if the sorting criterion is not one of "stargazers", "watchers", "oldest",
     *         "newest", "latestCommit", "authorPopularity".
     */
    sortForks(forks: ForkJSON[], by: SortingCriterionExtra): ForkJSON[] {
        // JavaScript's .sort() sorts in-place, so a shallow-copy is created
        // to return a new, sorted array instead of just modifying the old one
        // (better for testing)
        return [...forks].sort((f1, f2) => {
            let result = 0;
            switch (by) {
                case "stargazers":
                    result = this.#compareNumberOfStargazers(f1, f2);
                    break;
                case "watchers":
                    result = this.#compareNumberOfWatchers(f1, f2);
                    break;
                case "oldest":
                    result = (-1) * this.#compareAge(f1, f2);
                    break;
                case "newest":
                    result = this.#compareAge(f1, f2);
                    break;
                case "latestCommit":
                    result = this.#compareLatestCommits(f1, f2);
                    break;
                case "authorPopularity":
                    result = this.#compareAuthorPopularity(f1, f2);
                    break;
                default:
                    throw new Error(`Unknown sorting criterion "${by}"`);
            }
        
            // If comparison was equal (0), then sort them alphabetically
            return result !== 0 ? result : f1.name.localeCompare(f2.name);
        });    
    }

    /**
     * Compares the number of stargazers of {@param f1} to that of {@param f2}.
     * 
     * @post    \result == 0 if the number of stargazers in f1 and f2 are equal
     *          \result > 0 if the number of stargazers in f1 is less than that in f2
     *          \result < 0 if the number of stargazers in f1 is more than that in f2
     * 
     * @throws TypeError if the stargazers_count of either f1 or f2 is null or undefined.
     */
    #compareNumberOfStargazers(f1: ForkJSON, f2: ForkJSON): number {
        if (f1.stargazers_count == null || f2.stargazers_count == null) {
            throw TypeError("Unable to read stargazers_count property of forks");
        }

        return f2.stargazers_count - f1.stargazers_count;
    }

    /**
     * Compares the number of watchers of {@param f1} to that of {@param f2}.
     * 
     * @post    \result == 0 if the number of watchers in f1 and f2 are equal
     *          \result > 0 if the number of watchers in f1 is less than that in f2
     *          \result < 0 if the number of watchers in f1 is more than that in f2
     * 
     * @throws TypeError if the watchers_count property of either f1 or f2 is null or undefined.
     */
    #compareNumberOfWatchers(f1: ForkJSON, f2: ForkJSON): number {
        if (f1.watchers_count == null || f2.watchers_count == null) {
            throw TypeError("Unable to read watchers_count property of forks");
        }

        return f2.watchers_count - f1.watchers_count;
    }

    /**
     * Compares the creation date of {@param f1} to that of {@param f2}.
     * 
     * @post    \result == 0 if f1 and f2 were created in the exact same millisecond
     *          \result > 0 if f1 was created before f2
     *          \result < 0 if f1 was created after f2
     * 
     * @throws TypeError if the created_at property of either f1 or f2 is null or undefined.
     */
    #compareAge(f1: ForkJSON, f2: ForkJSON): number {
        if (f1.created_at == null || f2.created_at == null) {
            throw TypeError("Unable to read created_at property of forks");
        }

        const creationDateF1Milliseconds = Date.parse(f1.created_at);
        const creationDateF2Milliseconds = Date.parse(f2.created_at);

        return creationDateF2Milliseconds - creationDateF1Milliseconds;
    }

    /**
     * Compares the date of the latest commit of {@param f1} to that of {@param f2}.
     * 
     * @post    \result == 0 if the date of the latest commit of f1 and f2 are equal
     *          \result > 0 if the number of stargazers in f1 is less than that in f2
     *          \result < 0 if the number of stargazers in f1 is more than that in f2
     * 
     * @throws TypeError if the updated_at property of either f1 or f2 is null or undefined.
     */
    #compareLatestCommits(f1: ForkJSON, f2: ForkJSON): number {
        if (f1.updated_at == null || f2.updated_at == null) {
            throw TypeError("Unable to read updated_at property of forks");
        }

        const lastCommitDateF1Milliseconds = Date.parse(f1.updated_at);
        const lastCommitDateF2Milliseconds = Date.parse(f2.updated_at);

        return lastCommitDateF2Milliseconds - lastCommitDateF1Milliseconds;
    }

    /**
     * NOTE: NOT SUPPORTED YET.
     * Compares the number of followers of the owners of {@param f1} and {@param f2}.
     * 
     * @returns 0 if the number of followers of the owner of f1 and f2 are equal
     *          -1 if the number of followers of f1 is less than that of the owner of f2
     *          1 if the number of followers of f1 is more than that of the owner of f2
     * 
     * @throws Error always.
     */
    #compareAuthorPopularity(f1: ForkJSON, f2: ForkJSON): number {
        throw Error("Not supported.");
    }
}

