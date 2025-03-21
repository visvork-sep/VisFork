import { useState } from "react";
import { CommitInfo, 
    ForkFilter, 
    ForkInfo,
    ForkInfoWithCommits, 
    ForkQueryState, 
    RepoWithForks 
} from "@Types/LogicLayerTypes";
import { useFetchCommitsBatch, useFetchForks } from "@Queries/queries";
import { toCommitInfo, toForkInfo } from "@Utils/DataToLogic";
import { GitHubAPICommit } from "@Types/DataLayerTypes";

export type FilterChangeHandler = (filters: ForkFilter, forkQueryState: ForkQueryState) => void;

export function useFilteredData() {
    // Create the state for the query parameters
    const [forkQueryState, setForkQueryState] = useState<ForkQueryState | undefined>(undefined);

    // State for additional filtering, such as sorting and date range.
    const [filters, setFilters] = useState<ForkFilter | undefined>(undefined);

    const onRequestChange: FilterChangeHandler = (filters, forkQueryState) => {
        setForkQueryState(forkQueryState);
        setFilters(filters);
    };

    // Fetch forks data using the constructed query parameters.
    const {data: forkData, isLoading: isLoadingFork, error: forkError} = useFetchForks(forkQueryState);

    const simplifiedForkData = forkData?.data ?
        forkData.data.map(fork => toForkInfo(fork)) : []; 

    // Memoized filtering: Applies filters only when data or filters change.
    const filteredForks = filters ? simplifiedForkData.filter(fork =>     
        isIncludedFork(filters, fork)
    ) : simplifiedForkData;

    // TODO: Fix pagination
    const commitResponses = useFetchCommitsBatch(filteredForks, forkQueryState);

    const { commitData, isLoading: isLoadingCommits, error: commitError } = commitResponses
        .reduce<{commitData?: GitHubAPICommit[][], isLoading: boolean, error: Error | null}>((acc, response) => {
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
    
    const simplifiedCommitData: CommitInfo[][] = commitData ? 
        commitData.map(commits => commits.map(commit => toCommitInfo(commit))) : [];

    let repoWithForks: RepoWithForks | undefined = undefined;
    if (!forkError 
        && !commitError 
        && !isLoadingFork 
        && !isLoadingCommits 
        && simplifiedForkData.length > 0 
        && simplifiedCommitData.length == simplifiedForkData.length
    ) {
        const completeForkData: ForkInfoWithCommits[] = simplifiedForkData.map((fork, index) => 
            ({
                ...fork,
                commits: simplifiedCommitData[index]
            })
        );
        const completeData: RepoWithForks = {
            owner: forkQueryState?.owner ?? "",
            repo: forkQueryState?.repo ?? "",
            forks: completeForkData
        };

        repoWithForks = completeData;
    }

    return {
        isLoading: isLoadingFork || isLoadingCommits,
        forks: filteredForks,
        commits: simplifiedCommitData,
        data: repoWithForks,
        onFiltersChange: onRequestChange,

        forkError,
        commitError,

        isLoadingFork,
        isLoadingCommits
    };
}

function isIncludedFork(filter: ForkFilter, fork: ForkInfo): boolean {
    if (filter.dateRange.start && fork.created_at && fork.created_at < filter.dateRange.start) {
        return false;
    }

    if (filter.dateRange.end && fork.last_pushed && fork.last_pushed > filter.dateRange.end) {
        return false;
    }

    if (filter.activeForksOnly) {
    }

    if (!filter.ownerTypes.includes(fork.ownerType)) {
        return false;
    }

    if (filter.forkTypes) {
    }

    if (filter.updatedInLastMonths && fork.last_pushed) {
        const now = new Date();
        const yearsDiff = now.getFullYear() - fork.last_pushed.getFullYear();
        const monthsDiff = now.getMonth() - fork.last_pushed.getMonth();

        const totalMonthsDiff = yearsDiff * 12 + monthsDiff;

        if (totalMonthsDiff > filter.updatedInLastMonths) {
            return false;
        }
    }

    return true;    
}



