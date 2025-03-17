/**
 * Interface of the data format used by the fork list for a single row.
 */
interface ForkListDetails {
    id: number,
    forkName: string,
    description: string | null 
}

/**
 * Interface of the data format used by the fork list.
 */
export interface ForkListData {
    forkData: ForkListDetails[]
}
