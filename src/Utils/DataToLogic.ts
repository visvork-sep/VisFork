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

export function toCommitInfo(commit: GitHubAPICommit): UnprocessedCommitExtended {
    return {
        sha: commit.sha,
        id: commit.node_id, // Assuming `node_id` is unique and works as an ID
        parentIds: commit.parents?.map(parent => parent.sha) ?? [],
        node_id: commit.node_id,
        author: commit.commit?.author?.name ?? "Unknown",
        login: commit.author?.login ?? "Unknown",
        date: commit.commit?.committer?.date ? new Date(commit.commit.committer.date) : "Unknown",
        url: commit.html_url,
        message: commit.commit?.message ?? "",
        branch: "",
        repo: "",
    };
}
