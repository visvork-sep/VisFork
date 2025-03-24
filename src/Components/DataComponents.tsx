import { SplitPageLayout } from "@primer/react";
import ConfigurationPane from "@Components/ConfigurationPane/ConfigurationPane";
import ApplicationBody from "@Components/ApplicationBody";
import { useFilteredData } from "@Hooks/useFilteredData";
import { Commit, Repository, UnprocessedCommitExtended, UnprocessedRepository } from "@Types/LogicLayerTypes";

function DataComponents() {
    const { onFiltersChange, forks, commits, data  }= useFilteredData();

    const {forks: processedForks, commits: processedCommits} = preprocessor(commits, forks);

    console.log(JSON.stringify(data));
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
export default DataComponents;
