import { ForkJSON, CommitJSON } from "@Types/GithubTypes";
import { ForkInfo, CommitInfo } from "@Types/DataLayerTypes";

export function toForkInfo(fork: ForkJSON): ForkInfo {
    return {
        id: fork.id,
        name: fork.name,
        owner: { login: fork.owner.login },
        description: fork.description,
        created_at: fork.created_at,
        last_pushed: fork.pushed_at
    };
}

export function toCommitInfo(commit: CommitJSON): CommitInfo {
    return {
        sha: commit.sha,
        id: commit.node_id, // Assuming `node_id` is unique and works as an ID
        parentIds: commit.parents?.map(parent => parent.sha) ?? [],
        node_id: commit.node_id,
        author: commit.commit?.author?.name ?? "Unknown",
        date: commit.commit?.author?.date ?? "Unknown",
        url: commit.html_url,
        message: commit.commit?.message ?? "",
        mergedNodes: [], // No clear mapping, leaving as empty array
        repo: commit.repo,
        commit_type: undefined,
        branch_name: undefined,
        branch_id: undefined
    };
}
