import { act, fireEvent, render, screen } from "@Utils/test-utils";
import { ForksQueryOrderAscDescInput } from "./ForksQueryOrderAscDescInput";
import { vi } from "vitest";
import { UnknownError } from "@Types/UIFormErrors";

describe("ForksQueryOrderAscDescInput", () => {
    it("should trigger callback", () => {
        const mockedFn = vi.fn();
        render(<ForksQueryOrderAscDescInput error={null} selected="watchers" onChangeHandler={mockedFn} />);

        const input = screen.getByLabelText(/retrieval order/i);

        act(() => {
            fireEvent.change(input, { target: { value: "asc" } });
        });

        expect(mockedFn).toHaveBeenLastCalledWith("asc");
    });

    it("should display error", () => {
        const mockedFn = vi.fn();
        render(<ForksQueryOrderAscDescInput
            error={new UnknownError()}
            selected="desc"
            onChangeHandler={mockedFn} />);

        const error = screen.getByText(/unknown error/i);

        expect(error).toBeDefined();
    });
});
