import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { useFilteredData } from "@Hooks/useFilteredData";
import { useFetchForks, useFetchCommitsBatch } from "@Queries/queries";
import { UnprocessedCommitExtended, UnprocessedRepository } from "@Types/LogicLayerTypes";
import { act } from "react";
import { toCommitInfo, toForkInfo } from "@Utils/DataToLogic";

// Mock useFetchForks and useFetchCommitsBatch
vi.mock("@Queries/queries", () => ({
    useFetchForks: vi.fn(),
    useFetchCommitsBatch: vi.fn()
}));

vi.mock("@Utils/DataToLogic", () => ({
    toForkInfo: vi.fn(),
    toCommitInfo: vi.fn()
}));

// Sample test data
const mockForks: UnprocessedRepository[] = [
    {
        id: 1,
        name: "repo-1",
        owner: { login: "user1" },
        description: "Test repo",
        created_at: new Date(),
        last_pushed: new Date(),
        ownerType: "User",
        defaultBranch: "main",
    },
];

const mockCommits: UnprocessedCommitExtended[] = [
    {
        sha: "abc123",
        id: "node1",
        parentIds: ["parent1"],
        node_id: "node1",
        author: "user1",
        date: new Date("2023-03-01T00::00Z"),
        url: "https://github.com/user1/repo-1/commit/abc123",
        message: "Initial commit",
        branch: "main",
        repo: "repo-1",
    },
];

describe("useFilteredData Hook", () => {
    it("should initialize with empty data and loading state", () => {
        (useFetchForks as Mock).mockReturnValue({ data: [], isLoading: true, error: null });
        (useFetchCommitsBatch as Mock).mockReturnValue([{ data: [], isLoading: false, error: null }]);

        const { result } = renderHook(() => useFilteredData());

        expect(result.current.forks).toEqual([]);
        expect(result.current.isLoadingFork).toBe(true);
        expect(result.current.forkError).toBeNull();
    });

    it("should fetch forks and filter them correctly", async () => {
        (useFetchForks as Mock).mockReturnValue({ data: {data: mockForks}, isLoading: false, error: null });
        (useFetchCommitsBatch as Mock).mockReturnValue([{ data: {data: mockCommits}, isLoading: false, error: null }]);
        (toForkInfo as Mock).mockReturnValue(mockForks[0]);
        (toCommitInfo as Mock).mockReturnValue(mockCommits[0]);

        const { result } = renderHook(() => useFilteredData());
        act(() => {
            result.current.onFiltersChange(
                { dateRange: { start: new Date("1999-01-01"), end: new Date() },
                    forkTypes: ["adaptive"], ownerTypes: ["User"] },
                { owner: "user1", repo: "repo-1", forksCount: 1,
                    range: { start: new Date("1999-01-01"), end: new Date() }, sort: "watchers", direction: "asc" }
            );
        });

        await waitFor(() => expect(result.current.forks).toEqual(mockForks));

        expect(result.current.isLoadingFork).toBe(false);
        expect(result.current.forkError).toBeNull();
    });

    // it("should fetch commits after filtering forks", async () => {
    //     (useFetchForks as Mock).mockReturnValue({ data: mockForks, isLoading: false, error: null });
    //     (useFetchCommitsBatch as Mock).mockReturnValue({ data: mockCommits, isLoading: false, error: null });

    //     const { result } = renderHook(() => useFilteredData(new ForkFilterService()));

    //     await waitFor(() =>
    //         expect(result.current.commitData).toEqual(mockCommits));
    // });
});

