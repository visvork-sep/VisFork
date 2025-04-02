import { GetAvatarUrlDocument, GetAvatarUrlQueryVariables, GetForksDocument, GetForksQueryVariables }
    from "@generated/graphql";
import { paths, components } from "@generated/rest-schema";
import request from "graphql-request";
import createClient from "openapi-fetch";
import { CommitQueryParams, ForkQueryParams, GitHubAPIFork} from "../Types/DataLayerTypes";
import { API_URL, MAX_QUERIABLE_COMMIT_PAGES } from "@Utils/Constants";

const GRAPHQL_URL = `${API_URL}/graphql`;
const fetchClient = createClient<paths>({ baseUrl: API_URL });

/**
 * Fetch forks via GraphQL API.
 */
export async function fetchForksGql(parameters: GetForksQueryVariables, accessToken: string) {
    return request(GRAPHQL_URL, GetForksDocument, parameters, [["Authorization", "bearer" + accessToken]]);
}

export async function fetchCommits(parameters: CommitQueryParams, accessToken: string, page = 1) {
    const allCommits:  components["schemas"]["commit"][] = [];
    let response;
    let pagesRemaining = true;

    // Hard limit page count so we only fetch maximum 2000 commits
    while (pagesRemaining && page <= MAX_QUERIABLE_COMMIT_PAGES) {
        response = await fetchClient.GET("/repos/{owner}/{repo}/commits", {
            params: { ...parameters,
                query: {
                    ...parameters.query, // Keep existing query params
                    per_page: 100,
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

async function fetchForksPage(parameters: ForkQueryParams, 
    accessToken: string, 
    forksNumber: number, 
    allForks: GitHubAPIFork[], 
    page: number) {
    let pagesRemaining = true;
    let response;
    
    while (pagesRemaining && allForks.length < forksNumber) {
        response = await fetchClient.GET("/repos/{owner}/{repo}/forks", {
            params: {
                ...parameters,
                query: {
                    ...parameters.query,
                    per_page: 100,
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
    
    return { response, allForks };
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

    // Fetch all fork repositories
    const { response } = await fetchForksPage(parameters, accessToken, forksNumber, allForks, 1);

    // Return a combined response
    return {
        ...response, // Retain original response structure
        data: allForks.slice(0, forksNumber + 1), // Replace data with accumulated main repo + forks
    };
}


export async function fetchAvatarUrlGql(parameters: GetAvatarUrlQueryVariables, accessToken: string) {
    return request(GRAPHQL_URL, GetAvatarUrlDocument, parameters, [["Authorization", "bearer " + accessToken]]);
}
