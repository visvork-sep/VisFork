import { GetAvatarUrlDocument, GetAvatarUrlQueryVariables, GetForksDocument, GetForksQueryVariables }
    from "@generated/graphql";
import { paths } from "@generated/rest-schema";
import request from "graphql-request";
import createClient from "openapi-fetch";
import { CommitQueryParams, ForkQueryParams, RepoQueryParams } from "../Types/GithubTypes";
import { API_URL } from "@Utils/Constants";

const GRAPHQL_URL = `${API_URL}/graphql`;
const fetchClient = createClient<paths>({ baseUrl: API_URL });

/**
 * Fetch forks via GraphQL API.
 */
export async function fetchForksGql(parameters: GetForksQueryVariables, accessToken: string) {
    return request(GRAPHQL_URL, GetForksDocument, parameters, [["Authorization", "bearer" + accessToken]]);
}

/**
 * Fetch commits using REST API.
 */
export async function fetchCommits(parameters: CommitQueryParams, accessToken: string) {
    return fetchClient.GET("/repos/{owner}/{repo}/commits", {
        params: parameters,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

/**
 * Fetch forks using REST API.
 */
export async function fetchForks(parameters: ForkQueryParams, accessToken: string) {
    return fetchClient.GET("/repos/{owner}/{repo}/forks", { params: parameters,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    });
}/**
 * Fetch forks using REST API.
 */
export async function fetchRepo(parameters: RepoQueryParams, accessToken: string) {
    return fetchClient.GET("/repos/{owner}/{repo}", { params: parameters,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    });
}

export async function fetchAvatarUrlGql(parameters: GetAvatarUrlQueryVariables, accessToken: string) {
    return request(GRAPHQL_URL, GetAvatarUrlDocument, parameters, [["Authorization", "bearer " + accessToken]]);
}
