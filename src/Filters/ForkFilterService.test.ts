import { describe, expect, it, beforeEach } from "vitest";
import { ForkFilterService } from "./ForkFilterService";
import { ForkJSON } from "../Types/GithubTypes";
import { DateRange, ForkFilter } from "../Types/ForkFilter";

const ffs: ForkFilterService = new ForkFilterService();

const example_fork: ForkJSON = {

}

const example_filter: ForkFilter = {
    dateRange: {start: undefined, end: undefined },
    sortBy: "oldest"
}

let fork: any = null;
let filter: any = null;

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

describe("ForkFilterService#apply fork properties undefined errors", () => {
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
    });
});
