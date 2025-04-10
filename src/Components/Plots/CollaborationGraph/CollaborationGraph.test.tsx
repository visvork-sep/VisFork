import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CollaborationGraph from "./CollaborationGraph";
import { ThemeProvider } from "@primer/react";
import { CollabGraphData } from "@Types/VisualizationInterfaces/CollabGraphData";

const exampleData: CollabGraphData = {
    commitData: [
        {
            author: "me",
            login: "betterMe",
            repo: "My-Repo",
            date: "2007-04-05T14:30"
        },
        {
            author: "notme",
            login: "diffPerson",
            repo: "My-Repo",
            date: "2007-04-05T14:30"
        },
    ]
};


// Helper to render the component
const renderCollaborationGraph = (data = exampleData) => {
    return render(
        <ThemeProvider>
            <CollaborationGraph {...data} />
        </ThemeProvider>
    );
};

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
});

describe("Collaboration Graph tests", () => {
    it("renders div with correct ID for the graph", () => {
        renderCollaborationGraph();
        const container = screen.getByTestId("collab-graph");
        expect(container).toBeInTheDocument();
    });

    it("handles component unmount and cleanup", () => {
        const { unmount } = renderCollaborationGraph();
        unmount();

        // Since useEffect cleanup doesn't do anything explicit in this component,
        // we're just checking that unmounting doesn't throw errors
        expect(true).toBeTruthy();
    });

    it("handles non-existent container gracefully", () => {
        // Remove the container before rendering
        document.body.innerHTML = "";

        // Component should render without errors even if container is missing
        expect(() => renderCollaborationGraph()).not.toThrow();
    });

    it("renders two author circles with example data", async () => {
        renderCollaborationGraph();

        const circles = await screen.getAllByTestId("author-circle");

        expect(circles.length).toBe(2);
    });

    it("renders one repo square with example data", async () => {
        renderCollaborationGraph();

        const squares = await screen.getAllByTestId("repo-square");

        expect(squares.length).toBe(1);
    });

    it("Opens a new window when an author is double clicked", async () => {
        const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
        renderCollaborationGraph();

        const square = await screen.getByTestId("repo-square");

        fireEvent.dblClick(square);
        expect(openSpy).toHaveBeenCalled();

        openSpy.mockRestore();
    });

    it("Opens a new window when a repo is double clicked", async () => {
        const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
        renderCollaborationGraph();

        const circles = await screen.getAllByTestId("author-circle");

        fireEvent.dblClick(circles[0]);
        expect(openSpy).toHaveBeenCalled();

        openSpy.mockRestore();
    });
});
