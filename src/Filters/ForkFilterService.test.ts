import { describe, expect, it, beforeEach } from "vitest";
import { ForkFilterService } from "./ForkFilterService";
import { ForkFilter } from "../Types/LogicLayerTypes";
import { ForkInfo } from "@Types/LogicLayerTypes";

const ffs: ForkFilterService = new ForkFilterService();

const example_fork: ForkInfo = {
    id: 1,
    name: "a fork",
    owner: { login: "a user" },
    description: "a fork of a user",
    created_at: new Date("2022-09-14T06:51:16Z"),
    last_pushed: new Date(), // today
    ownerType: "User"
};

const example_filter: ForkFilter = {
    dateRange: {
        start: new Date("2022-09-14T06:51:16Z"),
        end: new Date("2022-09-14T06:51:16Z")
    },
    forkTypes: undefined as unknown as ["adaptive"],
    ownerTypes: undefined as unknown as ["User", "Organization"]
};

let fork: ForkInfo = null as unknown as ForkInfo;
let filter: ForkFilter = null as unknown as ForkFilter;

describe("Errors", () => {
    describe("ForkFilterService#apply basic errors", () => {
        beforeEach(() => {
            fork = structuredClone(example_fork);
            filter = structuredClone(example_filter);
        });

        it("should throw an error when param fork is null", () => {
            fork = null as unknown as ForkInfo;
            expect(() => ffs.apply([fork], filter)).toThrow(TypeError);
        });

        it("should throw an error when param fork is undefined", () => {
            fork = undefined as unknown as ForkInfo;
            expect(() => ffs.apply([fork], filter)).toThrow(TypeError);
        });

        it("should throw an error when param filter is null", () => {
            filter = null as unknown as ForkFilter;
            expect(() => ffs.apply([fork], filter)).toThrow(TypeError);
        });

        it("should throw an error when param filter is undefined", () => {
            filter = undefined as unknown as ForkFilter;
            expect(() => ffs.apply([fork], filter)).toThrow(TypeError);
        });
    });

    /** Each group within tests errors that a private method used by
     *  {@link ForkFilterService#apply} might throw (wherever applicable).
     */
    describe("ForkFilterService#apply nested errors", () => {
        beforeEach(() => {
            fork = structuredClone(example_fork);
            filter = structuredClone(example_filter);
        });

        describe("isForkInDateRange errors", () => {
            it("should throw an error when fork.created_at is undefined ", () => {
                fork.created_at = undefined as unknown as Date;
                expect(() => ffs.apply([fork], filter)).toThrow(TypeError);
            });

            it("should throw an error when fork.created_at is null ", () => {
                fork.created_at = null;
                expect(() => ffs.apply([fork], filter)).toThrow(TypeError);
            });

            it("should throw an error when both dateRange.start and dateRange.end are undefined", () => {
                filter.dateRange.start = undefined  as unknown as Date;
                filter.dateRange.end = undefined as unknown as Date;
                expect(() => ffs.apply([fork], filter)).toThrow(TypeError);
            });

            it("should throw an error when BOTH dateRange.start and dateRange.end are not of type Date", () => {
                filter.dateRange.start = "9999-01-01T19:01:12Z" as unknown as Date;
                filter.dateRange.end = "1970-01-01T19:01:12Z" as unknown as Date;
                expect(() => ffs.apply([fork], filter)).toThrow(TypeError);
            });
        });
    });
});

