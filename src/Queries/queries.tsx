import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchForks, fetchCommits } from "./rawQueries";
import { CommitQueryParams, ForkQueryParams } from "../Filters/Types/githubTypes"

/**
 * Fetches fork data using a GraphQL query.
 * Uses `react-query` to manage caching, loading states, and refetching.
 * 
 * @param parameters - Query variables required for fetching forks.
 * @returns The result object from `useQuery`, containing data, loading, and error states.
 */
export function useFetchForks(parameters: ForkQueryParams) {
    return useQuery({
        queryKey: ["forks", parameters],
        queryFn: () => fetchForks(parameters),
        enabled: !!parameters //dependent on variables
    });
}

/**
 * Fetches commit data using a REST API call.
 * This function uses `react-query` to manage caching and state.
 * 
 * @param parameters - The commit query parameters based on the OpenAPI spec.
 * @returns The result object from `useQuery`, containing data, loading, and error states.
 */
export function useFetchCommits(parameters: CommitQueryParams) {
    return useQuery({
        queryKey: ["commits", parameters],
        queryFn: () => fetchCommits(parameters),
        enabled: !!parameters //dependent on variables
    });
}

/**
 * Fetches multiple commits in parallel using `useQueries`.
 * Each commit query runs separately, allowing independent loading and error handling.
 * This is useful when fetching commits for multiple repositories at once.
 *
 * @param parametersList - An array of commit query parameters.
 * @returns An array of result objects, where each entry corresponds to a commit query.
 */
export function useFetchCommitsBatch(parametersList: CommitQueryParams[]) {
    return useQueries({
        queries: parametersList 
            ? parametersList.map((parameters) => {
                return {
                    queryKey: ["commits", parameters],
                    queryFn: async () => fetchCommits(parameters),
                };
            }) : [],
    });
}
