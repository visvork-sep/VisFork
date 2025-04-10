import { act, fireEvent, screen } from "@testing-library/react";
import { render } from "@Utils/test-utils";
import { RepositoryInput } from "./RepositoryInput";
import { vi } from "vitest";
import { RepositoryInputErrors } from "@Types/UIFormErrors";

describe("RepositoryInput", () => {
    it("should trigger callback", () => {

        const mockedFn = vi.fn();
        render(<RepositoryInput value={""} onChangeHandler={mockedFn} error={null}></ RepositoryInput>);
        act(() => {
            screen.debug();

            const input = screen.getByRole("textbox");

            fireEvent.input(input, { target: { value: "a" } });

            expect(mockedFn).toHaveBeenCalledWith("a");
        });
    });

    it("should display error", () => {
        const mockedFn = vi.fn();
        render(<RepositoryInput value={""} onChangeHandler={mockedFn}
            error={new RepositoryInputErrors.UnknownError()} />);

        const errortext = screen.getByText(/unknown error/i);

        expect(errortext).toBeDefined();
    });
});
