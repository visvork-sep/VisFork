import { describe, expect, it, beforeEach } from "vitest";
import { ForkFilter, UnprocessedRepository } from "../../Types/LogicLayerTypes";
import { isValidForkByFilter } from "./ForkFilterUtil";


const example_fork: UnprocessedRepository = {
    id: 1,
    name: "a fork",
    owner: { login: "a user" },
    description: "a fork of a user",
    created_at: new Date("2022-09-14T06:51:16Z"),
    last_pushed: new Date(), // today
    ownerType: "User",
    defaultBranch: "main"
};

const example_filter: ForkFilter = {
    dateRange: {
        start: new Date("2022-09-14T06:51:16Z"),
        end: new Date("2022-09-14T06:51:16Z")
    },
    commitTypes: ["adaptive"],
    ownerTypes: ["User", "Organization"]
};

let fork: UnprocessedRepository = null as unknown as UnprocessedRepository;
let filter: ForkFilter = null as unknown as ForkFilter;

describe("Regular functionality", () => {
    beforeEach(() => {
        /* structuredClone() the original state of the example instances
         * are kept for a fresh start before every test */
        fork = structuredClone(example_fork); 
        filter = structuredClone(example_filter);
        // if (fork.created_at != null) {
        //     fork.created_at = new Date(fork.created_at.toString());
        // }
        // the base is that we include all forks based on date:
        filter.dateRange.start = new Date("1970-01-01T19:01:12Z");
    });

    describe("Fork activity", () => {
        it("should return an array containing the same fork(s) - " +
            "undefined activeForksOnly param even though fork is inactive", () => {
            filter.activeForksOnly = undefined;
            expect(
                [fork].filter((fork => isValidForkByFilter(fork, filter)))
            ).toStrictEqual([fork]);
        });
    
        it("should return an array containing the same fork(s) - " + 
            "activeForksOnly param set to true and fork is active", () => {
            filter.activeForksOnly = true;
            expect(
                [fork].filter((fork => isValidForkByFilter(fork, filter)))
            ).toStrictEqual([fork]);
        });

        it("should return empty array - activeForksOnly param set to true and fork is inactive", () => {
            filter.activeForksOnly = true;
            fork.last_pushed = new Date("2022-09-14T06:51:16Z");
            expect(
                [fork].filter((fork => isValidForkByFilter(fork, filter)))
            ).toStrictEqual([]);
        });

        it("should return an array containing the same fork(s) - " +
            "activeForksOnly param set to false even though fork is inactive", () => {
            filter.activeForksOnly = false;
            expect(
                [fork].filter((fork => isValidForkByFilter(fork, filter)))
            ).toStrictEqual([fork]);
        });
    });

    describe("Owner type", () => {
        it("should return an array containing the same fork(s) - ownerType is valid", () => {
            filter.ownerTypes = ["User"];
            fork.ownerType = "User";
            expect(
                [fork].filter((fork => isValidForkByFilter(fork, filter)))
            ).toStrictEqual([fork]);
        });

        it("should return an array containing no forks - ownerType is not valid", () => {
            filter.ownerTypes = ["User"];
            fork.ownerType = "Organization";
            expect(
                [fork].filter((fork => isValidForkByFilter(fork, filter)))
            ).toStrictEqual([]);
        });
    });

    describe("Updated in last n months", () => {
        it("should return an array containing the same fork(s) - nrOfMonths is undefined", () => {
            filter.updatedInLastMonths = undefined;
            expect(
                [fork].filter((fork => isValidForkByFilter(fork, filter)))
            ).toStrictEqual([fork]);
        });

        it("should return empty array - fork last update was NOT within last n months", () => {
            filter.updatedInLastMonths = 1; // 20 years
            fork.last_pushed = new Date("2022-09-14T06:51:16Z");
            expect(
                [fork].filter((fork => isValidForkByFilter(fork, filter)))
            ).toStrictEqual([]);
        });

        it("should return an array containing the same fork(s) - fork last update was within last n months", () => {
            filter.updatedInLastMonths = 240; // 20 years
            console.log(`last pushed ${fork.last_pushed}`);
            expect(
                [fork].filter((fork => isValidForkByFilter(fork, filter)))
            ).toStrictEqual([fork]);
        });
    });
});
