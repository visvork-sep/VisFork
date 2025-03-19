import { useState, useMemo } from "react";
import { ForkQueryState } from "@Types/DataLayerTypes";
import { ForkFilter } from "@Types/ForkFilter";
import { useFetchCommitsBatch, useFetchForks } from "@Queries/queries";
import { ForkFilterService } from "@Filters/ForkFilterService";

export type FilterChangeHandler = (filters: ForkFilter) => void;

export function useFilteredData(filterService : ForkFilterService) {
    // Create the state for the query parameters
    const [forkQueryState, setForkQueryState] = useState<ForkQueryState | undefined>(undefined);

    // State for additional filtering, such as sorting and date range.
    const [filters, setFilters] = useState<ForkFilter | undefined>(undefined);

    const onFiltersChange: FilterChangeHandler = (filters) => {
        setFilters(filters);
    };

    // Fetch forks data using the constructed query parameters.
    const {data, isLoading: isLoadingFork, error: forkError} = useFetchForks(forkQueryState);

    // Memoized filtering: Applies filters only when data or filters change.
    const filteredForks = useMemo(() => {
        return filterService.filterForks(data, filters);
    }, [data, filters]);


    // TODO: Fix pagination
    const {data: commitData,
        isLoading: isLoadingCommit,
        error: errorCommit
    } = useFetchCommitsBatch(filteredForks, forkQueryState?.range);
    console.log("commits", commitData);
    return {
        filteredForks,
        isLoadingFork,
        forkError,
        setForkQueryState,
        onFiltersChange,
        commitData,
        isLoadingCommit,
        errorCommit
    };
}



