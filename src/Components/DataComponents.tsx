import { SplitPageLayout } from "@primer/react";
import ConfigurationPane from "@Components/ConfigurationPane/ConfigurationPane";
import ApplicationBody from "@Components/ApplicationBody";
import { useFilteredData } from "@Hooks/useFilteredData";
import { Commit, Repository, UnprocessedCommitExtended, UnprocessedRepository } from "@Types/LogicLayerTypes";
import { useMemo } from "react";
import { processCommits } from "@Utils//BranchingInference/BranchingInference";

function DataComponents() {
    const { onFiltersChange, forks, commits }= useFilteredData();

    // Main repo is the first member of the forks list
    const mainRepoName = useMemo(() => {
        return `${forks[0]?.owner.login}/${forks[0]?.name}`;
    }, [forks]);

    const defaultBranchesMap = useMemo(() => createDefaultBranchesMap(forks), [forks]);
    const removedCommits = useMemo(() => processCommits(commits, defaultBranchesMap, mainRepoName), [
        commits,
        defaultBranchesMap,
        mainRepoName,
    ]);

    const { forks: processedForks, commits: processedCommits } = useMemo(
        () => preprocessor(removedCommits, forks),
        [removedCommits, forks]
    );

    return (
        <>
            <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
                <ConfigurationPane filterChangeHandler={onFiltersChange}/>
            </SplitPageLayout.Pane >
            <SplitPageLayout.Content aria-label="Content" width="xlarge">
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
        name: `${fork.owner.login}/${fork.name}`,
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
    }

    return defaultBranches;
}

export default DataComponents;
