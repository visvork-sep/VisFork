import { useState, useMemo } from "react";
import { ForkQueryParams, ForkQueryState} from "@Types/GithubTypes";
import { ForkFilter } from "@Types/ForkFilter";
import { useFetchCommitsBatch, useFetchForks } from "../Queries/queries";
import { ForkFilterService } from "../Filters/ForkFilterService";

export function useFilteredData(filterService : ForkFilterService) {
    // Create the state for the query parameters
    const [forkQueryState, setForkQueryState] = useState<ForkQueryState>({
        owner: "",
        repo: "",
        sort: "newest"
    });

    // State for additional filtering, such as sorting and date range.
    const [filters, setFilters] = useState<ForkFilter>({
        sortBy: "newest",
        dateRange: {}
    });

    // Constructing the API query parameters based on the state.
    const forkQueryParams: ForkQueryParams = {
        path: { owner: forkQueryState.owner, repo: forkQueryState.repo },
        query: forkQueryState.sort ? { sort: forkQueryState.sort } : undefined
    };

    // Fetch forks data using the constructed query parameters.
    const {data, isLoading, error} = useFetchForks(forkQueryParams);

    // Memoized filtering: Applies filters only when data or filters change.
    const filteredData = useMemo(() => {
        if (!data?.data) return [];
        return filterService.filterForks(data?.data, filters);
    }, [data?.data, filters]);

    // Construct commit queries for each filtered fork.
    const commitQueries = filteredData.map((fork) => {
        return {
            path: {owner: fork.owner.login, repo: fork.name},
            query: {since: filters.dateRange.start, until: filters.dateRange.end}
        };
    });

    // TODO: Fix pagination
    const resultCommits = useFetchCommitsBatch(commitQueries);

    return { filteredData, isLoading, error, setForkQueryState, setFilters, resultCommits };
}



