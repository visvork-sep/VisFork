import { CommitQueryParams } from "../types/githubTypes";
import { GetForksQueryVariables, RepositoryOrder, OrderDirection, RepositoryOrderField } from "@generated/graphql";

/**
 * Helper function to create a CommitQueryParams object with defaults.
 *
 * @param owner The repository owner
 * @param repo The repository name
 * @param since (Optional) Date to fetch commits from
 * @param until (Optional) Date to fetch commits until
 * @param perPage (Optional) Number of commits per request (default: 30)
 * @returns CommitQueryParams object
 */
export function createCommitQueryParams(
    owner: string,
    repo: string,
    since?: string,
    until?: string,
    perPage: number = 30
): CommitQueryParams {
    return {
        path: { owner, repo },
        query: {
            since,
            until,
            per_page: perPage
        }
    };
}


/**
 * Helper function to create a GetForksQueryVariables object with defaults.
 *
 * @param owner Repository owner's GitHub username.
 * @param name Repository name.
 * @param numForks Number of forks to fetch (default: 10).
 * @param repositoryOrder Sorting order (default: STARS_DESC).
 * @param after (Optional) Pagination cursor.
 * @returns A properly structured GetForksQueryVariables object.
 */
export function createForkQueryParams(
    owner: string,
    name: string,
    numForks: number = 10,
    repositoryOrder: RepositoryOrder = { direction : OrderDirection.Desc, field : RepositoryOrderField.Stargazers } ,
    after?: string
): GetForksQueryVariables {
    return {
        owner,
        name,
        numForks,
        repositoryOrder,
        after
    };
}
