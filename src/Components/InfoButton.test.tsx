import { render, screen, fireEvent } from "@testing-library/react";
import { InfoButton } from "./InfoButton"; // adjust path as needed
import "@testing-library/jest-dom";

describe("InfoButton", () => {
    const title = "Histogram";
    const shortDescription = "Shows commit activity over time.";
    const fullDescription = "Detailed view of commit activity with zoom and tooltips.";

    beforeEach(() => {
        render(
            <InfoButton
                title={title}
                shortDescription={shortDescription}
                fullDescription={fullDescription}
            />
        );
    });

    it("renders the info icon button", () => {
        const button = screen.getByRole("button", { name: `More info about ${title}` });
        expect(button).toBeInTheDocument();
    });

    it("shows tooltip on hover", async () => {
        const button = screen.getByRole("button", { name: `More info about ${title}` });

        fireEvent.mouseOver(button);
        const tooltip = await screen.findByText(shortDescription);
        expect(tooltip).toBeInTheDocument();
    });

    it("opens modal on click with full description", () => {
        const button = screen.getByRole("button", { name: `More info about ${title}` });

        fireEvent.click(button);

        const dialogTitle = screen.getByRole("dialog", { name: title });
        expect(dialogTitle).toBeInTheDocument();

        const content = screen.getByText(fullDescription);
        expect(content).toBeInTheDocument();
    });

    it("closes the modal when the close button is clicked", () => {
        const button = screen.getByRole("button", { name: `More info about ${title}` });

        fireEvent.click(button);

        const closeButton = screen.getByRole("button", { name: /close/i });
        fireEvent.click(closeButton);

        // After closing, the dialog should not be in the DOM
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
