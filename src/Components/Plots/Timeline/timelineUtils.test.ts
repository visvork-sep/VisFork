import { describe, it, expect} from "vitest";
import type { GraphNode } from "d3-dag";

import {
    dateRankOperator,
    groupBy,
    groupNodes,
    // topologicalSort is not exported, so we test it indirectly via groupNodes
} from "./timelineUtils";

import { TimelineDetails } from "@VisInterfaces/TimelineData";

describe("dateRankOperator", () => {
    it("should convert a node's date to a timestamp", () => {
        const dateStr = "2021-05-15T12:00:00Z";
        const dummyNode = {
            data: { date: dateStr }
        } as GraphNode<TimelineDetails, unknown>;
        const timestamp = dateRankOperator(dummyNode);
        expect(timestamp).toBe(new Date(dateStr).getTime());
    });
});

// helper, used either on nodes or commit objects to group them by repo
describe("groupBy()", () => {
    it("should group items by the provided key function", () => {
        const items = [
            { val: 1, type: "a" },
            { val: 2, type: "b" },
            { val: 3, type: "a" },
        ];
        const result = groupBy(items, (item) => item.type);
        // expect 2 items for key "a" and 1 for "b"
        expect(result.get("a")?.length).toBe(2);
        expect(result.get("b")?.length).toBe(1);
    });

    it("should handle an empty array", () => {
        const result = groupBy([], (item) => item);
        expect(result.size).toBe(0);
    });
});

describe("groupNodes()", () => {
    it("should group commits into one grouped node when there are no forks or merges", () => {
        const commits = [
            { id: "1", parentIds: [], repo: "A", branch: "main", date: "2021-01-01", url: "url1" },
            { id: "2", parentIds: ["1"], repo: "A", branch: "main", date: "2021-01-02", url: "url2" },
            { id: "3", parentIds: ["2"], repo: "A", branch: "main", date: "2021-01-03", url: "url3" },
        ];
        const groups = groupNodes(commits);
        // expect one group covering all commits.
        expect(groups.length).toBe(1);
        expect(groups[0].nodes).toEqual(["1", "2", "3"]);
        expect(groups[0].repo).toBe("A");
        expect(groups[0].date).toBe("2021-01-01");
        expect(groups[0].end_date).toBe("2021-01-03");
        // for default grouping, branch should be "default" and url empty.
        expect(groups[0].branch).toBe("default");
        expect(groups[0].url).toBe("");
    });

    it("should create separate groups for fork and merge commits", () => {
        const commits = [
            { id: "1", parentIds: [], repo: "A", branch: "main", date: "2021-01-01", url: "url1" },
            { id: "2", parentIds: ["1"], repo: "A", branch: "main", date: "2021-01-02", url: "url2" },
            { id: "3", parentIds: ["2"], repo: "B", branch: "main", date: "2021-01-03", url: "url3" },
            { id: "4", parentIds: ["3", "2"], repo: "B", branch: "main", date: "2021-01-04", url: "url4" },
        ];
        const groups = groupNodes(commits);
        // expect more than one group because of the fork and merge events.
        expect(groups.length).toBeGreaterThan(1);
        // find at least one grouped node with branch type "merge" or "forkParent"
        const specialGroup = groups.find(
            (group) => group.branch === "merge" || group.branch === "forkParent"
        );
        expect(specialGroup).toBeDefined();

        // verify that all commit ids appear in one of the groups.
        const allCommitIds = groups.flatMap((group) => group.nodes);
        expect(allCommitIds.sort()).toEqual(["1", "2", "3", "4"].sort());

        // check that special groups have parentIds assigned.
        if (specialGroup) {
            expect(specialGroup.parentIds.length).toBeGreaterThan(0);
        }
    });
});
