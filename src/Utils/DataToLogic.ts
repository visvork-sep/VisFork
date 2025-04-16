import { GitHubAPIFork, GitHubAPICommit } from "@Types/DataLayerTypes";
import { UnprocessedRepository, UnprocessedCommitExtended } from "@Types/LogicLayerTypes";

/**
 * Converts a GitHub API fork object to an UnprocessedRepository object.
 */
export function toForkInfo(fork: GitHubAPIFork): UnprocessedRepository {
    return {
        id: fork.id,
        name: fork.name,
        owner: { login: fork.owner.login },
        description: fork.description,
        created_at: fork.created_at ? new Date(fork.created_at) : null,
        last_pushed: fork.pushed_at ? new Date(fork.pushed_at) : null,
        ownerType: fork.owner.type === "Organization" ? "Organization" : "User",
        defaultBranch: fork.default_branch ?? ""
    };
}

/**
 * Retrieves the author's name from a commit.
 */
function getAuthorName(commit: GitHubAPICommit): string | "Unknown" {
    return commit.commit?.author?.name ?? "Unknown";
}

/**
 * Retrieves the author's login from a commit.
 */
function getLogin(commit: GitHubAPICommit): string | "Unknown" {
    return commit.author?.login ?? "Unknown";
}

/**
 * Retrieves the commit date from a commit.
 */
function getCommitDate(commit: GitHubAPICommit) {
    return commit.commit?.committer?.date ? new Date(commit.commit.committer.date) : "Unknown";
}

/**
 * Converts raw GitHub API commit data into an UnprocessedCommitExtended object.
 */
export function toCommitInfo(commit: GitHubAPICommit): UnprocessedCommitExtended {
    return {
        sha: commit.sha,
        id: commit.node_id,
        parentIds: commit.parents?.map(parent => parent.sha) ?? [],
        node_id: commit.node_id,
        author: getAuthorName(commit),
        login: getLogin(commit),
        date: getCommitDate(commit),
        url: commit.html_url,
        message: commit.commit?.message ?? "",
        branch: "",
        repo: "",
    };
}
