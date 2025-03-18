// Define the filter state structure
/** See URD Section 3.1.3. "Filtering and Sorting Options". */
export interface ForkFilter {
    dateRange: DateRange;
    sortBy: SortingCriterionExtra;
    activeForksOnly?: boolean;
    forkType?: ForkType;
    // sortByLastCommit?: boolean; -> moved to SortingCriterionExtra "latestCommit"
    ownerType?: OwnerType;
    updatedInLastMonths?: number;
}

export interface DateRange {
    start?: string;
    end?: string
};

/** Explanation: these criteria are provided by the GitHub API.
 * Any further sorting criteria are defined in {@link SortingCriterionExtra}.
 */
export type SortingCriterionGithub = "stargazers" | "watchers" | "oldest" | "newest";

export type SortingCriterionExtra = SortingCriterionGithub | "latestCommit" | "authorPopularity";

export type ForkType = "adaptive" | "corrective" | "perfective";

export type OwnerType = "user" | "organization";


