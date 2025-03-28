import { useState, useMemo, useEffect, useCallback } from "react";
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

export function useFilteredData() {
  // Create the state for the query parameters
  const [forkQueryState, setForkQueryState] = useState<ForkQueryState | undefined>(undefined);

  // State for additional filtering, such as sorting and date range.
  const [filters, setFilters] = useState<ForkFilter | undefined>(undefined);
  const [finalForkData, setFinalForkData] = useState<UnprocessedRepository[]>([]);
  const [finalCommitData, setFinalCommitData] = useState<UnprocessedCommitExtended[]>([]);

  const onRequestChange: FilterChangeHandler = useCallback((filters, forkQueryState) => {
    setForkQueryState(forkQueryState);
    setFilters(filters)
  }, []);

  const { data: forkData, isLoading: isLoadingFork, error: forkError } = useFetchForks(forkQueryState);

  const simplifiedForkData = useMemo(() => forkData?.data ?
    forkData.data.map(fork => toForkInfo(fork)) : [], [forkData]);


  const filteredForks = useMemo(() => {
    return (filters)
      ?
      simplifiedForkData.filter(fork => isValidForkByFilter(fork, filters))
      :
      [];
  },
    [simplifiedForkData, filters]);


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
    return commitData ?
      commitData.map(commits => commits.map(commit => toCommitInfo(commit))) : [];
  }
    , [commitData]);

  let mainRepositoryInfo: MainRepositoryInfo | undefined = undefined;
  if (!forkError
    && !commitError
    && !isLoadingFork
    && !isLoadingCommits
    && simplifiedForkData.length > 0
    && simplifiedCommitData.length == simplifiedForkData.length
    && forkQueryState?.owner
    && forkQueryState?.repo
  ) {
    const completeForkData: RepositoryInfoWithCommits[] = simplifiedForkData.map((fork, index) =>
    ({
      ...fork,
      commits: simplifiedCommitData[index]
    })
    );

    // temporary get data on main repository
    const completeData: MainRepositoryInfo = {
      owner: { login: forkQueryState.owner }, // get from query instead
      forks: completeForkData, // get form query instead
      commits: [], // temporary
      id: 0, // id
      name: "", //
      description: null,
      created_at: null,
      last_pushed: null,
      ownerType: "User", // get from query instead
      defaultBranch: "main"
    };

    mainRepositoryInfo = completeData;
  }

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
  }, [isLoadingFork, isLoadingCommits]);


  return {
    isLoading: isLoadingFork || isLoadingCommits,
    forks: finalForkData,
    commits: finalCommitData,
    data: mainRepositoryInfo,
    onFiltersChange: onRequestChange,
    forkQuery: forkQueryState,
    forkError,
    commitError,

    isLoadingFork,
    isLoadingCommits
  };
}
