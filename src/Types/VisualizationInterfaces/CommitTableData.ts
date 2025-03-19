/**
 * Interface of the data format used by the commit table for a single row.
 */
export interface CommitTableDetails {
    id: string, // hash code
    repo: string, // repo name
    author: string, // author name
    login: string, // username
    date: string,
    message: string
}

/**
 * Interface of the data format used by the commit table.
 */
export interface CommitTableData {
    commitData: CommitTableDetails[]
}
