import { act, fireEvent, render, screen } from "@Utils/test-utils";
import { RecentlyUpdatedInput } from "./RecentlyUpdatedInput";
import { vi } from "vitest";
import { UnknownError } from "@Types/UIFormErrors";

describe("ForksCountInput", () => {
    it("should trigger callback", () => {
        const mockedFn = vi.fn();
        render(<RecentlyUpdatedInput error={null} value={"5"} onChangeHandler={mockedFn}></RecentlyUpdatedInput>);

        const input = screen.getByLabelText(/recently updated/i);

        act(() => {
            fireEvent.input(input, { target: { value: "1" } });
        });

        expect(mockedFn).toHaveBeenLastCalledWith("1");
    });

    it("should display error", () => {
        const mockedFn = vi.fn();
        render(<RecentlyUpdatedInput error={new UnknownError()} value={"5"} onChangeHandler={mockedFn} />);

        const text = screen.getByText(/unknown error/i);

        expect(text).toBeDefined();
    });
});
