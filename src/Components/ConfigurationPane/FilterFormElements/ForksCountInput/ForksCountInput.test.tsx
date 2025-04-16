import { act, fireEvent, render, screen } from "@Utils/test-utils";
import { ForksCountInput } from "./ForksCountInput";
import { vi } from "vitest";
import { UnknownError } from "@Types/UIFormErrors";

describe("ForksCountInput", () => {
    it("should trigger callback", () => {
        const mockedFn = vi.fn();
        render(<ForksCountInput error={null} value={"5"} onChangeHandler={mockedFn}></ForksCountInput>);

        const input = screen.getByLabelText(/forks count/i);

        act(() => {
            fireEvent.input(input, { target: { value: "1" } });
        });

        expect(mockedFn).toHaveBeenLastCalledWith("1");
    });

    it("should display error", () => {
        const mockedFn = vi.fn();
        render(<ForksCountInput error={new UnknownError()} value={"5"} onChangeHandler={mockedFn}></ForksCountInput>);

        const text = screen.getByText(/unknown error/i);

        expect(text).toBeDefined();
    });
});
