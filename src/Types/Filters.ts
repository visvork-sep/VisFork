// Define possible sorting options
export type SortingCriterion = "stargazers" | "watchers" | "oldest" | "newest";

// Define possible fork types
export type ForkType = "adaptive" | "corrective" | "perfective";

// Define the filter state structure
export interface ForkFilters {
    dateRange: { start?: string; end?: string };
    sortBy: SortingCriterion;
    activeForksOnly?: boolean;
    forkType?: ForkType;
    sortByLastCommit?: boolean;
    ownerType?: "user" | "organization";
    updatedInLastMonths?: number;
}

