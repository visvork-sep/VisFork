/**
 * Interface of the data format used by the commit table for a single row.
 */
export interface CommitTableDetails {
    id: string; // could be just sha again, just necessary to exist for primer
    repo: string; // repo name
    sha: string; // hash code
    author: string; // author name
    login: string; // username
    date: string;
    message: string;
}

/**
 * Interface of the data format used by the commit table.
 */
export interface CommitTableData {
    commitData: CommitTableDetails[];
}
