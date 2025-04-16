/**
 * Interface of the data format for the collaboration network graph per commit.
 */
export interface CollabGraphDetails {
    author: string,
    login: string,
    repo: string,
    date: string
}

/**
 * Interface of the data format used by the collaboration network graph.
 */
export interface CollabGraphData {
    commitData: CollabGraphDetails[]
}
