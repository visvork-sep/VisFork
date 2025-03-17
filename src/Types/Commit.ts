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
