import { fireEvent, screen } from "@testing-library/react";
import { Dropdown } from "./Dropdown";
import { describe, expect, it } from "vitest";
import { act } from "react";
import { render } from "@Utils/test-utils";

describe("Dropdown Summary", () => {
    it("should display the summary text provided", () => {
        const summaryText = "summaryText";

        render(<Dropdown summaryText={summaryText} />);
        const result = screen.getByText(summaryText).textContent;

        expect(result).toEqual(summaryText);
    });
});

describe("Dropdown Content", () => {
    it("should not display content if not clicked", () => {
        const contentText = "contentText";
        const summaryText = "summaryText";
        render(
            <Dropdown summaryText={summaryText}>
                {contentText}
            </Dropdown>
        );

        const result = screen.queryByText(contentText);

        expect(result).not.toBeVisible();
    });

    it("should display content if clicked", () => {
        const contentText = "contentText";
        const summaryText = "summaryText";
        render(
            <Dropdown summaryText={summaryText}>
                {contentText}
            </Dropdown>);

        const summary = screen.getByText(summaryText);
        act(() => fireEvent.click(summary));

        const result = screen.getByText(contentText);

        expect(result).toBeVisible();
    });
});

