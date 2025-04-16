
import { act, fireEvent, render, screen } from "@Utils/test-utils";
import { OwnerTypeFilterInput } from "./OwnerTypeFilterInput";
import { vi } from "vitest";
import { UnknownError } from "@Types/UIFormErrors";

describe("CommitsFilterTypeInput", () => {
    it("should trigger callback", () => {
        const mockedFn = vi.fn();
        render(<OwnerTypeFilterInput error={null} checked={[]} onChangeHandler={mockedFn}></OwnerTypeFilterInput>);

        const input = screen.getByLabelText(/user/i);

        act(() => {
            fireEvent.click(input);
        });

        expect(mockedFn).toHaveBeenCalled();
    });


    it("should display error", () => {
        const mockedFn = vi.fn();
        render(<OwnerTypeFilterInput
            error={new UnknownError()} checked={[]} onChangeHandler={mockedFn}></OwnerTypeFilterInput>);

        const error = screen.getAllByText(/unknown error/i);

        expect(error).toBeDefined();
    });
});
