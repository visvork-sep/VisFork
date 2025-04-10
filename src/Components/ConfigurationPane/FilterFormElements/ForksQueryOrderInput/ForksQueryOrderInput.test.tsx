import { act, fireEvent, render, screen } from "@Utils/test-utils";
import { ForksQueryOrderInput } from "./ForksQueryOrderInput";
import { vi } from "vitest";
import { UnknownError } from "@Types/UIFormErrors";

describe("ForksQueryOrderInput", () => {
    it("should trigger callback", () => {
        const mockedFn = vi.fn();
        render(<ForksQueryOrderInput error={null} selected="watchers" onChangeHandler={mockedFn} />);

        const input = screen.getByLabelText(/top forks by/i);

        act(() => {
            fireEvent.change(input, { target: { value: "stargazers" } });
        });

        expect(mockedFn).toHaveBeenLastCalledWith("stargazers");
    });

    it("should display error", () => {
        const mockedFn = vi.fn();
        render(<ForksQueryOrderInput error={new UnknownError()} selected="watchers" onChangeHandler={mockedFn} />);

        const error = screen.getByText(/unknown error/i);

        expect(error).toBeDefined();
    });
});
