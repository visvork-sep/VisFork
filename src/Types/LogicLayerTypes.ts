import { ForksSortingOrder, ForkType, OwnerType, SortDirection } from "@Utils/Constants";

export interface DataLayerOutput {
    forks: RepositoryInfo[],
    commits: CommitInfo[],
}

export interface CommitInfo {
    sha: string;
    id: string;
    parentIds: string[];
    node_id: string;
    author: string;
    date: Date | "Unknown";
    url: string;
    message: string;
    mergedNodes: unknown[];
    commit_type: string;
    branch_name: string;
    branch_id: string;
}

export interface RepositoryInfo {
    id: number;
    name: string;
    owner: { login: string };
    description: string | null;
    created_at: Date | null;
    last_pushed: Date | null;
    ownerType: OwnerType;
}

export interface RepositoryInfoWithCommits extends RepositoryInfo {
    commits: CommitInfo[];
}

export interface MainRepositoryInfo extends RepositoryInfoWithCommits {
    forks: RepositoryInfoWithCommits[];
}

export interface CommitInfoExtended extends CommitInfo {
    repo: string;
    
}

export interface DateRange {
    start: Date;
    end: Date
};

export interface ForkQueryState {
    owner: string;
    repo: string;
    forksCount: number;
    range: DateRange;
    sort: ForksSortingOrder;
    direction: SortDirection;
}

// Define the filter state structure
/** See URD Section 3.1.3. "Filtering and Sorting Options". */
export interface ForkFilter {
    dateRange: DateRange;
    activeForksOnly?: boolean;
    forkTypes: ForkType[];
    // sortByLastCommit?: boolean; -> moved to SortingCriterionExtra "latestCommit"
    ownerTypes: OwnerType[];
    updatedInLastMonths?: number;
}




