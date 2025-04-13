import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InfoButton } from "./InfoButton";

const title = "Test Title";
const shortDescription = "Short tooltip description.";
const fullDescription = "Line one.\nLine two.";

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

        expect(await screen.findByText(shortDescription)).toBeInTheDocument();
    });

    test("opens dialog with full description on button click", () => {
        render(
            <InfoButton
                title={title}
                shortDescription={shortDescription}
                fullDescription={fullDescription}
            />
        );


        waitFor(() => {
            fireEvent.click(screen.getByRole("button"));
            expect(screen.getByRole("dialog")).toBeInTheDocument();
            expect(screen.getByText("Line one.")).toBeInTheDocument();
            expect(screen.getByText("Line two.")).toBeInTheDocument();
        });
    });

    test("closes dialog on onClose", () => {
        render(
            <InfoButton
                title={title}
                shortDescription={shortDescription}
                fullDescription={fullDescription}
            />
        );

        let dialog: HTMLElement;
        waitFor(async () => {
            fireEvent.click(screen.getByRole("button"));
            dialog = await screen.findByRole("dialog");
        });

        waitFor(() => {
            fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
    });
});
