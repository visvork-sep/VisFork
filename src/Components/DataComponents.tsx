import { SplitPageLayout } from "@primer/react";
import ConfigurationPane from "@Components/ConfigurationPane/ConfigurationPane";
import ApplicationBody from "@Components/ApplicationBody";
import { useFilteredData } from "@Hooks/useFilteredData";
import { Commit, ForkFilter, Repository, UnprocessedCommitExtended, UnprocessedRepository }
    from "@Types/LogicLayerTypes";
import { useMemo } from "react";
import { processCommits } from "@Utils/BranchingInference/ProcessCommits";
import { classify } from "@Utils/Classify/Classify";

/**
 * Component that renders the main application body and configuration pane.
 */
function DataComponents() {
    const { onFiltersChange, forks, commits, filters, isLoading } = useFilteredData();

    // Main repo is the first member of the forks list
    const mainRepoName = useMemo(() => {
        return `${forks[0]?.owner.login}/${forks[0]?.name}`;
    }, [forks]);

    // Create a map of default branches for each fork using the main repo name.
    const defaultBranchesMap = useMemo(() => createDefaultBranchesMap(forks), [forks]);

    // Process the commits using the default branches map and main repo name.
    const filteredCommits = useMemo(() => processCommits(commits, defaultBranchesMap, mainRepoName), [
        commits,
        defaultBranchesMap,
        mainRepoName,
    ]);

    // Preprocess the commits and forks data based on the filters.
    const applicationBody = useMemo(
        () => {
            const { commits: processedCommits, forks: processedForks } = preprocessor(filteredCommits, forks, filters);
            return <SplitPageLayout.Content aria-label="Content" width="xlarge">
                <ApplicationBody forks={processedForks} commits={processedCommits} />
            </SplitPageLayout.Content>;
        },
        [filteredCommits, forks]
    );

    // Create the configuration pane with a filter change handler and loading state.
    const configurationPane = useMemo(() => {
        return (
            <SplitPageLayout.Pane aria-label="Pane" width="medium" resizable>
                <ConfigurationPane filterChangeHandler={onFiltersChange} isDataLoading={isLoading} />
            </SplitPageLayout.Pane>
        );
    }, [isLoading]);

    return (
        <>
            {configurationPane}
            {applicationBody}
        </>
    );
}

/**
 * Preprocesses the commits and forks data based on the provided filter.
 */
function preprocessor(commits: UnprocessedCommitExtended[],
    forks: UnprocessedRepository[], filter?: ForkFilter): { forks: Repository[], commits: Commit[]; } {
    const processedForks: Repository[] = forks.map(fork => ({
        id: fork.id,
        name: `${fork.owner.login}/${fork.name}`,
        owner: { login: fork.owner.login },
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
        login: commit.login,
        message: commit.message,
        commitType: classify(commit.message),
        branch: commit.branch ?? "",
        repo: commit.repo ?? "",
    })).filter(commit => {
        return filter ? filter.commitTypes.includes(commit.commitType) : true;
    });

    return { forks: processedForks, commits: processedCommits };
}

/**
 * Creates a map of default branches where each repository is mapped to their
 * respective default branch.
 */
function createDefaultBranchesMap(repos: UnprocessedRepository[]): Record<string, string> {
    const defaultBranches: Record<string, string> = {};

    for (const repo of repos) {
        const fullName = `${repo.owner.login}/${repo.name}`;
        defaultBranches[fullName] = repo.defaultBranch;
    }

    return defaultBranches;
}

export default DataComponents;
