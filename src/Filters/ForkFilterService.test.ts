import { describe, expect, it, beforeEach } from "vitest";
import { ForkFilterService } from "./ForkFilterService";
import { Fork } from "../Types/GithubTypes";
import { DateRange, ForkFilter } from "../Types/ForkFilter";
import { getRandomFork } from "@Utils/ForkGenerator";

const ffs: ForkFilterService = new ForkFilterService();

const example_fork: Fork = getRandomFork(["stargazers_count", "watchers_count", "created_at", "updated_at"]);

const example_filter: ForkFilter = {
    dateRange: {start: undefined, end: undefined }
}

let fork: any = null;
let filter: any = null;

describe("Errors", () => {
    describe("ForkFilterService#apply basic errors", () => {
        beforeEach(() => {
            fork = null;
            filter = null;
        });

        it("should throw an error when param fork is null", () => {
            fork = null;
            filter = example_filter;
            expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
        });

        it("should throw an error when param fork is undefined", () => {
            fork = undefined;
            filter = example_filter;
            expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
        });

        it("should throw an error when param filter is null", () => {
            fork = example_fork;
            filter = null;
            expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
        });

        it("should throw an error when param filter is undefined", () => {
            fork = example_fork;
            filter = undefined;
            expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
        });
    });

    /** Each group within tests errors that a private method used by
     *  {@link ForkFilterService#apply} might throw (wherever applicable).
     */
    describe("ForkFilterService#apply nested errors", () => {
        beforeEach(() => {
            fork = example_fork;
            filter = example_filter;
        });

        describe("isForkInDateRange errors", () => {
            it("should throw an error when fork.created_at is undefined ", () => {
                fork.created_at = undefined;
                expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
            });

            it("should throw an error when fork.created_at is null ", () => {
                fork.created_at = null;
                expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
            });

            it("should throw an error when both dateRange.start and dateRange.end are undefined", () => {
                filter.dateRange.start = undefined;
                filter.dateRange.end = undefined;
                expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
            });

            it("should throw an error when BOTH dateRange.start and dateRange.end are not of type Date", () => {
                filter.dateRange.start = "9999-01-01T19:01:12Z";
                filter.dateRange.end = "1970-01-01T19:01:12Z";
                expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
            });
        });
    });
});

describe("Regular functionality", () => {
    beforeEach(() => {
        fork = structuredClone(example_fork); // makes sure it completely wipes any changes made during individual tests before each new test
        fork.created_at = "2011-01-26T19:01:12Z";
        filter = structuredClone(example_filter);
        // the base is that we include all forks based on date:
        filter.dateRange.start = new Date("1970-01-01T19:01:12Z");
    });

    describe("Date range", () => {
        it("should return null - only start date", () => {
            // a date most likely way after the creation of any fork
            filter.dateRange.start = new Date("9999-01-01T19:01:12Z");
            filter.dateRange.end = undefined;
            expect(ffs.apply(fork, filter)).toBe(null);
        });

        it("should return the same fork - only start date", () => {
            // a date definitely way before the creation of any fork
            // warning: don't set it to be lower than 1970.01.01
            filter.dateRange.start = new Date("1970-01-01T19:01:12Z");
            filter.dateRange.end = undefined;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    
        it("should return null - only end date", () => {
            // a date most likely way before the creation of any fork
            // warning: don't set it to be lower than 1970.01.01
            filter.dateRange.start = undefined;
            filter.dateRange.end = new Date("1970-01-01T19:01:12Z");
            expect(ffs.apply(fork, filter)).toBe(null);
        });

        it("should return the same fork - only end date", () => {
            // a date most likely way after the creation of any fork
            filter.dateRange.start = undefined;
            filter.dateRange.end = new Date("9999-01-01T19:01:12Z");
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    
        it("should return null - both dates", () => {
            filter.dateRange.start = new Date("9777-01-01T19:01:12Z");
            filter.dateRange.end = new Date("9999-01-01T19:01:12Z");
            expect(ffs.apply(fork, filter)).toBe(null);
        });

        it("should return the same fork - both dates", () => {
            filter.dateRange.start = new Date("1970-01-01T19:01:12Z");
            filter.dateRange.end = new Date("9999-01-01T19:01:12Z");
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    });

    describe("Fork activity", () => {
        it("should return the same fork - undefined activeForksOnly param even though fork is inactive", () => {
            filter.activeForksOnly = undefined;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return the same fork - null activeForksOnly param even though fork is inactive", () => {
            filter.activeForksOnly = null;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    
        it("should return the same fork - activeForksOnly param set to true and fork is active", () => {
            fork.updated_at = new Date().toISOString();
            filter.activeForksOnly = true;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return null - activeForksOnly param set to true and fork is inactive", () => {
            filter.activeForksOnly = true;
            expect(ffs.apply(fork, filter)).toBe(null);
        });

        it("should return the same fork - activeForksOnly param set to false even though fork is inactive", () => {
            filter.activeForksOnly = false;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    });

    // describe("Fork type", () => {
    //     /* TODO */
    // });

    describe("Owner type", () => {
        it("should return the same fork - ownerType is undefined", () => {
            filter.ownerType = undefined;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return the same fork - ownerType is null", () => {
            filter.ownerType = null;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return the same fork - ownerType matches (case insensitive)", () => {
            filter.ownerType = "user";
            fork.owner.type = "User";
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return the same fork - ownerType matches (case insensitive)", () => {
            filter.ownerType = "organization";
            fork.owner.type = "oRgAnIzATiOn";
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return null - ownerType does not match", () => {
            filter.ownerType = "user";
            fork.owner.type = "organization";
            expect(ffs.apply(fork, filter)).toBe(null);
        });
    });

    describe("Updated in last n months", () => {
        it("should return the same fork - nrOfMonths is undefined", () => {
            filter.updatedInLastMonths = undefined;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return the same fork - nrOfMonths is null", () => {
            filter.updatedInLastMonths = null;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return null - fork last update was NOT within last n months", () => {
            filter.updatedInLastMonths = 1; // 20 years
            expect(ffs.apply(fork, filter)).toBe(null);
        });

        it("should return the same fork - fork last update was within last n months", () => {
            filter.updatedInLastMonths = 240; // 20 years
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    });
});
