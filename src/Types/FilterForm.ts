/**
 * Interface for Form state, for selecting the data to be visualized.
 */
interface FilterFormState {
    repository: string;
    forksCount?: number;
    forksOrder: string;
    forksAscDesc: string;
    commitsDateRangeFrom: string;
    commitsDateRangeUntil: string;
    forksTypeFilter: string[];
    ownerTypeFilter: string[];
    recentlyUpdated?: number;
};

export type { FilterFormState };
