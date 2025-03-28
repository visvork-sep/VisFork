import { describe, it, expect, beforeAll } from "vitest";
import { processCommits } from "./BranchingInference.ts";
import { UnprocessedCommitExtended } from "@Types/LogicLayerTypes";
import rawMockCommits from "./MockCommits.json";

const mockCommits: UnprocessedCommitExtended[] = rawMockCommits.map(commit => ({
    ...commit,
    date: new Date(commit.date)
}));

const defaultBranches: Record<string, string> = {
    "my/repo": "main",
    "notme/diffrepo": "main2",
};

const mainRepo = "my/repo";

let processedCommits: UnprocessedCommitExtended[];

beforeAll(() => {
    processedCommits = processCommits(mockCommits, defaultBranches, mainRepo);
});

describe("processCommits", () => {

    it("should return an array of equal or smaller length than rawCommits", () => {
        expect(processedCommits.length).toBeLessThanOrEqual(mockCommits.length);
    });

    it("should return an array of items that are all already in the original one", () => {
        expect(processedCommits.every(commit => mockCommits.some(original => original.sha === commit.sha))).toBe(true);
    });

    it("should return an array with unique hashes", () => {
        const uniqueShas = new Set(processedCommits.map(commit => commit.sha));
        expect(uniqueShas.size).toBe(processedCommits.length);
    });

    it("should not delete any existing commits", () => {
        const processedShas = new Set(processedCommits.map(commit => commit.sha));
        for (const mockCommit of mockCommits) {
            expect(processedShas.has(mockCommit.sha)).toBe(true);
        }
    });

    it("should not contain any parentIds that do not exist", () => {
        const processedParentIds = new Set(processedCommits.flatMap(commit => commit.parentIds));
        const processedShas = new Set(processedCommits.map(commit => commit.sha));
        for (const parentId of processedParentIds) {
            expect(processedShas.has(parentId)).toBe(true);
        }
    });

    it("should infer branch with regex", () => {
        const diffMockCommits: UnprocessedCommitExtended[] = [
            {
                sha: "1",
                id: "1",
                parentIds: [],
                node_id: "1",
                author: "my",
                date: new Date("2025-02-26T00:00:00Z"),
                url: "",
                message: "1",
                branch: "main",
                repo: "my/repo",
            },
            {
                sha: "2",
                id: "2",
                parentIds: ["1"],
                node_id: "2",
                author: "my",
                date: new Date("2025-02-26T00:00:10Z"),
                url: "",
                message: "2",
                branch: "main",
                repo: "my/repo",
            },
            {
                sha: "3",
                id: "3",
                parentIds: ["1", "2"],
                node_id: "3",
                author: "my",
                date: new Date("2025-02-26T00:00:20Z"),
                url: "",
                message: "merge branch 'test' into main",
                branch: "main",
                repo: "my/repo",
            },
            {
                sha: "2",
                id: "2",
                parentIds: ["1"],
                node_id: "2",
                author: "my",
                date: new Date("2025-02-26T00:00:10Z"),
                url: "",
                message: "2",
                branch: "test",
                repo: "notme/diffrepo",
            },
            {
                sha: "4",
                id: "4",
                parentIds: ["2"],
                node_id: "4",
                author: "my",
                date: new Date("2025-02-26T00:00:30Z"),
                url: "",
                message: "4",
                branch: "test",
                repo: "notme/diffrepo",
            },
        ];
        expect(processCommits(diffMockCommits, defaultBranches, mainRepo)
            .find((commit) => commit.sha === "2")?.branch === "test").toBe(true);
    });

});
