/**
 * Interface of the data format used by the histogram per commit.
 */
interface HistogramDetails {
    fork: string,
    date: Date
}

/**
 * Interface of the data format used by the histogram.
 */
export interface HistogramData {
    commitData: HistogramDetails[]
}
