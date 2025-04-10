import { fireEvent, render, screen } from "@Utils/test-utils";
import { CommitsDateRangeFromInput } from "./CommitsDateRangeFromInput";
import { vi } from "vitest";
import { CommitsDateRangeFromInputErrors } from "@Types/UIFormErrors";

describe("commitsDateRangeFromInput", () => {
    it("should trigger callback", () => {
        const mockedFn = vi.fn();
        render(<CommitsDateRangeFromInput value={""} error={null} onChangeHandler={mockedFn} />);

        const input = screen.getByLabelText(/commits from/i);

        fireEvent.input(input, { target: { value: "2024-06-29" } });

        expect(mockedFn).toHaveBeenLastCalledWith("2024-06-29");
    });

    it("should display error", () => {
        const mockedFn = vi.fn();
        render(<CommitsDateRangeFromInput value={""} onChangeHandler={mockedFn}
            error={new CommitsDateRangeFromInputErrors.UnknownError} />);

        const errortext = screen.getByText(/unknown error/i);

        expect(errortext).toBeDefined();
    });
});
