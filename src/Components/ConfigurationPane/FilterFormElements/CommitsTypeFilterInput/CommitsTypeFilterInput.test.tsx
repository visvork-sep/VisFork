import { act, fireEvent, render, screen } from "@Utils/test-utils";
import { CommitTypeFilterInput } from "./CommitsTypeFilterInput";
import { vi } from "vitest";
import { UnknownError } from "@Types/UIFormErrors";

describe("CommitsFilterTypeInput", () => {
    it("should trigger callback", () => {
        const mockedFn = vi.fn();
        render(<CommitTypeFilterInput error={null} checked={[]} onChangeHandler={mockedFn}></CommitTypeFilterInput>);

        const input = screen.getByLabelText(/perfective/i);

        act(() => {
            fireEvent.click(input);
        });

        expect(mockedFn).toHaveBeenCalled();
    });


    it("should display error", () => {
        const mockedFn = vi.fn();
        render(<CommitTypeFilterInput
            error={new UnknownError()} checked={[]} onChangeHandler={mockedFn}></CommitTypeFilterInput>);

        const error = screen.getAllByText(/unknown error/i);

        expect(error).toBeDefined();
    });
});
