import { Label } from "@primer/react";

/// For numforks input: Minimum amount of forks to query for
export const MIN_QUERIABLE_FORKS = 1;
/// For numforks input: Maximum amount of forks to query for
export const MAX_QUERIABLE_FORKS = 200;
/// Lower bound for recent activity filtering (most recent updates)
export const RECENT_ACTIVITY_MIN_MONTHS = 1;
/// Upper bound for recent activity filtering (least recent updates)
export const RECENT_ACTIVITY_MAX_MONTHS = 12;

/// Initial value for forks count input
export const FORKS_COUNT_INPUT_INITIAL = 5;

/// FORKS_SORTING_ORDERS ways to sort orders for the user to select
export const FORKS_SORTING_ORDERS = {
    STARGAZERS: { label: "Stargazers", value: "stargazers" },
    DATE: { label: "Date of creation", value: "date" },
    WATCHERS: { label: "Watchers", value: "watchers" },
    LAST_COMMIT: { label: "Last commit", value: "lastCommit" },
    AUTHOR_STARS: { label: "Author stars", value: "authorStars" }
};

/// Ascending and descending
export const SORT_DIRECTION = {
    ASCENDING: { label: "Ascending", value: "asc" },
    DESCENDING: { label: "Descending", value: "desc" }
};

/// Types of forks adaptive corrective perfective
export const FORK_TYPES = {
    PERFECTIVE: { label: "Perfective", value: "perfective" },
    ADAPTIVE: { label: "Adaptive", value: "Perfective" },
    CORRECTIVE: { label: "Corrective", value: "Corrective" }
};

/// Types of repository owners
export const OWNER_TYPES = {
    USER: { label: "User", value: "user" },
    ORGANIZATION: { label: "Organization", value: "org" }
};
