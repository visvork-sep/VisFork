export interface Repository {
    repo: string;
    sha: string;
    id: string;
    parentIds: string[];
    branch_name: string;
    branch_id: string;
    node_id: string;
    author: string;
    date: string;
    url: string;
    message: string;
    commit_type: string;
    mergedNodes: string[];
}
