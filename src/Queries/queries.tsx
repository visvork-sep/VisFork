import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchForks, fetchCommits, fetchAvatarUrlGql, fetchCommitCount } from "@Queries/rawQueries";
import { CommitQueryParams, ForkQueryParams } from "@Types/DataLayerTypes";
import { UnprocessedRepository, ForkQueryState } from "@Types/LogicLayerTypes";
import { GetAvatarUrlQueryVariables}
    from "@generated/graphql";
import { useAuth } from "@Providers/AuthProvider";
import { createCommitQueryParams, createForkQueryParams } from "@Utils/queryHelpers";
import { useEffect, useMemo } from "react";

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
 * @param forkQueryState - ForkQuery state, high level representation of the settings for querrying.
 * If required params are empty query will be disabled.
 * @returns The result object is of type ForkInfo.
 */
export function useFetchForks(forkQueryState?: ForkQueryState) {
    const { isAuthenticated, getAccessToken } = useAuth();
    const forkQueryParams: ForkQueryParams | undefined = forkQueryState
        ? createForkQueryParams(forkQueryState.owner, forkQueryState.repo, forkQueryState.sort)
        : undefined;

    const accessToken = getAccessToken() ?? "";

    return useQuery({
        queryKey: ["forks", forkQueryState],
        queryFn: () => fetchForks(forkQueryParams as ForkQueryParams, accessToken, forkQueryState?.forksCount),
        // Done so query is not triggered on first render.
        enabled: isAuthenticated && !!forkQueryParams,
        refetchOnWindowFocus: false,
    });
}

/**
 * Fetches commit data using a the underlying Json function.
 * Takes the forks to query commits for and returns an array of commits.
 *
 * @param parameters - An array of forks and a data range for which to query.
 * @returns The result object is of type CommitInfo.
 */

export function useFetchCommitsBatch(forks: UnprocessedRepository[], forkQueryState?: ForkQueryState) {
    const { isAuthenticated, getAccessToken } = useAuth();
    const accessToken = getAccessToken() ?? "";


    const commitQueryParameters: CommitQueryParams[] = useMemo(() => forkQueryState ? forks.map(fork =>
        createCommitQueryParams(
            fork.owner.login,
            fork.name,
            forkQueryState.range.start.toISOString().split("T")[0],
            forkQueryState.range.end.toISOString().split("T")[0]
        ))
        : [], [forks]);

    // Check if main repository has a lot of commits
    useEffect(() => {
        if (commitQueryParameters.length > 0) {
            fetchCommitCount(commitQueryParameters[0], accessToken).then((commitsCount) => {
                if (commitsCount > 2000) {
                    alert("Repository contains a lot of commits for this time range. This might take a while");
                }});
        }
    }, [commitQueryParameters]);

    return useQueries({
        queries: commitQueryParameters.map((parameters) => {
            return {
                queryKey: ["commits", parameters],
                queryFn: async () => fetchCommits(parameters, accessToken),
                enabled: isAuthenticated,
                refetchOnWindowFocus: false,
            };
        }),
    });
}
