/**
 * Interface of the data format used by the sankey diagram per commit.
 */
interface SankeyDetails {
    repo: string,
    commitType: string,
}

/**
 * Interface of the data format used by the sankey diagram.
 */
export interface SankeyData {
    commitData: SankeyDetails[]
}
