import { ForksSortingOrder, CommitType, OwnerType, SortDirection } from "@Utils/Constants";

export interface DataLayerOutput {
    forks: UnprocessedRepository[],
    commits: UnprocessedCommitExtended[],
}

export interface UnprocessedCommitExtended {
    sha: string;
    id: string;
    parentIds: string[];
    node_id: string;
    author: string;
    date: Date | "Unknown";
    url: string;
    message: string;
    branch: string;
    repo: string;
}

// TEMPORARY
export interface Commit extends UnprocessedCommitExtended {
    mergedNodes: string[];
    date: Date;
    branch: string;
    commitType: CommitType;
    repo: string;
}



export interface UnprocessedRepository {
    id: number;
    name: string;
    owner: { login: string };
    description: string | null;
    created_at: Date | null;
    last_pushed: Date | null;
    ownerType: OwnerType;
    defaultBranch: string;
}

// TEMPORARY
export interface Repository extends UnprocessedRepository{
    description: string;
    created_at: Date;
    last_pushed: Date;
}


export interface RepositoryInfoWithCommits extends UnprocessedRepository {
    commits: UnprocessedCommitExtended[];
}

export interface MainRepositoryInfo extends RepositoryInfoWithCommits {
    forks: RepositoryInfoWithCommits[];
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
    forkTypes: CommitType[];
    // sortByLastCommit?: boolean; -> moved to SortingCriterionExtra "latestCommit"
    ownerTypes: OwnerType[];
    updatedInLastMonths?: number;
}




