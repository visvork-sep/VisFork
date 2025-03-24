import { useState } from "react";
import { ForkFilter, ForkQueryState } from "@Types/LogicLayerTypes";
import { useFetchCommitsBatch, useFetchForks } from "@Queries/queries";
import { isValidForkByFilter } from "@Utils/Filters/ForkFilterUtil";

export type FilterChangeHandler = (filters: ForkFilter, forkQueryState: ForkQueryState) => void;

export function useFilteredData() {
    // Create the state for the query parameters
    const [forkQueryState, setForkQueryState] = useState<ForkQueryState | undefined>(undefined);

    // State for additional filtering, such as sorting and date range.
    const [filters, setFilters] = useState<ForkFilter | undefined>(undefined);

    const onRequestChange: FilterChangeHandler = (filters, forkQueryState) => {
        setForkQueryState(forkQueryState);
        setFilters(filters);
    };

    // Fetch forks data using the constructed query parameters.
    const {data, isLoading: isLoadingFork, error: forkError} = useFetchForks(forkQueryState);
    
    const filteredForks = (data && filters) 
        ?
        data.filter(fork => isValidForkByFilter(fork, filters))
        :
        [];
    


    // TODO: Fix pagination
    const {data: commitData,
        isLoading: isLoadingCommit,
        error: errorCommit
    } = useFetchCommitsBatch(filteredForks, forkQueryState);

    return {
        filteredForks,
        isLoadingFork,
        forkError,
        onFiltersChange: onRequestChange,
        commitData,
        isLoadingCommit,
        errorCommit
    };
}



