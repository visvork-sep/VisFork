import { render, screen, fireEvent } from "@testing-library/react";
import { InfoButton } from "./InfoButton";

const title = "Test Title";
const shortDescription = "Short tooltip description.";
const fullDescription = "Full modal description.";

describe("InfoButton", () => {
    test("renders the info button", () => {
        render(
            <InfoButton
                title={title}
                shortDescription={shortDescription}
                fullDescription={fullDescription}
            />
        );
        expect(screen.getByRole("button", { name: /more info about/i })).toBeInTheDocument();
    });

    test("shows tooltip on hover", async () => {
        render(
            <InfoButton
                title={title}
                shortDescription={shortDescription}
                fullDescription={fullDescription}
            />
        );

        const button = screen.getByRole("button");
        fireEvent.mouseOver(button);

        // Tooltip should appear
        expect(await screen.findByText(shortDescription)).toBeInTheDocument();
    });
});
