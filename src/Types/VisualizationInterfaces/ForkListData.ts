/**
 * Interface of the data format used by the fork list for a single row.
 */
export interface ForkListDetails {
    id: number,
    name: string,
    description: string | null 
}

/**
 * Interface of the data format used by the fork list.
 */
export interface ForkListData {
    forkData: ForkListDetails[]
}