describe("Regular functionality", () => {
    beforeEach(() => {
        fork = structuredClone(example_fork); // makes sure it completely wipes any changes made during individual tests before each new test
        filter = structuredClone(example_filter);
        // if (fork.created_at != null) {
        //     fork.created_at = new Date(fork.created_at.toString());
        // }
        // the base is that we include all forks based on date:
        filter.dateRange.start = new Date("1970-01-01T19:01:12Z");
    });

    describe("Date range", () => {
        it("should return empty array - only start date", () => {
            // a date most likely way after the creation of any fork
            filter.dateRange.start = new Date("9999-01-01T19:01:12Z");
            filter.dateRange.end = undefined as unknown as Date;
            expect(ffs.apply([fork], filter)).toStrictEqual([]);
        });

        it("should return an array containing the same fork(s) - only start date", () => {
            // a date definitely way before the creation of any fork
            // warning: don't set it to be lower than 1970.01.01
            filter.dateRange.start = new Date("1970-01-01T19:01:12Z");
            filter.dateRange.end = undefined as unknown as Date;
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });
    
        it("should return empty array - only end date", () => {
            // a date most likely way before the creation of any fork
            // warning: don't set it to be lower than 1970.01.01
            filter.dateRange.start = undefined as unknown as Date;
            filter.dateRange.end = new Date("1970-01-01T19:01:12Z");
            expect(ffs.apply([fork], filter)).toStrictEqual([]);
        });

        it("should return an array containing the same fork(s) - only end date", () => {
            // a date most likely way after the creation of any fork
            filter.dateRange.start = undefined as unknown as Date;
            filter.dateRange.end = new Date("9999-01-01T19:01:12Z");
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });
    
        it("should return empty array - both dates", () => {
            filter.dateRange.start = new Date("9777-01-01T19:01:12Z");
            filter.dateRange.end = new Date("9999-01-01T19:01:12Z");
            expect(ffs.apply([fork], filter)).toStrictEqual([]);
        });

        it("should return an array containing the same fork(s) - both dates", () => {
            filter.dateRange.start = new Date("1970-01-01T19:01:12Z");
            filter.dateRange.end = new Date("9999-01-01T19:01:12Z");
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });
    });

    describe("Fork activity", () => {
        it("should return an array containing the same fork(s) - undefined activeForksOnly param even though fork is inactive", () => {
            filter.activeForksOnly = undefined;
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });

        it("should return an array containing the same fork(s) - null activeForksOnly param even though fork is inactive", () => {
            filter.activeForksOnly = null as unknown as boolean;
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });
    
        it("should return an array containing the same fork(s) - activeForksOnly param set to true and fork is active", () => {
            filter.activeForksOnly = true;
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });

        it("should return empty array - activeForksOnly param set to true and fork is inactive", () => {
            filter.activeForksOnly = true;
            fork.last_pushed = new Date("2022-09-14T06:51:16Z");
            expect(ffs.apply([fork], filter)).toStrictEqual([]);
        });

        it("should return an array containing the same fork(s) - activeForksOnly param set to false even though fork is inactive", () => {
            filter.activeForksOnly = false;
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });
    });

    // describe("Fork type", () => {
    //     /* TODO */
    // });

    describe("Owner type", () => {
        it("should return an array containing the same fork(s) - ownerType is undefined", () => {
            filter.ownerTypes = undefined as unknown as ["User"];
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });

        it("should return an array containing the same fork(s) - ownerType is null", () => {
            filter.ownerTypes = null as unknown as ["User"];
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });

        // it("should return an array containing the same fork(s) - ownerType matches (case insensitive)", () => {
        //     filter.ownerTypes = ["User"];
        //     fork.owner.type = "User";
        //     expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        // });

        // it("should return empty array - ownerType does not match", () => {
        //     filter.ownerTypes = ["User"];
        //     fork.owner.type = "organization";
        //     expect(ffs.apply([fork], filter)).toStrictEqual([]);
        // });
    });

    describe("Updated in last n months", () => {
        it("should return an array containing the same fork(s) - nrOfMonths is undefined", () => {
            filter.updatedInLastMonths = undefined;
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });

        it("should return an array containing the same fork(s) - nrOfMonths is null", () => {
            filter.updatedInLastMonths = null as unknown as number;
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });

        it("should return empty array - fork last update was NOT within last n months", () => {
            filter.updatedInLastMonths = 1; // 20 years
            fork.last_pushed = new Date("2022-09-14T06:51:16Z");
            expect(ffs.apply([fork], filter)).toStrictEqual([]);
        });

        it("should return an array containing the same fork(s) - fork last update was within last n months", () => {
            filter.updatedInLastMonths = 240; // 20 years
            console.log(`last pushed ${fork.last_pushed}`);
            expect(ffs.apply([fork], filter)).toStrictEqual([fork]);
        });
    });
});
