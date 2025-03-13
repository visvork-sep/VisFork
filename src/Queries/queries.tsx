import { useQueries, useQuery} from "@tanstack/react-query";
import { fetchForks, fetchCommits, fetchAvatarUrlGql } from "./rawQueries";
import { CommitQueryParams, ForkQueryParams } from "../Types/GithubTypes";
import { GetAvatarUrlQueryVariables}
    from "@generated/graphql";
import { useAuth } from "@Providers/AuthProvider";

/**
 *  Gets to avatar url
 * @returns response of request to get avatar
 */
export function useFetchAvatarUrl(parameters: GetAvatarUrlQueryVariables) {
    const { isAuthenticated, getAccessToken } = useAuth();
    const accessToken = getAccessToken() ?? "";

    return useQuery({
        queryKey: ["avatarUrl"],
        queryFn: () => fetchAvatarUrlGql(parameters, accessToken),
        gcTime: 0, // dont store
        enabled: isAuthenticated
    });
}

/**
 * Fetches fork data using a GraphQL query.
 * Uses `react-query` to manage caching, loading states, and refetching.
 *
 * @param parameters - Query variables required for fetching forks.
 * If required params are empty query will be disabled.
 * @returns The result object from `useQuery`, containing data, loading, and error states.
 */
export function useFetchForks(parameters: ForkQueryParams) {
    const { isAuthenticated, getAccessToken } = useAuth();
    const accessToken = getAccessToken() ?? "";

    return useQuery({
        queryKey: ["forks", parameters],
        queryFn: () => fetchForks(parameters, accessToken),
        // Done so query is not triggered on first render.
        enabled: isAuthenticated
            && !!parameters.path.owner
            && !!parameters.path.repo
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

    const { isAuthenticated, getAccessToken } = useAuth();
    const accessToken = getAccessToken() ?? "";

    return useQuery({
        queryKey: ["commits", parameters],
        queryFn: () => fetchCommits(parameters, accessToken),
        enabled: isAuthenticated //dependent on variables
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
    const { isAuthenticated, getAccessToken } = useAuth();
    const accessToken = getAccessToken() ?? "";

    const queries =  useQueries({
        queries: parametersList
            ? parametersList.map((parameters) => {
                return {
                    queryKey: ["commits", parameters],
                    queryFn: async () => fetchCommits(parameters, accessToken),
                    enabled: isAuthenticated,
                };
            }) : [],
    });

    // Aggregate data
    const allData = queries.flatMap(q => q.data?.data ?? []);  // Flatten all data arrays
    const isLoading = queries.some(q => q.isLoading); // If any request is loading, return true
    const error = queries.find(q => q.error)?.error || null; // Return first error found

    return { data: allData, isLoading, error };
}
