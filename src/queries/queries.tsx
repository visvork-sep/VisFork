/// TODO: Add middleware for Authorization
/// TODO: Create factories for parameter creation

import { GetAvatarUrlDocument, GetAvatarUrlQueryVariables, GetForksDocument, GetForksQueryVariables }
    from "@generated/graphql";
import { paths } from "@generated/rest-schema";
import { useQueries, useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import createClient from "openapi-fetch";
import { useAuth } from "@Providers/AuthProvider";
import { API_URL } from "@Utils/Constants";

const GRAPHQL_URL = API_URL + "/graphql";

/**
 * Rest API query client.
 */
const fetchClient = createClient<paths>({
    baseUrl: API_URL // TODO! add the correct URL
});

export function useFetchForks(parameters: GetForksQueryVariables) {
    return useQuery({
        queryKey: ["forks", parameters],
        queryFn: async () => {
            return request(GRAPHQL_URL, GetForksDocument, parameters);
        },
        enabled: !!parameters //dependent on variables
    });
}

/**
 *  Gets to avatar url
 * @returns response of request to get avatar
 */
export function useFetchAvatarUrl(parameters: GetAvatarUrlQueryVariables) {
    const { isAuthenticated, getAccessToken } = useAuth();
    const accessToken = getAccessToken();

    return useQuery({
        queryKey: ["avatarUrl"],
        queryFn: async () => {
            return request(GRAPHQL_URL, GetAvatarUrlDocument, parameters, [["Authorization", "bearer " + accessToken]]);
        },
        gcTime: 0, // dont store
        enabled: isAuthenticated
    });
}

/**
 * REST API query for fetching commits, based on openapi spec. 
 * .contrib/github-rest-api/api.github.com.2022-11-28.yaml
 * 
 * @param parameters Rest API params based on the openapi spec.
 * @returns 
 */
export function useFetchCommits(parameters: paths["/repos/{owner}/{repo}/commits"]["get"]["parameters"]) {
    return useQuery({
        queryKey: ["commits", parameters],
        queryFn: async () => {
            return fetchClient.GET("/repos/{owner}/{repo}/commits", { params: parameters });
        },
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
export function useFetchCommitsBatch(parametersList: [paths["/repos/{owner}/{repo}/commits"]["get"]["parameters"]]) {
    return useQueries({
        queries: parametersList
            ? parametersList.map((parameters) => {
                return {
                    queryKey: ["commits", parameters],
                    queryFn: async () => {
                        return fetchClient.GET("/repos/{owner}/{repo}/commits", { params: parameters });
                    }
                };
            }) : [],
    });
}
