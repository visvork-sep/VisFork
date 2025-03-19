export interface DataLayerOutput {
    forks: ForkInfo[],
    commits: CommitInfo[],
}


export interface  ForkInfo {
    id: number;
    name: string;
    owner: { login: string };
    description: string | null;
    created_at: string | null | undefined;
    last_pushed: string | null | undefined;
}

export interface DateRange {
    start?: string;
    end?: string
};

export interface ForkQueryState {
    owner: string;
    repo: string;
    range: DateRange
    sort?: "newest" | "oldest" | "stargazers" | "watchers";
}

export interface CommitInfo {
    sha: string;
    id: string;
    parentIds: string[];
    node_id: string;
    author: string;
    login: string;
    date: string;
    url: string;
    message: string;
    mergedNodes: unknown[];
    repo: string;
    commit_type?: string;
    branch?: string;
    branch_id?: string;
}
