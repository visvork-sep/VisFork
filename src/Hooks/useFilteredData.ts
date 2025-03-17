import { useState, useMemo } from "react";
import { ForkQueryState } from "@Types/Fork";
import { ForkFilter } from "@Types/ForkFilter";
import { useFetchCommitsBatch, useFetchForks } from "@Queries/queries";
import { ForkFilterService } from "@Filters/ForkFilterService";

export function useFilteredData(filterService : ForkFilterService) {
    // Create the state for the query parameters
    const [forkQueryState, setForkQueryState] = useState<ForkQueryState | undefined>(undefined);

    // State for additional filtering, such as sorting and date range.
    const [filters, setFilters] = useState<ForkFilter | undefined>(undefined);

    // Fetch forks data using the constructed query parameters.
    const {data, isLoading, error} = useFetchForks(forkQueryState);

    // Memoized filtering: Applies filters only when data or filters change.
    const filteredData = useMemo(() => {
        return filterService.filterForks(data, filters);
    }, [data, filters]);


    // TODO: Fix pagination
    const resultCommits = useFetchCommitsBatch(filteredData, forkQueryState?.range);

    return { filteredData, isLoading, error, setForkQueryState, setFilters, resultCommits };
}



