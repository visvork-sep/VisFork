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

describe("useFilterForm - Initial values", () => {
    it("should set the initial value of repository to an empty string", () => {
        const { result } = renderHook(() => useFilterForm());
        expect(result.current.form.repository).toEqual("");
    });

    it("should set the initial value of forksCount correctly", () => {
        const { result } = renderHook(() => useFilterForm());
        expect(result.current.form.forksCount).toEqual(FORKS_COUNT_INPUT_INITIAL);
    });

    it("should set the initial value of forksOrder correctly", () => {
        const { result } = renderHook(() => useFilterForm());
        expect(result.current.form.forksOrder).toEqual(FORKS_SORTING_ORDERS.STARGAZERS.value);
    });

    it("should set the initial value of forksAscDesc correctly", () => {
        const { result } = renderHook(() => useFilterForm());
        expect(result.current.form.forksAscDesc).toEqual(SORT_DIRECTION.ASCENDING.value);
    });

    it("should set the initial value of forksTypeFilter to all fork types", () => {
        const { result } = renderHook(() => useFilterForm());
        expect(result.current.form.forksTypeFilter).toEqual(
            Object.values(FORK_TYPES).map((t) => t.value)
        );
    });

    it("should set the initial value of ownerTypeFilter to all owner types", () => {
        const { result } = renderHook(() => useFilterForm());
        expect(result.current.form.ownerTypeFilter).toEqual(
            Object.values(OWNER_TYPES).map((t) => t.value)
        );
    });

    it("should set the initial value of commitsDateRangeFrom to an empty string", () => {
        const { result } = renderHook(() => useFilterForm());
        expect(result.current.form.commitsDateRangeFrom).toEqual("");
    });

    it("should set the initial value of commitsDateRangeUntil to an empty string", () => {
        const { result } = renderHook(() => useFilterForm());
        expect(result.current.form.commitsDateRangeUntil).toEqual("");
    });
});
