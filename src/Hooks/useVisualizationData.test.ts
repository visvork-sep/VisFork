import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVisualizationData } from "./useVisualizationData";
import { Commit, Repository } from "@Types/LogicLayerTypes";

const createMockCommits = (): Commit[] => [
    {
        sha: "a1",
        repo: "repo1",
        author: "Alice",
        login: "alice",
        message: "Initial commit",
        branch: "main",
        date: new Date("2023-01-01"),
        url: "https://example.com/commit/a1",
        parentIds: [],
        commitType: "adaptive",
        mergedNodes: [],
        id: "a1",
        node_id: ""
    },
    {
        sha: "b2",
        repo: "repo1",
        author: "Bob",
        login: "bob",
        message: "Add feature",
        branch: "main",
        date: new Date("2023-01-02"),
        url: "https://example.com/commit/b2",
        parentIds: ["a1"],
        commitType: "corrective",
        mergedNodes: [],
        id: "b2",
        node_id: ""
    },
];

const createMockRepos = (): Repository[] => [
    {
        name: "repo1",
        defaultBranch: "main",
        description: "",
        created_at: new Date("2016-01-01"),
        last_pushed: new Date("2023-01-02"),
        id: 0,
        owner: { login: "" },
        ownerType: "User"
    }
];

describe("useVisualizationData", () => {
    let mockCommits: Commit[];
    let mockRepos: Repository[];

    beforeEach(() => {
        mockCommits = createMockCommits();
        mockRepos = createMockRepos();
    });

    it("returns full visData and default branches initially", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, mockCommits));

        expect(result.current.visData.timelineData.commitData.length).toBe(2);
        expect(result.current.defaultBranches["repo1"]).toBe("main");
    });

    it("filters only commits in date range (handleHistogramSelection)", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, mockCommits));
    
        act(() => {
            result.current.handlers.handleHistogramSelection(new Date("2023-01-02"), new Date("2023-01-02"));
        });

        const { timelineData, sankeyData, commitTableData } = result.current.visData;

        expect(timelineData.commitData).toHaveLength(1);
        expect(timelineData.commitData[0].id).toBe("b2");
        expect(commitTableData.commitData[0].login).toBe("bob");
        expect(sankeyData.commitData[0].commitType).toBe("corrective");
    });

    it("filters parents not in date range (handleHistogramSelection)", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, mockCommits));
    
        act(() => {
            result.current.handlers.handleHistogramSelection(new Date("2023-01-02"), new Date("2023-01-02"));
        });

        const commit = result.current.visData.timelineData.commitData[0];
        expect(commit.parentIds).toEqual([]); // "a1" is out of range, so removed from parentIds
    });

    it("filters timeline by SHA (handleTimelineSelection)", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, mockCommits));

        act(() => {
            result.current.handlers.handleTimelineSelection(["b2"]);
        });

        const tableData = result.current.visData.commitTableData.commitData;
        expect(tableData).toHaveLength(1);
        expect(tableData[0].id).toBe("b2");

        const wordCloudData = result.current.visData.wordCloudData.commitData;
        expect(wordCloudData).toContain("Add feature");
    });

    it("handles empty result from SHA filtering", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, mockCommits));

        act(() => {
            result.current.handlers.handleSearchBarSubmission(["not-exist"]);
        });

        expect(result.current.visData.wordCloudData.commitData).toEqual([]);
        expect(result.current.visData.sankeyData.commitData).toEqual([]);
    });

    it("returns correct word cloud data (handleSearchBarSubmission)", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, mockCommits));

        act(() => {
            result.current.handlers.handleSearchBarSubmission(["a1", "b2"]);
        });

        expect(result.current.visData.wordCloudData.commitData).toEqual([
            "Initial commit", "Add feature"
        ]);
    });

    it("handles empty commit array gracefully", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, []));
        expect(result.current.visData.timelineData.commitData).toEqual([]);
        expect(result.current.visData.wordCloudData.commitData).toEqual([]);
    });

    it("handles empty repo array gracefully", () => {
        const { result } = renderHook(() => useVisualizationData([], mockCommits));
        expect(result.current.defaultBranches).toEqual({});
    });

    it("memoizes defaultBranches correctly", () => {
        const { result, rerender } = renderHook(
            ({ repos, commits }) => useVisualizationData(repos, commits),
            {
                initialProps: { repos: mockRepos, commits: mockCommits }
            }
        );

        const initial = result.current.defaultBranches;

        // Same reference passed again
        rerender({ repos: mockRepos, commits: [...mockCommits] });
        const after = result.current.defaultBranches;

        expect(after).toBe(initial);
    });
});
