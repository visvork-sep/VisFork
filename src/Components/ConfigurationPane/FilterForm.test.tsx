import { fireEvent, render, screen } from "@Utils/test-utils";
import FilterForm from "./FilterForm";
import { vi } from "vitest";


describe("Filterform updates", () => {
    const mockedFunction = vi.fn();

    beforeEach(() => {
        render(
            <FilterForm
                isDataLoading={false}
                filterChangeHandler={mockedFunction}
            />
        );
    });

    it("should update when repository is changed", () => {
        const input = screen.getByPlaceholderText(/torvalds\/linux/i);

        fireEvent.input(input, { target: { value: "a/b" } });

        expect(input.getAttribute("value")).toEqual("a/b");
    });
});

