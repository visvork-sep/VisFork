import { ForksSortingOrder, ForkType, OwnerType, SortDirection } from "@Utils/Constants";

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
    * Must be one of the defined sorting criteria in FORKS_SORTING_ORDERS.
     */
    forksOrder: ForksSortingOrder;

    /**
     * The sorting direction for forks (ascending or descending).
     * Must be one of the defined sorting directions in SORT_DIRECTION.
     */
    forksAscDesc: SortDirection;

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
     * Must be one of the defined fork types in FORK_TYPES.
     */
    forksTypeFilter: ForkType[];

    /**
     * The selected owner types to filter repositories by.
     * This is an array of strings representing different repository ownership categories.
     * Must be one of the defined owner types in OWNER_TYPES.
     */
    ownerTypeFilter: OwnerType[];

    /**
     * Specifies the recency of updates to filter repositories by.
     * Typically represents a number of months, stored as a string.
     */
    recentlyUpdated: string;
}

/**
 * Represents the prepared form state for submission.
 */
interface preparedFormComplete {
    owner: OwnerType;
    repositoryName: string;
    forksCount: number;
    forksOrder: ForksSortingOrder;
    forksSortDirection: SortDirection;
    commitsDateRangeFrom: Date;
    commitsDateRangeUntil: Date;
    forksTypeFilter: ForkType[];
    ownerTypeFilter: OwnerType[];
    recentlyUpdated: number | null; // non required
}

/**
 * Represents the prepared form state for submission.
 * 
 * Null values indicate that the field is not ready for submission.
 */
interface preparedForm {
    owner: string | null;
    repositoryName: string | null;
    forksCount: number | null;
    forksOrder: ForksSortingOrder | null;
    forksSortDirection: SortDirection | null;
    commitsDateRangeFrom: Date | null;
    commitsDateRangeUntil: Date | null;
    forksTypeFilter: ForkType[] | null;
    ownerTypeFilter: OwnerType[] | null;
    recentlyUpdated: number | null;
}



export type { FilterFormState, preparedFormComplete, preparedForm };
