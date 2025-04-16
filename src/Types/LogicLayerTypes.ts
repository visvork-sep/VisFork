import { ForksSortingOrder, CommitType, OwnerType, SortDirection } from "@Utils/Constants";

/**
 * Represents the raw output from the data layer.
 */
export interface DataLayerOutput {
    forks: UnprocessedRepository[],
    commits: UnprocessedCommitExtended[],
}

/**
 * Represents the raw output from the data layer for a single repository.
 */
export interface UnprocessedCommitExtended {
    sha: string;
    id: string;
    parentIds: string[];
    node_id: string;
    author: string;
    login: string;
    date: Date | "Unknown";
    url: string;
    message: string;
    branch: string;
    repo: string;
}

/**
 * Represents the raw output from the data layer for a single commit.
 */
export interface Commit extends UnprocessedCommitExtended {
    mergedNodes: string[];
    date: Date;
    branch: string;
    commitType: CommitType;
    repo: string;
}


/**
 * Defines the raw structure for repositories.
 */
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

/**
 * Refines UnprocessedRepository by ensuring all fields are non-null.
 */
export interface Repository extends UnprocessedRepository {
    description: string;
    created_at: Date;
    last_pushed: Date;
}

/**
 * Groups repository data along with its associated commits.
 */
export interface RepositoryInfoWithCommits extends UnprocessedRepository {
    commits: UnprocessedCommitExtended[];
}

/**
 * Extends RepositoryInfoWithCommits to include forks of the repository.
 */
export interface MainRepositoryInfo extends RepositoryInfoWithCommits {
    forks: RepositoryInfoWithCommits[];
}

/**
 * Defines a time period with start and end,
 * used for example in the Histogram to allow easier filtering on date.
 */
export interface DateRange {
    start: Date;
    end: Date
};

/**
 * Represents the state used to query forks,
 * including required repository identifiers and filtering/sorting options.
 */
export interface ForkQueryState {
    owner: string;
    repo: string;
    forksCount: number;
    range: DateRange;
    sort: ForksSortingOrder;
    direction: SortDirection;
}

/** 
 * Defines the filter state structure.
 * See URD Section 3.1.3. "Filtering and Sorting Options". 
 */
export interface ForkFilter {
    commitTypes: CommitType[];
    ownerTypes: OwnerType[];
    updatedInLastMonths?: number;
}
