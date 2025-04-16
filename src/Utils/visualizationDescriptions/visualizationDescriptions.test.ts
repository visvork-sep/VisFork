import { describe, expect, it } from "vitest";
import { visualizationDescriptions }from "./visualizationDescriptions";


describe("visualizationDescriptions", () => {
    it("should be an object with 7 visualizations", () => {
        expect(typeof visualizationDescriptions).toBe("object");
        expect(Object.keys(visualizationDescriptions)).toHaveLength(7);
    });
  
    it("each visualization should have short and full descriptions", () => {
        for (const key of Object.keys(visualizationDescriptions) as (keyof typeof visualizationDescriptions)[]) {
            const item = visualizationDescriptions[key];
            expect(item).toHaveProperty("short");
            expect(typeof item.short).toBe("string");
  
            expect(item).toHaveProperty("full");
            expect(typeof item.full).toBe("string");
        }
    });
  
    it("should match expected short descriptions for selected keys", () => {
        expect(visualizationDescriptions.histogram.short).toBe(
            "Shows commit activity over time with a zoomable Focus Chart."
        );
        expect(visualizationDescriptions.forkList.short).toBe(
            "Lists repository forks with filtering and pagination."
        );
        expect(visualizationDescriptions.wordCloud.short).toBe(
            "Highlights frequent words in commit messages."
        );
    });
  
    it("should include key 'commitTimeline' with correct content", () => {
        const timeline = visualizationDescriptions.commitTimeline;
        expect(timeline.short).toContain("Chronological view");
        expect(timeline.full).toContain("Hover over a node");
        expect(timeline.full).toContain("Merged View");
    });
});
