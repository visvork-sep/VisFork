import { describe, expect, it, beforeEach } from "vitest";
import { Fork } from "../Types/GithubTypes";
import { getRandomForks } from "@Utils/ForkGenerator";
import { ForkSortService } from "./ForkSortService";
import { SortingCriterionExtra } from "../Types/ForkSorter";

const fss: ForkSortService = new ForkSortService();

const defaultForks: Fork[] = getRandomForks(3, ["stargazers_count", "watchers_count", "created_at", "updated_at"]);

let forks: Fork[] = [];
let sortingCriteria: SortingCriterionExtra;

describe("ForkSortService errors", () => {
    beforeEach(() => {
        forks = structuredClone(defaultForks);
    });

    it("should throw an Error - invalid sorting critera", () => {
        sortingCriteria = "yo momma" as SortingCriterionExtra;
        expect(() => fss.sortForks(forks, sortingCriteria)).toThrow(Error);
    });

    it("should throw a TypeError - stargazers_count undefined", () => {
        forks[1].stargazers_count = undefined;
        sortingCriteria = "stargazers";
        expect(() => fss.sortForks(forks, sortingCriteria)).toThrow(TypeError);
    });

    it("should throw a TypeError - watchers_count undefined", () => {
        forks[1].watchers_count = undefined;
        sortingCriteria = "watchers";
        expect(() => fss.sortForks(forks, sortingCriteria)).toThrow(TypeError);
    });

    it("should throw a TypeError - created_at undefined", () => {
        forks[1].created_at = undefined;
        sortingCriteria = "oldest";
        expect(() => fss.sortForks(forks, sortingCriteria)).toThrow(TypeError);
        sortingCriteria = "newest"
        expect(() => fss.sortForks(forks, sortingCriteria)).toThrow(TypeError);
    });

    it("should throw a TypeError - updated_at undefined", () => {
        forks[1].updated_at = undefined;
        sortingCriteria = "latestCommit";
        expect(() => fss.sortForks(forks, sortingCriteria)).toThrow(TypeError);
    });

    /* TODO test author popularity error if done */
});

describe("ForkSortService regular functionality", () => {
    beforeEach(() => {
        forks = structuredClone(defaultForks);
    })

    it("should sort by stargazers (descending order)", () => {
        forks[0].stargazers_count = 4;
        forks[1].stargazers_count = 9;
        forks[2].stargazers_count = 1;
        expect(fss.sortForks(forks, "stargazers")).toStrictEqual([forks[1], forks[0], forks[2]]);
    });

    it("should sort by watchers", () => {
        forks[0].watchers_count = 22;
        forks[1].watchers_count = 30;
        forks[2].watchers_count = 2;
        expect(fss.sortForks(forks, "watchers")).toStrictEqual([forks[1], forks[0], forks[2]]);
    })

    it("should sort by oldest", () => {
        forks[0].created_at = "2025-01-26T19:01:12Z";
        forks[1].created_at = "2001-01-26T19:01:12Z";
        forks[2].created_at = "1970-01-26T19:01:12Z";
        expect(fss.sortForks(forks, "oldest")).toStrictEqual([forks[2], forks[1], forks[0]]);
    });

    it("should sort by newest", () => {
        forks[0].created_at = "2025-01-26T19:01:12Z";
        forks[1].created_at = "2001-01-26T19:01:12Z";
        forks[2].created_at = "1970-01-26T19:01:12Z";
        expect(fss.sortForks(forks, "newest")).toStrictEqual([forks[0], forks[1], forks[2]]);
    });

    it("should sort by latest commit (descending)", () => {
        forks[0].updated_at = "2025-01-26T19:01:12Z";
        forks[1].updated_at = "2001-01-26T19:01:12Z";
        forks[2].updated_at = "1970-01-26T19:01:12Z";
        expect(fss.sortForks(forks, "latestCommit")).toStrictEqual([forks[0], forks[1], forks[2]]);
    });
});