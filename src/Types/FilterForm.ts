/**
 * Represents the state of the filter form used to configure 
 * the visualization of GitHub repository data.
 */
interface FilterFormState {
    /**
     * The full repository name in the format "Owner/RepositoryName".
     */
    repository: string;

    /**
     * The minimum number of forks required for filtering.
     * Stored as a string to accommodate user input before validation.
     */
    forksCount: string;

    /**
     * The selected sorting criteria for forks (e.g., by stargazers, creation date, etc.).
     */
    forksOrder: string;

    /**
     * The sorting direction for forks (ascending or descending).
     */
    forksAscDesc: string;

    /**
     * The starting date for filtering commits.
     * Expected format: YYYY-MM-DD.
     */
    commitsDateRangeFrom: string;

    /**
     * The ending date for filtering commits.
     * Expected format: YYYY-MM-DD.
     */
    commitsDateRangeUntil: string;

    /**
     * The selected fork types to be included in the visualization.
     * This is an array of strings representing available fork categories.
     */
    forksTypeFilter: string[];

    /**
     * The selected owner types to filter repositories by.
     * This is an array of strings representing different repository ownership categories.
     */
    ownerTypeFilter: string[];

    /**
     * Specifies the recency of updates to filter repositories by.
     * Typically represents a number of months, stored as a string.
     */
    recentlyUpdated: string;
}

export type { FilterFormState };
