/**
 * Interface of the data format for the collaboration network graph per commit.
 */
interface CollabGraphDetails{
    author: string,
    repo: string
}

/**
 * Interface of the data format used by the collaboration network graph.
 */
export interface CollabGraphData {
    commitData: CollabGraphDetails[]
}
