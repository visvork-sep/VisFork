// CommitTimeline.test.tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@primer/react";
import CommitTimeline from "./CommitTimeline";
import { TimelineDetails } from "@VisInterfaces/TimelineData";

// Sample commit data 
const commitData = [
    {
        id: "1",
        repo: "repo1",
        branch: "main",
        date: "2021-01-01",
        parentIds: [],
        url: "",
    },
    {
        id: "2",
        repo: "repo1",
        branch: "main",
        date: "2021-01-02",
        parentIds: ["1"],
        url: "",
    },
];

// quick helper to render the component 
const renderCommitTimeline = (
    data = commitData,
    handler = handleTimelineSelection
) => {
    return render(
        <ThemeProvider>
            <CommitTimeline commitData={data} handleTimelineSelection={handler} />
        </ThemeProvider>
    );
};

const emptyCommitData: TimelineDetails[] = [];

const handleTimelineSelection = vi.fn();

afterEach(() => {
    vi.restoreAllMocks();
    // clear any DOM changes
    document.body.innerHTML = "";
});

describe("CommitTimeline component additional tests", () => {
    it("renders without errors when commitData is empty", () => {
        renderCommitTimeline(emptyCommitData, handleTimelineSelection);
        // the SVG should be present, but no graph elements should be drawn.
        const svg = document.querySelector("svg");
        expect(svg).toBeInTheDocument();
        expect(svg?.querySelectorAll("path").length).toBe(0);
    });

    it("toggles select all and calls handleTimelineSelection with commit ids", async () => {
        renderCommitTimeline(commitData, handleTimelineSelection);
        const selectAllButton = screen.getByRole("button", { name: /Select All/i });
        // click to select all
        fireEvent.click(selectAllButton);
        await waitFor(() => {
            expect(selectAllButton.textContent).toBe("Deselect All");
        });
        expect(handleTimelineSelection).toHaveBeenCalledWith(["1", "2"]);
        // click again to deselect all
        fireEvent.click(selectAllButton);
        await waitFor(() => {
            expect(selectAllButton.textContent).toBe("Select All");
        });
        expect(handleTimelineSelection).toHaveBeenCalledWith([]);
    });

    it("renders legends correctly", async () => {
        renderCommitTimeline(commitData, handleTimelineSelection);
        // Legends container should be rendered with id "dag-legends"
        const legendContainer = document.getElementById("dag-legends");
        expect(legendContainer).toBeInTheDocument();
        await waitFor(() => {
            // At least one child element should be appended by drawLegends.
            expect(legendContainer?.childElementCount).toBeGreaterThan(0);
        });
    });

    it("re-renders on window resize", async () => {
        renderCommitTimeline(commitData, handleTimelineSelection);
        const svg = await waitFor(() => document.querySelector("svg"));
        expect(svg).toBeInTheDocument();
        // a window resize event
        fireEvent(window, new Event("resize"));
        await waitFor(() => {
            // the SVG should have an updated viewBox attribute
            expect(svg?.getAttribute("viewBox")).toBeTruthy();
        });
    });

    it("changes button background on mouse enter and leave", () => {
        renderCommitTimeline(commitData, handleTimelineSelection);
        const toggleButton = screen.getByRole("button", { name: /Merged View/i });
        // simulate mouse enter
        fireEvent.mouseEnter(toggleButton);
        // expect the background not to be transparent (value from theme)
        expect(toggleButton.style.backgroundColor).not.toBe("transparent");
        // simulate mouse leave 
        fireEvent.mouseLeave(toggleButton);
        expect(toggleButton.style.backgroundColor).toBe("transparent");
    });
  
    it("does not draw timeline markers in merged view", async () => {
        renderCommitTimeline(commitData, handleTimelineSelection);
        // full view, timeline markers should be drawn.
        await waitFor(() => {
            const markers = document.querySelector("g.month-lines");
            expect(markers).toBeInTheDocument();
        });
        // toggle to merged view
        const toggleButton = screen.getByRole("button", { name: /Merged View/i });
        fireEvent.click(toggleButton);
        await waitFor(() => {
            const markers = document.querySelector("g.month-lines");
            expect(markers).toBeNull();
        });
    });

    it("displays selection overlay when selectAll is active", async () => {
        renderCommitTimeline(commitData, handleTimelineSelection);
        // initially there should be no selection overlay
        expect(document.querySelector(".selection-overlay")).not.toBeInTheDocument();
      
        // click Select All button
        const selectAllButton = screen.getByRole("button", { name: /Select All/i });
        fireEvent.click(selectAllButton);
      
        // now there should be a selection overlay
        await waitFor(() => {
            const overlay = document.querySelector(".selection-overlay");
            expect(overlay).toBeInTheDocument();
        });
      
        // click Deselect All button
        fireEvent.click(selectAllButton);
      
        // overlay should be removed
        await waitFor(() => {
            const overlay = document.querySelector(".selection-overlay");
            expect(overlay).not.toBeInTheDocument();
        });
    });

    it("handles errors in dag building gracefully", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
            // the linter doesn't like empty arrow functions 
        });
      
        // invalid data that would cause the builder to fail
        const invalidData = [
            {
                id: "1",
                repo: "repo1",
                branch: "main",
                date: "", 
                parentIds: ["meow"], // references a non-existent parent
                url: "",
            }
        ];
      
        renderCommitTimeline(invalidData, handleTimelineSelection);
      
        // error should be logged for the DAG building
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Error building"), 
                expect.anything()
            );
        });
      
        consoleSpy.mockRestore();
    });

    it("opens a new window on node click", async () => {
        // spy on window.open to check if it is called
        const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
        
        renderCommitTimeline(commitData, handleTimelineSelection);
        
        const circle = await waitFor(() => document.querySelector("circle"));
        expect(circle).toBeInTheDocument();
        
        // click
        fireEvent.click(circle as Element);
        
        expect(openSpy).toHaveBeenCalled();
        openSpy.mockRestore();

        // in Merged View, default nodes (squares) should not be clickable 
        const toggleButton = screen.getByRole("button", { name: /Merged View/i });
        fireEvent.click(toggleButton);
        const square = await waitFor(() => document.querySelector("rect"));
        expect(square).toBeInTheDocument();
        
        // click
        fireEvent.click(square as Element);
        expect(openSpy).toHaveBeenCalledTimes(0); // needs to be not called

        openSpy.mockRestore();



        
    });

});
