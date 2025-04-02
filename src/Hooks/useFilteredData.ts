import { useState, useMemo, useEffect } from "react";
import {
    UnprocessedCommitExtended,
    ForkFilter,
    RepositoryInfoWithCommits,
    ForkQueryState,
    MainRepositoryInfo,
    UnprocessedRepository,
} from "@Types/LogicLayerTypes";
import { toCommitInfo, toForkInfo } from "@Utils/DataToLogic";
import { GitHubAPICommit } from "@Types/DataLayerTypes";
import { useFetchCommitsBatch, useFetchForks } from "@Queries/queries";
import { isValidForkByFilter } from "@Utils/Filters/ForkFilterUtil";

export type FilterChangeHandler = (filters: ForkFilter, forkQueryState: ForkQueryState) => void;

function unwrap<T>(data: T | undefined) {
    return data || [];
}

function canCreateMainRepositoryInfo(
    forkError: Error | null, 
    commitError: Error | null, 
    isLoadingFork: boolean, 
    isLoadingCommits: boolean, 
    simplifiedForkData: UnprocessedRepository[], 
    filteredForks: UnprocessedRepository[],
    simplifiedCommitData: UnprocessedCommitExtended[][], 
    forkQueryState?: ForkQueryState
): boolean {
    return !forkError
      && !commitError
      && !isLoadingFork
      && !isLoadingCommits
      && simplifiedForkData.length > 0
      && simplifiedCommitData.length === filteredForks.length
      && !!forkQueryState?.owner
      && !!forkQueryState?.repo;
}

function createMainRepositoryInfo(
    filteredForks: UnprocessedRepository[], 
    simplifiedCommitData: UnprocessedCommitExtended[][], 
    forkQueryState: ForkQueryState
): MainRepositoryInfo {
    const completeForkData: RepositoryInfoWithCommits[] = filteredForks.map((fork, index) => ({
        ...fork,
        commits: simplifiedCommitData[index]
    }));

    return {
        owner: { login: forkQueryState.owner },
        forks: completeForkData,
        commits: [],
        id: 0,
        name: "",
        description: null,
        created_at: null,
        last_pushed: null,
        ownerType: "User",
        defaultBranch: "main"
    };
}


export function useFilteredData() {
    // Create the state for the query parameters
    const [forkQueryState, setForkQueryState] = useState<ForkQueryState | undefined>(undefined);

    // State for additional filtering, such as sorting and date range.
    const [filters, setFilters] = useState<ForkFilter | undefined>(undefined);
    const [finalForkData, setFinalForkData] = useState<UnprocessedRepository[]>([]);
    const [finalCommitData, setFinalCommitData] = useState<UnprocessedCommitExtended[]>([]);

    const onRequestChange: FilterChangeHandler = (filters, forkQueryState) => {
        setForkQueryState(forkQueryState);
        setFilters(filters);
    };

    const { data: forkData, isLoading: isLoadingFork, error: forkError } = useFetchForks(forkQueryState);

    const simplifiedForkData = useMemo(() => unwrap(forkData?.data).map(fork => toForkInfo(fork)), [forkData]);


    const filteredForks = useMemo(() => {
        return (filters) ? simplifiedForkData.filter(fork => isValidForkByFilter(fork, filters)) : [];
    }, [simplifiedForkData, filters]);



    const commitResponses = useFetchCommitsBatch(filteredForks, forkQueryState);

    const { commitData, isLoading: isLoadingCommits, error: commitError } = commitResponses
        .reduce<{ commitData?: GitHubAPICommit[][], isLoading: boolean, error: Error | null }>((acc, response) => {
            if ((acc.commitData && response.data?.data)) {
                acc.commitData.push(response.data.data);
            }

            acc.isLoading = acc.isLoading || response.isLoading;

            if (!acc.error) {
                acc.error = response.error;
            }

            return acc;
        },
        {
            commitData: [],
            isLoading: false,
            error: null
        });

    const simplifiedCommitData: UnprocessedCommitExtended[][] = useMemo(() => {
        return unwrap(commitData).map(commits => commits.map(commit => toCommitInfo(commit)));
    }, [commitData]);

    const mainRepositoryInfo = useMemo(() => {
        const shouldCreate = canCreateMainRepositoryInfo(
            forkError, commitError, isLoadingFork, isLoadingCommits,
            simplifiedForkData, filteredForks, simplifiedCommitData, forkQueryState
        );
        
        return (shouldCreate && forkQueryState)
            ? createMainRepositoryInfo(filteredForks, simplifiedCommitData, forkQueryState) : undefined;
    }, [forkError, 
        commitError, 
        isLoadingFork, 
        isLoadingCommits, 
        simplifiedForkData, 
        simplifiedCommitData, 
        forkQueryState]);

    const flattenedCommits: UnprocessedCommitExtended[] =
        mainRepositoryInfo ? mainRepositoryInfo.forks.reduce<UnprocessedCommitExtended[]>((acc, fork) => {
            const commits: UnprocessedCommitExtended[] = fork.commits.map(commit => ({
                ...commit,
                repo: `${fork.owner.login}/${fork.name}`,
                branch: fork.defaultBranch,

            }));

            acc = acc.concat(commits);
            return acc;
        }, []) : [];


    // Add final update only if all data has been loaded
    useEffect(() => {
        if (!isLoadingFork && !isLoadingCommits && filteredForks.length > 0 && flattenedCommits.length > 0) {
            setFinalForkData(filteredForks);
            setFinalCommitData(flattenedCommits);
        }
    }, [isLoadingFork, isLoadingCommits, filters]);



    return {
        isLoading: isLoadingFork || isLoadingCommits,
        forks: finalForkData,
        commits: finalCommitData,
        data: mainRepositoryInfo,
        onFiltersChange: onRequestChange,
        forkQuery: forkQueryState,
        forkError,
        commitError,
        filters,
        isLoadingFork,
        isLoadingCommits
    };
}
