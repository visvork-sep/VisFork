import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchForks, fetchCommits, fetchAvatarUrlGql, fetchRepo } from "@Queries/rawQueries";
import { CommitQueryParams, ForkQueryParams, CommitJSON, RepoQueryParams, ForkJSON } from "@Types/GithubTypes";
import { ForkInfo, ForkQueryState, CommitInfo } from "@Types/DataLayerTypes";
import { GetAvatarUrlQueryVariables}
    from "@generated/graphql";
import { useAuth } from "@Providers/AuthProvider";
import { DateRange } from "@Types/ForkFilter";
import { toCommitInfo, toForkInfo } from "@Utils/MappingJSON";

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
 * Fetches fork data using a the underlying Json function as well as the original repo data.
 * Converts the ForkQueryState to the necessary query parameters.
 *
 * @param parameters - ForkQuery state, high level representation of the settings for querrying.
 * If required params are empty query will be disabled.
 * @returns The result object is of type ForkInfo.
 */
export function useFetchForks(parameters?: ForkQueryState) {

    // Parameters to query the forks
    const forkQueryParams: ForkQueryParams | undefined = parameters
        ? {
            path: { owner: parameters.owner, repo: parameters.repo },
            query: parameters.sort ? { sort: parameters.sort } : undefined
        }
        : undefined;

    // Query parameters for the original repository
    const repoQueryParams : RepoQueryParams | undefined = parameters
        ? {
            path: { owner: parameters.owner, repo: parameters.repo},
        }
        : undefined;

    // Fetch the full forks data
    // Here we query for the original repository as well since we want its data
    const { data, isLoading, error } = useFetchForksJSON(forkQueryParams);
    const { data: originalRepoData, isLoading: repoLoading, error: repoError } = useFetchRepoJSON(repoQueryParams);

    // Merge the data
    const mergedData = [
        //The original repo data only gets inluded if it is valid
        ...(originalRepoData?.data ? [originalRepoData.data as ForkJSON] : []),
        ...(data?.data ?? [])] as ForkJSON[];

    // Combine the loading states and errors
    const isLoadingMerged = isLoading || repoLoading;
    const errorMerged = error || repoError;

    // Transform it to only return relevant fields
    const simplifiedData: ForkInfo[] = useMemo(() => {
        return mergedData.map(fork => toForkInfo(fork)) ?? [];
    }, [mergedData]);

    return { data: simplifiedData, isLoading: isLoadingMerged, error: errorMerged };
}

/**
 * Fetches commit data using a the underlying Json function.
 * Takes the forks to query commits for and returns an array of commits.
 *
 * @param parameters - An array of forks and a data range for which to query.
 * @returns The result object is of type CommitInfo.
 */

export function useFetchCommitsBatch(forks: ForkInfo[], range?: DateRange) {
    const commitQueries = forks.map((fork) => {
        return {
            path: {owner: fork.owner.login, repo: fork.name},
            query: {since: range?.start, until: range?.end}
        };
    });

    const { data, isLoading, error } = useFetchCommitsBatchJSON(commitQueries);

    const simplifiedData: CommitInfo[] = useMemo(() => {
        return data.map(commit => toCommitInfo(commit)) ?? [];
    }, [data]);


    return {data: simplifiedData, isLoading, error };
}

/**
 * Fetches repo data using a RestAPI query.
 * Uses `react-query` to manage caching, loading states, and refetching.
 *
 * @param parameters - Query variables required for fetching repository.
 * If required params are empty query will be disabled.
 * @returns The result object from `useQuery`, containing data, loading, and error states.
 */
function useFetchRepoJSON(parameters?: RepoQueryParams) {
    const { isAuthenticated, getAccessToken } = useAuth();
    const accessToken = getAccessToken() ?? "";

    return useQuery({
        queryKey: ["forks", parameters],
        // This is okay because enabled already checks if the parameters exist
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        queryFn: () => fetchRepo(parameters!, accessToken),
        // Done so query is not triggered on first render.
        enabled: isAuthenticated && !!parameters

    });
}

/**
 * Fetches fork data using a RestAPI query.
 * Uses `react-query` to manage caching, loading states, and refetching.
 *
 * @param parameters - Query variables required for fetching forks.
 * If required params are empty query will be disabled.
 * @returns The result object from `useQuery`, containing data, loading, and error states.
 */
function useFetchForksJSON(parameters?: ForkQueryParams) {
    const { isAuthenticated, getAccessToken } = useAuth();
    const accessToken = getAccessToken() ?? "";

    return useQuery({
        queryKey: ["forks", parameters],
        // This is okay because enabled already checks if the parameters exist
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        queryFn: () => fetchForks(parameters!, accessToken),
        // Done so query is not triggered on first render.
        enabled: isAuthenticated && !!parameters

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
function useFetchCommitsBatchJSON(parametersList: CommitQueryParams[]) {
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
    // Add back in the repo and owner information to the json data.
    const allData : CommitJSON[] = queries.flatMap((q, index) =>
        q.data?.data?.map(commit => ({
            ...commit,  // Keep all original commit fields
            repo: parametersList[index].path.repo,   // Add repo name
            owner: parametersList[index].path.owner // Add owner
        })) ?? []
    );

    const isLoading = queries.some(q => q.isLoading); // If any request is loading, return true
    const error = queries.find(q => q.error)?.error || null; // Return first error found

    return { data: allData, isLoading, error };
}
