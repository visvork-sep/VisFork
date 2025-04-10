
import { fireEvent, render, screen } from "@Utils/test-utils";
import { CommitsDateRangeUntilInput } from "./CommitsDateRangeUntilInput";
import { vi } from "vitest";
import { CommitsDateRangeFromInputErrors } from "@Types/UIFormErrors";

describe("commitsDateRangeFromInput", () => {
    it("should trigger callback", () => {
        const mockedFn = vi.fn();
        render(<CommitsDateRangeUntilInput value={""} error={null} onChangeHandler={mockedFn} />);

        const input = screen.getByLabelText(/commits until/i);

        fireEvent.input(input, { target: { value: "2024-06-29" } });

        expect(mockedFn).toHaveBeenLastCalledWith("2024-06-29");
    });

    it("should display error", () => {
        const mockedFn = vi.fn();
        render(<CommitsDateRangeUntilInput value={""} onChangeHandler={mockedFn}
            error={new CommitsDateRangeFromInputErrors.UnknownError} />);

        const errortext = screen.getByText(/unknown error/i);

        expect(errortext).toBeDefined();
    });
});
