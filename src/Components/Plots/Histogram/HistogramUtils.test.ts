import { sortDates, computeFrequency } from "./HistogramUtils";
import * as d3 from "d3";

describe("HistogramUtils", () => {
    describe("sortDates", () => {
        it("sorts commits by date in ascending order", () => {
            const commitData = [
                { date: new Date("2023-05-05") },
                { date: new Date("2021-01-10") },
                { date: new Date("2022-10-15") },
            ];

            const result = sortDates(commitData);
            expect(result).toEqual([
                new Date("2021-01-10"),
                new Date("2022-10-15"),
                new Date("2023-05-05"),
            ]);
        });

        it("returns an empty array when given empty commit data", () => {
            const commitData: { date: Date }[] = [];
            const result = sortDates(commitData);
            expect(result).toEqual([]);
        });
    });

    describe("computeFrequency", () => {
        it("accurately computes frequency of commits by month", () => {
            const dates = [
                new Date("2023-01-10T00:00:00.000Z"),
                new Date("2023-01-15T00:00:00.000Z"),
                new Date("2023-02-22T00:00:00.000Z"),
            ];

            const frequency = computeFrequency(dates);
      
            const jan = d3.utcMonth(new Date("2023-01-01")).toISOString();
            const feb = d3.utcMonth(new Date("2023-02-01")).toISOString();

            expect(frequency.get(jan)).toBe(2);
            expect(frequency.get(feb)).toBe(1);
        });

        it("fills missing months with zero commits", () => {
            const dates = [
                new Date("2023-01-10"),
                new Date("2023-03-22"),
            ];

            const frequency = computeFrequency(dates);
      
            // Use d3's format for consistency
            const jan = d3.utcMonth(new Date("2023-01-01")).toISOString();
            const feb = d3.utcMonth(new Date("2023-02-01")).toISOString();
            const mar = d3.utcMonth(new Date("2023-03-01")).toISOString();

            expect(frequency.get(jan)).toBe(1);
            expect(frequency.get(feb)).toBe(0);
            expect(frequency.get(mar)).toBe(1);
        });

        it("returns an empty map if dates are empty", () => {
            const frequency = computeFrequency([]);
            expect(Array.from(frequency.keys())).toHaveLength(0);
        });
    });
});
