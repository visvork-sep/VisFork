import { GetAvatarUrlDocument, GetAvatarUrlQueryVariables, GetForksDocument, GetForksQueryVariables } from "@generated/graphql";
import { paths } from "@generated/rest-schema";
import request from "graphql-request";
import createClient from "openapi-fetch";
import { CommitQueryParams, ForkQueryParams } from "../Types/GithubTypes";
import { API_URL } from "@Utils/Constants";

const GRAPHQL_URL = `${API_URL}/graphql`;

const fetchClient = createClient<paths>({ baseUrl: API_URL });

/**
 * Fetch forks via GraphQL API.
 */
export async function fetchForksGql(parameters: GetForksQueryVariables) {
    return request(GRAPHQL_URL, GetForksDocument, parameters);
}

/**
 * Fetch commits using REST API.
 */
export async function fetchCommits(parameters: CommitQueryParams) {
    return fetchClient.GET("/repos/{owner}/{repo}/commits", { params: parameters });
}

/**
 * Fetch forks using REST API.
 */
export async function fetchForks(parameters: ForkQueryParams) {
    return fetchClient.GET("/repos/{owner}/{repo}/forks", { params: parameters });
}

export async function fetchAvatarUrlGql(parameters: GetAvatarUrlQueryVariables, accessToken: string) {
    return request(GRAPHQL_URL, GetAvatarUrlDocument, parameters, [["Authorization", "bearer " + accessToken]]);
}
