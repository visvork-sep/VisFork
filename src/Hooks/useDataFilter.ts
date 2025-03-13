import { useState, useMemo } from "react";
import { ForkQueryParams} from "../Types/GithubTypes";
import { ForkFilter } from "../Types/ForkFilter";
import { useFetchCommitsBatch, useFetchForks } from "../Queries/queries";
import { ForkFilterService } from "../Filters/ForkFilterService";

export function useDataFilter() {
    const [forkQueryParams, setForkQueryParams] = useState<ForkQueryParams>( {
        path: {owner: "", repo: ""}
    });

    const {data, isLoading, error} = useFetchForks(forkQueryParams);

    const [filters, setFilters] = useState<ForkFilter>({
        sortBy: "newest",
        dateRange: {}
    });

    const filterService = new ForkFilterService();

    const filteredData = useMemo(() => {
        if (!data?.data) return [];
        return filterService.filterForks(data?.data, filters);
    }, [data?.data, filters]);

    const commitQueries = filteredData.map((fork) => {
        return {
            path: {owner: fork.owner.login, repo: fork.name},
            query: {since: filters.dateRange.start, until: filters.dateRange.end}
        };
    });

    // TODO: Fix pagination
    const resultCommits = useFetchCommitsBatch(commitQueries);

    return { filteredData, isLoading, error, setForkQueryParams, setFilters, resultCommits };

}



