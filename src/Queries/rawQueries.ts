import { GetAvatarUrlDocument, GetAvatarUrlQueryVariables, GetForksDocument, GetForksQueryVariables }
    from "@generated/graphql";
import { paths, components } from "@generated/rest-schema";
import request from "graphql-request";
import createClient from "openapi-fetch";

import { CommitQueryParams, ForkQueryParams, GitHubAPIFork} from "../Types/DataLayerTypes";
import { API_URL, MAX_QUERIABLE_COMMIT_PAGES, PAGE_SIZE } from "@Utils/Constants";

const GRAPHQL_URL = `${API_URL}/graphql`;
const fetchClient = createClient<paths>({ baseUrl: API_URL });

/**
 * Fetch forks via GraphQL API.
 */
export async function fetchForksGql(parameters: GetForksQueryVariables, accessToken: string) {
    return request(GRAPHQL_URL, GetForksDocument, parameters, [["Authorization", "bearer" + accessToken]]);
}

/**
* Fetch the amount of commits in a certain repository
*/
export async function fetchCommitCount(parameters: CommitQueryParams, accessToken: string, page = 1) {

    const response = await fetchClient.GET("/repos/{owner}/{repo}/commits", {
        params: {
            ...parameters,
            query: {
                ...parameters.query, // Keep existing query params
                per_page: PAGE_SIZE,
                page
            }
        },
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const linkHeader = response.response.headers.get("link");
    if (linkHeader) {
        const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
        if (lastPageMatch) {
            const lastPage = parseInt(lastPageMatch[1]);
            // Each page contains a hundred commits
            
            return lastPage * PAGE_SIZE;
        }
    }

    // If no link header or no match, the repository only has 1 page worth of commits
    return PAGE_SIZE; 
}

export async function fetchCommits(parameters: CommitQueryParams, accessToken: string, page = 1) {
    const allCommits: components["schemas"]["commit"][] = [];
    let response;
    let pagesRemaining = true;

    while (pagesRemaining) {
        response = await fetchClient.GET("/repos/{owner}/{repo}/commits", {
            params: {
                ...parameters,
                query: {
                    ...parameters.query, // Keep existing query params
                    per_page: PAGE_SIZE,
                    page
                }
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });


        if (response?.data) {
            allCommits.push(...response.data); // Collect all commits in a single array:q
        }
        const linkHeader = response.response.headers.get("link");

        pagesRemaining = linkHeader?.includes("rel=\"next\"") ?? false;
        page++;

    }

    // Return a single FetchResponse-like object with all the data
    return {
        ...response, // Retain original FetchResponse structure
        data: allCommits, // Replace data with the accumulated commits
    };
}

/**
 * Fetch forks using REST API.
 */
export async function fetchForks(parameters: ForkQueryParams, accessToken: string, forksNumber = 5) {
    const allForks: GitHubAPIFork[] = [];

    // Fetch main repository, not just the forks
    const mainRepoResponse = await fetchClient.GET("/repos/{owner}/{repo}", {
        params: {
            // Parameters for main repo only need the repo and ownder info
            path: parameters.path,
        },
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (mainRepoResponse?.data) {
        allForks.push(mainRepoResponse.data as GitHubAPIFork);
    }

    let response;
    let page = 1;
    let pagesRemaining = true;

    // Fetch all fork repositories
    while (pagesRemaining && allForks.length < forksNumber) {
        response = await fetchClient.GET("/repos/{owner}/{repo}/forks", {
            params: {
                ...parameters,
                query: {
                    ...parameters.query, // Keep existing query params
                    per_page: PAGE_SIZE, // Prevent exceeding limit
                    page
                }
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response?.data) {
            allForks.push(...response.data);
        }

        if (allForks.length >= forksNumber) break;

        const linkHeader = response.response.headers.get("link");
        pagesRemaining = linkHeader?.includes("rel=\"next\"") ?? false;
        page++;
    }

    // Return a combined response
    return {
        ...response, // Retain original response structure
        data: allForks.slice(0, forksNumber + 1), // Replace data with accumulated main repo + forks
    };
}


export async function fetchAvatarUrlGql(parameters: GetAvatarUrlQueryVariables, accessToken: string) {
    return request(GRAPHQL_URL, GetAvatarUrlDocument, parameters, [["Authorization", "bearer " + accessToken]]);
}
