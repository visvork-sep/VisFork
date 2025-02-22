import { GetForksQueryVariables } from "@generated/graphql";
import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchForks, fetchCommits } from "./rawQueries";
import { CommitQueryParams } from "../types/githubTypes"

export function useFetchForks(parameters: GetForksQueryVariables) {
    return useQuery({
        queryKey: ["forks", parameters],
        queryFn: () => fetchForks(parameters),
        enabled: !!parameters //dependent on variables
    });
}

/**
 * REST API query for fetching commits, based on openapi spec. 
 * .contrib/github-rest-api/api.github.com.2022-11-28.yaml
 * 
 * @param parameters Rest API params based on the openapi spec.
 * @returns 
 */
export function useFetchCommits(parameters: CommitQueryParams) {
    return useQuery({
        queryKey: ["commits", parameters],
        queryFn: () => fetchCommits(parameters),
        enabled: !!parameters //dependent on variables
    });
}

/**
 * Parallel fetch of commits based on a list of parameters.
 * For single query use @see {useFetchCommits}.
 * 
 * @param parametersList list of parameters for the rest api query
 * @returns list of responses for each query
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
