import { SortingCriterionGithub } from "../Types/ForkFilter";
import { CommitQueryParams, ForkQueryParams } from "../Types/GithubTypes";
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
    perPage = 30
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
 * Helper function to create a ForkQueryParams object with default values.
 *
 * @param owner - The repository owner's GitHub username.
 * @param repo - The repository name.
 * @param sort - Sorting criteria for forks (default: stargazers).
 * @param perPage - Number of results per page (default: 30).
 * @param page - Page number for pagination (default: 1).
 * @returns A properly structured ForkQueryParams object.
 */
export function createForkQueryParams(
    owner: string,
    repo: string,
    sort: SortingCriterionGithub = "stargazers",
    perPage = 30,
    page = 1
): ForkQueryParams {
    return {
        path: { owner, repo },
        query: {
            sort,
            per_page: perPage,
            page
        }
    };
}


/**
 * Helper function to create a GetForksQueryVariables object with defaults to be used for GraphQL.
 *
 * @param owner Repository owner's GitHub username.
 * @param name Repository name.
 * @param numForks Number of forks to fetch (default: 10).
 * @param repositoryOrder Sorting order (default: STARS_DESC).
 * @param after (Optional) Pagination cursor.
 * @returns A properly structured GetForksQueryVariables object.
 */
export function createForkQueryParamsGql(
    owner: string,
    name: string,
    numForks: 10,
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
