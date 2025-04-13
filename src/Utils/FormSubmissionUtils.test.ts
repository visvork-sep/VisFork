import { describe, it, expect } from "vitest";
import { filterFactory, forkQueryStateFactory } from "./FormSubmissionUtils.ts";
import { preparedFormComplete } from "@Types/UIFormTypes.ts";

describe("Factory functions", () => {
    const baseForm = {
        owner: "user123",
        repositoryName: "repo456",
        forksCount: 42,
        commitsDateRangeFrom: new Date("2022-01-01"),
        commitsDateRangeUntil: new Date("2022-12-31"),
        forksOrder: "stargazers",
        forksSortDirection: "desc",
        ownerTypeFilter: ["User"],
        commitsTypeFilter: ["authored"],
    };

    it("Creates correct filter object without recentlyUpdated", () => {
        const result = filterFactory(baseForm as preparedFormComplete);
        expect(result.ownerTypes).toEqual(["User"]);
        expect(result.commitTypes).toEqual(["authored"]);
        expect(result.updatedInLastMonths).toBeUndefined();
    });

    it("Creates correct filter object with recentlyUpdated", () => {
        const formWithUpdate = {
            ...baseForm,
            recentlyUpdated: 6
        };

        const result = filterFactory(formWithUpdate as preparedFormComplete);
        expect(result.updatedInLastMonths).toBe(6);
    });

    it("Creates correct fork query state", () => {
        const result = forkQueryStateFactory(baseForm as preparedFormComplete);

        expect(result.owner).toBe("user123");
        expect(result.repo).toBe("repo456");
        expect(result.forksCount).toBe(42);
        expect(result.range.start).toStrictEqual(new Date("2022-01-01"));
        expect(result.range.end).toStrictEqual(new Date("2022-12-31"));
        expect(result.sort).toBe("stargazers");
        expect(result.direction).toBe("desc");
    });
});
