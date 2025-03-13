import { SortingCriterionExtra } from "../Types/ForkFilter";
import { ForkJSON } from "../Types/GithubTypes";

export class ForkSortService {
    /**
     * Sorts an array of forks based on the sorting criterion.
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
        return forks.sort((f1, f2) => {
            switch (by) {
                case "stargazers":
                    return this.#compareNumberOfStargazers(f1, f2);
                case "watchers":
                    return this.#compareNumberOfWatchers(f1, f2);
                case "oldest":
                    return this.#compareAge(f1, f2);
                case "newest":
                    return (-1) * this.#compareAge(f1, f2);
                case "latestCommit":
                    return this.#compareLatestCommits(f1, f2);
                case "authorPopularity":
                    return this.#compareAuthorPopularity(f1, f2);
                default:
                    throw Error("Unknown sorting criterion \"" + by + "\"");
            }
        });
    }

    /**
     * Compares the number of stargazers of {@param f1} to that of {@param f2}.
     * 
     * @returns 0 if the number of stargazers in f1 and f2 are equal
     *          -1 if the number of stargazers in f1 is less than that in f2
     *          1 if the number of stargazers in f1 is more than that in f2
     */
    #compareNumberOfStargazers(f1: ForkJSON, f2: ForkJSON): number {
        if (f1.stargazers_count === undefined || f2.stargazers_count === undefined) {
            throw Error("Unable to read stargazers_count property of forks");
        }

        return f1.stargazers_count === f2.stargazers_count ? 0 :
               f1.stargazers_count > f2.stargazers_count ? 1 : -1;
    }

    /**
     * Compares the number of watchers of {@param f1} to that of {@param f2}.
     * 
     * @returns 0 if the number of watchers in f1 and f2 are equal
     *          -1 if the number of watchers in f1 is less than that in f2
     *          1 if the number of watchers in f1 is more than that in f2
     */
    #compareNumberOfWatchers(f1: ForkJSON, f2: ForkJSON): number {
        if (f1.watchers_count === undefined || f2.watchers_count == undefined) {
            throw Error("Unable to read watchers_count property of forks");
        }

        return f1.watchers_count === f2.watchers_count ? 0 :
               f2.watchers_count > f2.watchers_count ? 1 : -1;
    }

    /**
     * Compares the creation date of {@param f1} to that of {@param f2}.
     * 
     * @returns 0 if f1 and f2 were created in the exact same millisecond
     *          -1 if f1 was created before f2
     *          1 if f1 was created after f2
     */
    #compareAge(f1: ForkJSON, f2: ForkJSON): number {
        if (f1.created_at === undefined || f2.created_at === undefined || f1.created_at === null || f2.created_at === null) {
            throw Error("Unable to read created_at property of forks");
        }

        const creationDateF1Milliseconds = Date.parse(f1.created_at);
        const creationDateF2Milliseconds = Date.parse(f2.created_at);

        return creationDateF1Milliseconds === creationDateF2Milliseconds ? 0 :
               creationDateF1Milliseconds > creationDateF2Milliseconds ? 1 : -1;
    }

    /**
     * Compares the date of the latest commit of {@param f1} to that of {@param f2}.
     * 
     * @returns 0 if the date (minute/day/hour???) TODO of the latest commit of f1 and f2 are equal
     *          -1 if the number of stargazers in f1 is less than that in f2
     *          1 if the number of stargazers in f1 is more than that in f2
     */
    #compareLatestCommits(f1: ForkJSON, f2: ForkJSON): number {
        if (f1.updated_at === undefined || f2.updated_at === undefined || f1.updated_at === null || f2.updated_at === null) {
            throw Error("Unable to read updated_at property of forks");
        }

        const lastCommitDateF1Milliseconds = Date.parse(f1.updated_at);
        const lastCommitDateF2Milliseconds = Date.parse(f2.updated_at);

        return lastCommitDateF1Milliseconds === lastCommitDateF2Milliseconds ? 0 :
               lastCommitDateF1Milliseconds > lastCommitDateF2Milliseconds ? 1 : -1;
    }

    /**
     * NOTE: NOT SUPPORTED YET.
     * Compares the number of followers of the owners of {@param f1} and {@param f2}.
     * 
     * @returns 0 if the number of followers of the owner of f1 and f2 are equal
     *          -1 if the number of followers of f1 is less than that of the owner of f2
     *          1 if the number of followers of f1 is more than that of the owner of f2
     */
    #compareAuthorPopularity(f1: ForkJSON, f2: ForkJSON): number {
        throw Error("Not supported.");
    }
}

