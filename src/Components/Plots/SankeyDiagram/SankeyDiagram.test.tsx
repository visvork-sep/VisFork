import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SankeyDiagram, parseData } from "./SankeyDiagram";
import { SankeyData } from "@VisInterfaces/SankeyData";
import { ThemeProvider } from "@primer/react";

// Sample sankey data
const sampleCommitData = Array.from({ length: 15 }, (_, i) => ({
    repo: `repo${i % 5 + 1}`,
    commitType: `type${i % 3 + 1}`,
}));

const sankeyData: SankeyData = {
    commitData: sampleCommitData
};

// Helper to render the component
const renderSankeyDiagram = (data = sankeyData) => {
    return render(
        <ThemeProvider>
            <SankeyDiagram {...data} />
        </ThemeProvider>
    );
};

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
});

describe("SankeyDiagram tests", () => {
    it("renders div with correct ID for the diagram", () => {
        renderSankeyDiagram();
        const container = screen.getByTestId("sankey-diagram");
        expect(container).toBeInTheDocument();
    });

    it("parses data correctly", () => {
        const parsedData = parseData(sankeyData);

        // Should have unique combinations of repo and commit type
        const expectedEntries = new Set();
        sampleCommitData.forEach(item => {
            expectedEntries.add(`${item.repo}-${item.commitType}`);
        });

        expect(parsedData.length).toBe(expectedEntries.size);

        // Check the structure of the first item
        expect(parsedData[0]).toHaveProperty("name");
        expect(parsedData[0]).toHaveProperty("type");
        expect(parsedData[0]).toHaveProperty("count");
    });

    it("combines duplicate repo-commitType pairs and counts them", () => {
        // Create data with known duplicates
        const duplicateData: SankeyData = {
            commitData: [
                { repo: "repoA", commitType: "typeX" },
                { repo: "repoA", commitType: "typeX" },
                { repo: "repoA", commitType: "typeY" }
            ]
        };

        const parsedData = parseData(duplicateData);

        // Should have two entries
        expect(parsedData.length).toBe(2);

        // Find the repoA-typeX entry and check its count
        const repoATypeXEntry = parsedData.find(item => item.name === "repoA" && item.type === "typeX");
        expect(repoATypeXEntry).toBeDefined();
        expect(repoATypeXEntry?.count).toBe(2);

        // Find the repoA-typeY entry and check its count
        const repoATypeYEntry = parsedData.find(item => item.name === "repoA" && item.type === "typeY");
        expect(repoATypeYEntry).toBeDefined();
        expect(repoATypeYEntry?.count).toBe(1);
    });

    it("handles component unmount and cleanup", () => {
        const { unmount } = renderSankeyDiagram();
        unmount();

        // Since useEffect cleanup doesn't do anything explicit in this component,
        // we're just checking that unmounting doesn't throw errors
        expect(true).toBeTruthy();
    });

    it("handles non-existent container gracefully", () => {
        // Remove the container before rendering
        document.body.innerHTML = "";

        // Component should render without errors even if container is missing
        expect(() => renderSankeyDiagram()).not.toThrow();
    });

    it("handles empty commit data gracefully", () => {
        renderSankeyDiagram({ commitData: [] });
        const container = screen.getByTestId("sankey-diagram");
        const textElement = container.querySelector("text");
        expect(textElement).not.toBeNull();
        expect(textElement?.textContent).toBe("No data selected");
    });

    it("applies correct styles on node hover", () => {
        renderSankeyDiagram();

        const container = screen.getByTestId("sankey-diagram");

        // Select the first node (D3 likely renders as <rect>)
        const maybeNode = container.querySelector("rect");
        expect(maybeNode).not.toBeNull();

        const node = maybeNode as SVGElement; // now node is guaranteed non-null
        fireEvent.mouseOver(node);
        expect(node).toHaveAttribute("stroke", "black");

        fireEvent.mouseOut(node);
        expect(node).toHaveAttribute("stroke", "currentColor");
    });

    it("applies correct styles on link hover", async () => {
        renderSankeyDiagram();

        const container = screen.getByTestId("sankey-diagram");
        const maybeLink = container.querySelector("path");
        expect(maybeLink).not.toBeNull();

        const link = maybeLink as SVGPathElement;

        const stroke = link.getAttribute("stroke");
        expect(stroke).toMatch(/^url\(#/); // confirm it starts with a gradient

        // Trigger mouseover event
        fireEvent.mouseOver(link);

        // Trigger mouseout to restore
        fireEvent.mouseOut(link); // test if it resets properly

        await waitFor(() => {
            const stroke = link.getAttribute("stroke");
            expect(stroke).toMatch(/^url\(#/); // confirm it ends with a gradient
        });
    });
});
