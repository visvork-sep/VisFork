import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@primer/react";
import ForkList from "./ForkList";
import { ForkListData, ForkListDetails } from "@VisInterfaces/ForkListData";

// Sample fork data 
const forkDetails: ForkListDetails[] = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `fork/repo${i + 1}`,
    description: `Description for fork ${i + 1}`,
}));

const forkListData: ForkListData = {
    forkData: forkDetails
};

// quick helper to render the component 
const renderForkList = (
    data = forkListData,
) => {
    return render(
        <ThemeProvider>
            <ForkList forkData={data.forkData} />
        </ThemeProvider>
    );
};

afterEach(() => {
    vi.restoreAllMocks();
    // clear any DOM changes
    document.body.innerHTML = "";
});

describe("ForkList tests", () => {
    it("renders without errors when forkData is empty", () => {
        renderForkList({ forkData: [] });
        expect(screen.getByText("Forks")).toBeInTheDocument();
        expect(screen.getByText("A list of all the forks of the submitted repository.")).toBeInTheDocument();
        // Table should be empty
        expect(screen.queryByRole("row", { name: /fork/i })).not.toBeInTheDocument();
    });

    it("renders table with default page size (10)", () => {
        renderForkList();
        // Should render only 10 rows of data
        for (let i = 1; i <= 10; i++) {
            expect(screen.getByText(`fork/repo${i}`)).toBeInTheDocument();
        }
        // 11th row should not be in DOM yet
        expect(screen.queryByText("fork/repo11")).not.toBeInTheDocument();
    });

    it("changes page size to 5 and updates table", async () => {
        renderForkList();

        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "5" } });

        await waitFor(() => {
            expect(screen.getByText("fork/repo1")).toBeInTheDocument();
            expect(screen.queryByText("fork/repo6")).not.toBeInTheDocument();
        });
    });

    it("navigates to next page", async () => {
        renderForkList();

        // Navigate to page 2 (pageIndex = 1)
        const nextButton = screen.getByRole("button", { name: /next/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            // Should now be showing items 11–20
            expect(screen.getByText("fork/repo11")).toBeInTheDocument();
            expect(screen.queryByText("fork/repo1")).not.toBeInTheDocument();
        });
    });

});
