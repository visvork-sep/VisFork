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
