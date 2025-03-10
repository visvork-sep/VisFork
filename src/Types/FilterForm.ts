/**
 * Interface for Form state, for selecting the data to be visualized.
 */
interface FilterFormState {
    repositoryOwner: string;
    repositoryName: string;
    forksCount: number;
    forksOrder: string;
    forksAscDesc: string;
    commitsDateRangeFrom?: string;
    commitsDateRangeUntil?: string;
    forksTypeFilter: string[];
    ownerTypeFilter: string[];
    recentlyUpdated?: string;
};

export type { FilterFormState };
