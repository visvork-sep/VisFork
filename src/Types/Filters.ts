export type DateRange = {
    start?: string;
    end?: string
};

export type SortingCriterion = "stargazers" | "watchers" | "oldest" | "newest" | "latestCommit" | "authorPopularity";

export type ForkType = "adaptive" | "corrective" | "perfective";

export type OwnerType = "user" | "organization";


// Define the filter state structure
// See URD Section 3.1.3. "Filtering and Sorting Options"
export interface ForkFilters {
    dateRange: DateRange;
    sortBy: SortingCriterion; // Need to set default value to "stargazers" for URF-048
    activeForksOnly?: boolean;
    forkType?: ForkType;
    // sortByLastCommit?: boolean; -> moved to SortingCriterion "latestCommit"
    ownerType?: OwnerType;
    updatedInLastMonths?: number;
}

