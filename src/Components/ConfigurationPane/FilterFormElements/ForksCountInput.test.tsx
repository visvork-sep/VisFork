import { fireEvent, render, screen } from "@Utils/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ForksCountInput } from "./ForksCountInput";
import { act } from "react";

describe("ForksCountInput", () => {
    it("should render with a label", () => {
        const label = "label";
        render(<ForksCountInput validation={undefined} onChangeHandler={vi.fn()} label={label} />);

        const result = screen.getByLabelText(label).ariaLabel;

        expect(result).toEqual(label);
    });
});

describe("ForksCountInput validation", () => {
    it("should display an error message with a lessThanMinForksError", () => {
        render(<ForksCountInput validation="lessThanMinForksError" onChangeHandler={vi.fn()} label="" />);

        const result = screen.queryByText("Number of forks must be greater than", { exact: false });

        expect(result).not.toBeNull();
    });

    it("should display an error message with a greaterThanMaxForksError", () => {
        render(<ForksCountInput validation="greaterThanMaxForksError" onChangeHandler={vi.fn()} label="" />);

        const result = screen.queryByText("Number of forks must be less than", { exact: false });
        screen.debug();

        expect(result).not.toBeNull();
    });

    it("should display an error message with an unknown error", () => {
        render(<ForksCountInput validation="unknownError" onChangeHandler={vi.fn()} label="" />);

        const result = screen.queryByText("Unknown error in field", { exact: false });
        screen.debug();

        expect(result).not.toBeNull();
    });
});

describe("ForksCountInput onChange behaviour", () => {
    it("should call the onchange handler when value changes", () => {
        const handleChange = vi.fn();
        const label = "label";
        render(<ForksCountInput validation="unknownError" onChangeHandler={handleChange} label={label} />);

        const input = screen.getByLabelText(label);
        act(() => fireEvent.input(input, {
            target: { value: "1" }
        }));

        expect(handleChange).toHaveBeenCalledTimes(1);
    });
});
