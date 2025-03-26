import { SplitPageLayout } from "@primer/react";
import ConfigurationPane from "@Components/ConfigurationPane/ConfigurationPane";
import ApplicationBody from "@Components/ApplicationBody";
import { useFilteredData } from "@Hooks/useFilteredData";
import { Commit, Repository, UnprocessedCommitExtended, UnprocessedRepository } from "@Types/LogicLayerTypes";
import { deleteDuplicateCommits } from "@Utils/BranchingInference";

function DataComponents() {
    const { onFiltersChange, forks, commits, forkQuery  }= useFilteredData();
    const mainRepo = `${forkQuery?.owner}/${forkQuery?.repo}`;
    const removedCommits = deleteDuplicateCommits(commits, createDefaultBranchesMap(forks), mainRepo);
    const {forks: processedForks, commits: processedCommits} = preprocessor(removedCommits, forks);

    return (
        <>
            <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
                <ConfigurationPane filterChangeHandler={onFiltersChange}/>
            </SplitPageLayout.Pane >
            <SplitPageLayout.Content aria-label="Content">
                <ApplicationBody forks={processedForks} commits={processedCommits} />
            </SplitPageLayout.Content>
        </>
    );
}

// TODO: Change preprocessor to actually calculate commit type.
function preprocessor(commits: UnprocessedCommitExtended[],
    forks: UnprocessedRepository[]): {forks: Repository[], commits: Commit[]} {
    const processedForks: Repository[] = forks.map(fork => ({
        id: fork.id,
        name: fork.name,
        owner: {login: fork.owner.login},
        description: fork.description ?? "",
        created_at: fork.created_at ?? new Date(),
        last_pushed: fork.last_pushed ?? new Date(),
        ownerType: fork.ownerType,
        defaultBranch: fork.defaultBranch,
    }));

    const processedCommits: Commit[] = commits.map(commit => ({
        sha: commit.sha,
        id: commit.id,
        parentIds: commit.parentIds,
        node_id: commit.node_id,
        mergedNodes: [],
        date: commit.date === "Unknown" ? new Date() : commit.date,
        url: commit.url,
        author: commit.author,
        message: commit.message,
        commitType: "adaptive",
        branch: commit.branch ?? "",
        repo: commit.repo ?? "",

    }));

    return {forks: processedForks, commits: processedCommits};
}

function createDefaultBranchesMap(repos: UnprocessedRepository[]): Record<string, string> {
    const defaultBranches: Record<string, string> = {};

    for (const repo of repos) {
        const fullName = `${repo.owner.login}/${repo.name}`;
        defaultBranches[fullName] = repo.defaultBranch;
        repo.name = fullName;

    }

    return defaultBranches;
}

export default DataComponents;
