export interface ForkSorter {
    sortBy: SortingCriterionExtra;
}

/** Explanation: these criteria are provided by the GitHub API.
 * Any further sorting criteria are defined in {@link SortingCriterionExtra}.
 */
export type SortingCriterionGithub = "stargazers" | "watchers" | "oldest" | "newest";

export type SortingCriterionExtra = SortingCriterionGithub | "latestCommit" | "authorPopularity";
