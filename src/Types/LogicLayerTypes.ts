import { ForksSortingOrder, ForkType, OwnerType, SortDirection } from "@Utils/Constants";

export interface DataLayerOutput {
    forks: ForkInfo[],
    commits: CommitInfo[],
}


export interface  ForkInfo {
    id: number;
    name: string;
    owner: { login: string };
    description: string | null;
    created_at: Date | null;
    last_pushed: Date | null;
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

export interface CommitInfo {
    sha: string;
    id: string;
    parentIds: string[];
    node_id: string;
    author: string;
    date: string;
    url: string;
    message: string;
    mergedNodes: unknown[];
    repo: string;
    commit_type?: string;
    branch_name?: string;
    branch_id?: string;
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




