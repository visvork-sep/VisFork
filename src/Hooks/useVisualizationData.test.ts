import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVisualizationData } from "./useVisualizationData"; // update path if needed
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
        name: "repo1", defaultBranch: "main",
        description: "",
        created_at: new Date("2016-01-01"),
        last_pushed: new Date("2023-01-02"),
        id: 0,
        owner: {
            login: ""
        },
        ownerType: "User"
    },
];

describe("useVisualizationData", () => {
    let mockCommits: Commit[];
    let mockRepos: Repository[];

    beforeEach(() => {
        mockCommits = createMockCommits();
        mockRepos = createMockRepos();
    });

    it("initializes visualization data correctly", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, mockCommits));
        const { visData, defaultBranches } = result.current;

        expect(visData.histogramData.commitData.length).toBe(2);
        expect(visData.timelineData.commitData[0].id).toBe("a1");
        expect(visData.commitTableData.commitData[1].author).toBe("Bob");
        expect(defaultBranches["repo1"]).toBe("main");
    });

    it("filters commits by date in handleHistogramSelection", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, mockCommits));

        act(() => {
            result.current.handlers.handleHistogramSelection(new Date("2023-01-02"), new Date("2023-01-02"));
        });

        expect(result.current.visData.timelineData.commitData).toHaveLength(1);
        expect(result.current.visData.timelineData.commitData[0].id).toBe("b2");
    });

    it("filters commits by SHA in handleTimelineSelection", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, mockCommits));

        act(() => {
            result.current.handlers.handleTimelineSelection(["b2"]);
        });

        expect(result.current.visData.commitTableData.commitData).toHaveLength(1);
        expect(result.current.visData.commitTableData.commitData[0].id).toBe("b2");
    });

    it("filters commits by SHA in handleSearchBarSubmission", () => {
        const { result } = renderHook(() => useVisualizationData(mockRepos, mockCommits));

        act(() => {
            result.current.handlers.handleSearchBarSubmission(["a1"]);
        });

        expect(result.current.visData.wordCloudData.commitData).toEqual(["Initial commit"]);
    });
});
