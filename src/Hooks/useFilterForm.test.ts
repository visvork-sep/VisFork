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
import { AssertionError } from "@Utils/Assert";

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

describe("useFilterForm - Repository", () => {
    it("should change the value of repository when its changeHandler is called with a valid string", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "updated";
        const handler = result.current.handleRepositoryChange;

        act(() => handler(newValue));

        expect(result.current.form.repository).toEqual(newValue);
    });
});

describe("useFilterForm - forksCount", () => {
    it("should change the value of forksCount when its changehandler is called with a valid number", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "1";
        const handler = result.current.handleForksCountChange;

        act(() => handler(newValue));

        expect(result.current.form.forksCount).toEqual(newValue);
    });

    it ("should change the value of forksCount to empty string" + 
            "when its changehandler is called with an empty string", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "";
        const handler = result.current.handleForksCountChange;

        act(() => handler(newValue));

        expect(result.current.form.forksCount).toEqual(newValue);
    });
});

describe("useFilterForm - forksOrder", () => {
    it.each(Object.values(FORKS_SORTING_ORDERS))(
        "should change the value of forksOrder if changed to any sorting order)",
        (d) => {
            const { result } = renderHook(useFilterForm);
            const newValue = d.value;
            const handler = result.current.handleForksOrderChange;

            act(() => handler(newValue));

            expect(result.current.form.forksOrder).toEqual(newValue);
        });

    it("should not allow it's precondition to be broken", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "N";
        const handler = result.current.handleForksOrderChange;

        expect(() => {
            act(() => handler(newValue));
        }).toThrowError(AssertionError);
    });
});

describe("useFilterForm - forksAscDesc", () => {
    it.each(Object.values(SORT_DIRECTION))(
        "should change the value of forksAscDesc if changed to any sorting direction",
        (d) => {
            const { result } = renderHook(useFilterForm);
            const newValue = d.value;
            const handler = result.current.handleForksOrderAscDescChange;

            act(() => handler(newValue));

            expect(result.current.form.forksAscDesc).toEqual(newValue);
        });
});

describe("useFilterForm - forksTypeFilter", () => {
    it("should change the value of forksTypeFilter to empty if set to empty list", () => {
        const { result } = renderHook(useFilterForm);
        const handler = result.current.handleForksTypeFilterChange;

        act(() => handler([]));
       
        expect(result.current.form.forksTypeFilter).toEqual([]);
    });

    it("should change the value of forksTypeFilter to any fork type", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = [FORK_TYPES.ADAPTIVE.value, FORK_TYPES.CORRECTIVE.value, FORK_TYPES.PERFECTIVE.value];
        const handler = result.current.handleForksTypeFilterChange;

        act(() => handler(newValue));

        expect(result.current.form.forksTypeFilter).toEqual(newValue);
    });
});

describe("useFilterForm - ownerTypeFilter", () => {
    it("should change the value of ownerTypeFilter to empty if set to empty list", () => {
        const { result } = renderHook(useFilterForm);
        const handler = result.current.handleOwnerTypeFilterChange;

        act(() => handler([]));

        expect(result.current.form.ownerTypeFilter).toEqual([]);
    });

    it("should change the value of ownerTypeFilter to any owner type", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = [OWNER_TYPES.ORGANIZATION.value, OWNER_TYPES.USER.value];
        const handler = result.current.handleOwnerTypeFilterChange;

        act(() => handler(newValue));

        expect(result.current.form.ownerTypeFilter).toEqual(newValue);
    });
});

describe("useFilterForm - commitsDateRangeFrom", () => {
    it("should change the value of commitsDateRangeFrom when its changeHandler is called with a valid string", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "updated";
        const handler = result.current.handleCommitsDateRangeFromChange;

        act(() => handler(newValue));

        expect(result.current.form.commitsDateRangeFrom).toEqual(newValue);
    });
});

describe("useFilterForm - commitsDateRangeUntil", () => {
    it("should change the value of commitsDateRangeUntil when its changeHandler is called with a valid string", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "updated";
        const handler = result.current.handleCommitsDateRangeUntilChange;

        act(() => handler(newValue));

        expect(result.current.form.commitsDateRangeUntil).toEqual(newValue);
    });
});

describe("useFilterForm - recentlyUpdated", () => {
    it("should change the value of recentlyUpdated when its changehandler is called with a valid number", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "1";
        const handler = result.current.handleRecentlyUpdatedChange;

        act(() => handler(newValue));

        expect(result.current.form.recentlyUpdated).toEqual(newValue);
    });

    it("should change the value of recentlyUpdated to empty string" +
        "when its changehandler is called with an empty string", () => {
        const { result } = renderHook(useFilterForm);
        const newValue = "";
        const handler = result.current.handleRecentlyUpdatedChange;

        act(() => handler(newValue));

        expect(result.current.form.recentlyUpdated).toEqual(newValue);
    });
});

