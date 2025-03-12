import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFilterForm } from "./useFilterForm";
import {
    FORKS_COUNT_INPUT_INITIAL,
    FORKS_SORTING_ORDERS,
    SORT_DIRECTION,
    FORK_TYPES,
    OWNER_TYPES,
} from "@Utils/Constants";
import { act } from "react";

describe("useFilterForm - Initial values", () => {
    it("should set the initial value of repository to an empty string", () => {
        const { result } = renderHook(useFilterForm);
        expect(result.current.form.repository).toEqual("");
    });

    it("should set the initial value of forksCount correctly", () => {
        const { result } = renderHook(useFilterForm);
        expect(result.current.form.forksCount).toEqual(FORKS_COUNT_INPUT_INITIAL);
    });

    it("should set the initial value of forksOrder correctly", () => {
        const { result } = renderHook(useFilterForm);
        expect(result.current.form.forksOrder).toEqual(FORKS_SORTING_ORDERS.STARGAZERS.value);
    });

    it("should set the initial value of forksAscDesc correctly", () => {
        const { result } = renderHook(useFilterForm);
        expect(result.current.form.forksAscDesc).toEqual(SORT_DIRECTION.ASCENDING.value);
    });

    it("should set the initial value of forksTypeFilter to all fork types", () => {
        const { result } = renderHook(useFilterForm);
        expect(result.current.form.forksTypeFilter).toEqual(
            Object.values(FORK_TYPES).map((t) => t.value)
        );
    });

    it("should set the initial value of ownerTypeFilter to all owner types", () => {
        const { result } = renderHook(useFilterForm);
        expect(result.current.form.ownerTypeFilter).toEqual(
            Object.values(OWNER_TYPES).map((t) => t.value)
        );
    });

    it("should set the initial value of commitsDateRangeFrom to an empty string", () => {
        const { result } = renderHook(useFilterForm);
        expect(result.current.form.commitsDateRangeFrom).toEqual("");
    });

    it("should set the initial value of commitsDateRangeUntil to an empty string", () => {
        const { result } = renderHook(useFilterForm);
        expect(result.current.form.commitsDateRangeUntil).toEqual("");
    });
});

describe("useFiterForm - Repository", () => {
    it("should change the value of repository when its changeHandler is called with a valid string", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "updated";
        const handler = result.current.handleRepositoryChange;

        act(() => handler(newValue));

        expect(result.current.form.repository).toEqual(newValue);
    });
});

describe("useFilterForm - forksCount", () => {
    it("should change the value of respositoryCount when its changehandler is called with a valid number", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "1";
        const handler = result.current.handleForksCountChange;

        act(() => handler(newValue));

        expect(result.current.form.forksCount).toEqual(Number(1));
    });

    it("should change the value of respositoryCount to undefined" +
            "when its changehandler is called with an invalid number", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "invalid";
        const handler = result.current.handleForksCountChange;

        act(() => handler(newValue));

        expect(result.current.form.forksCount).toBeUndefined();
    });

    it ("should change the value of repository count to undefined" + 
            "when its changehandler is called with an empty string", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "";
        const handler = result.current.handleForksCountChange;

        act(() => handler(newValue));

        expect(result.current.form.forksCount).toBeUndefined();
    });
});
