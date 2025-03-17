import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { useFilteredData } from "@Hooks/useFilteredData";
import { useFetchForks, useFetchCommitsBatch } from "@Queries/queries";
import { ForkFilterService } from "@Filters/ForkFilterService.ts";
import { ForkInfo, CommitInfo } from "@Types/GithubTypes";

// Mock useFetchForks and useFetchCommitsBatch
vi.mock("@Queries/queries", () => ({
    useFetchForks: vi.fn(),
    useFetchCommitsBatch: vi.fn(),
}));

// Sample test data
const mockForks: ForkInfo[] = [
    {
        id: 1,
        name: "repo-1",
        owner: { login: "user1" },
        description: "Test repo",
        created_at: "2023-01-01T00:00:00Z",
        last_pushed: "2023-02-01T00:00:00Z",
    },
];

const mockCommits: CommitInfo[] = [
    {
        sha: "abc123",
        id: "node1",
        parentIds: ["parent1"],
        node_id: "node1",
        author: "user1",
        date: "2023-03-01T00:00:00Z",
        url: "https://github.com/user1/repo-1/commit/abc123",
        message: "Initial commit",
        mergedNodes: [],
        repo: "repo-1",
        commit_type: "feature",
        branch_name: "main",
        branch_id: "branch1",
    },
];

describe("useFilteredData Hook", () => {
    it("should initialize with empty data and loading state", () => {
        (useFetchForks as Mock).mockReturnValue({ data: [], isLoading: true, error: null });
        (useFetchCommitsBatch as Mock).mockReturnValue({ data: [], isLoading: false, error: null });

        const { result } = renderHook(() => useFilteredData(new ForkFilterService()));

        expect(result.current.filteredData).toEqual([]);
        expect(result.current.isLoading).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it("should fetch forks and filter them correctly", async () => {
        (useFetchForks as Mock).mockReturnValue({ data: mockForks, isLoading: false, error: null });
        (useFetchCommitsBatch as Mock).mockReturnValue({ data: mockCommits, isLoading: false, error: null });

        const { result } = renderHook(() => useFilteredData(new ForkFilterService()));

        await waitFor(() => expect(result.current.filteredData).toEqual(mockForks));

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("should set fork query state and trigger refetch", async () => {
        (useFetchForks as Mock).mockReturnValue({ data: mockForks, isLoading: false, error: null });

        const { result } = renderHook(() => useFilteredData(new ForkFilterService()));

        act(() => {
            result.current.setForkQueryState({
                owner: "user1",
                repo: "repo-1",
                range: { start: "2023-01-01", end: "2023-12-31" },
                sort: "newest",
            });
        });

        await waitFor(() => expect(useFetchForks).toHaveBeenCalledWith({
            owner: "user1",
            repo: "repo-1",
            range: { start: "2023-01-01", end: "2023-12-31" },
            sort: "newest",
        }));
    });

    it("should fetch commits after filtering forks", async () => {
        (useFetchForks as Mock).mockReturnValue({ data: mockForks, isLoading: false, error: null });
        (useFetchCommitsBatch as Mock).mockReturnValue({ data: mockCommits, isLoading: false, error: null });

        const { result } = renderHook(() => useFilteredData(new ForkFilterService()));

        await waitFor(() =>
            expect(result.current.resultCommits).toEqual({ data: mockCommits, isLoading: false, error: null }));
    });
});

