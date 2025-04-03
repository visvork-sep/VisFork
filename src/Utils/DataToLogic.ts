import { GitHubAPIFork, GitHubAPICommit } from "@Types/DataLayerTypes";
import { UnprocessedRepository, UnprocessedCommitExtended } from "@Types/LogicLayerTypes";

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


function getAuthorName(commit: GitHubAPICommit): string | "Unknown" {
    return commit.commit?.author?.name ?? "Unknown";
}

function getLogin(commit: GitHubAPICommit): string | "Unknown" {
    return commit.author?.login ?? "Unknown";
}

function getCommitDate(commit: GitHubAPICommit) {
    return commit.commit?.committer?.date ? new Date(commit.commit.committer.date) : "Unknown";
}

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
