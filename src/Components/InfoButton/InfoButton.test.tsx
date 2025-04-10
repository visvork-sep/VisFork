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

    // test("opens the dialog with full description on click", async () => {
    //     render(
    //         <InfoButton
    //             title={title}
    //             shortDescription={shortDescription}
    //             fullDescription={fullDescription}
    //         />
    //     );

    //     const button = screen.getByRole("button");
    //     fireEvent.click(button);

    //     // const dialog = await screen.findByRole("dialog");
    //     // expect(dialog).toBeInTheDocument();
    //     // expect(screen.getByText(/full modal description/i)).toBeInTheDocument();
    //     // expect(screen.getByText(title)).toBeInTheDocument();
    // });

    // test("closes the dialog when onClose is triggered", async () => {
    //     const user = userEvent.setup();

    //     render(
    //         <InfoButton
    //             title={title}
    //             shortDescription={shortDescription}
    //             fullDescription={fullDescription}
    //         />
    //     );

    //     const button = screen.getByRole("button", { name: /more info about/i });
    //     await user.click(button);

    //     const dialog = await screen.findByRole("dialog");
    //     expect(dialog).toBeInTheDocument();

    //     // Attempt to find the close button
    //     const closeButton =
    //         screen.queryByRole("button", { name: /close/i }) ??
    //         screen.getAllByRole("button").slice(-1)[0]; // fallback

    //     await user.click(closeButton);

    //     expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // });
});
