/// For numforks input: Minimum amount of forks to query for
export const MIN_QUERIABLE_FORKS = 1;
/// For numforks input: Maximum amount of forks to query for
export const MAX_QUERIABLE_FORKS = 200;
/// Lower bound for recent activity filtering (most recent updates)
export const RECENT_ACTIVITY_MIN_MONTHS = 1;
/// Upper bound for recent activity filtering (least recent updates)
export const RECENT_ACTIVITY_MAX_MONTHS = 12;
/// base URL of authentication server
export const AUTH_URL: string = import.meta.env.VITE_AUTH_URL;
/// base URL of Githhub API
export const API_URL: string = import.meta.env.VITE_API_URL;

/// Initial value for forks count input
export const FORKS_COUNT_INPUT_INITIAL = "5";

/// FORKS_SORTING_ORDERS ways to sort orders for the user to select
export const FORKS_SORTING_ORDERS = {
    STARGAZERS: { label: "Stargazers", value: "stargazers" },
    NEWEST: { label: "Newest", value: "newest" },
    WATCHERS: { label: "Watchers", value: "watchers" },
    OLDEST: { label: "Oldest", value: "oldest" },
} as const;

export type ForksSortingOrder = typeof FORKS_SORTING_ORDERS[keyof typeof FORKS_SORTING_ORDERS]["value"];


/// Ascending and descending
export const SORT_DIRECTION = {
    ASCENDING: { label: "Ascending", value: "asc" },
    DESCENDING: { label: "Descending", value: "desc" }
} as const;

export type SortDirection = typeof SORT_DIRECTION[keyof typeof SORT_DIRECTION]["value"];

/// Types of forks adaptive corrective perfective
export const FORK_TYPES = {
    PERFECTIVE: { label: "Perfective", value: "perfective" },
    ADAPTIVE: { label: "Adaptive", value: "adaptive" },
    CORRECTIVE: { label: "Corrective", value: "corrective" }
} as const;


export type ForkType = typeof FORK_TYPES[keyof typeof FORK_TYPES]["value"];

/// Types of repository owners
export const OWNER_TYPES = {
    USER: { label: "User", value: "User" },
    ORGANIZATION: { label: "Organization", value: "Organization" }
} as const;

export type OwnerType = typeof OWNER_TYPES[keyof typeof OWNER_TYPES]["value"];
