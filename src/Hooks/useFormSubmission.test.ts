import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFormSubmission } from "./useFormSubmission";
import { FilterFormState } from "../Types/UIFormTypes";
import * as SanitizeUtils from "@Utils/Sanitize";
import * as FormUtils from "@Utils/FormSubmissionUtils";
import * as FormSubmissionUtils from "@Utils/FormSubmissionUtils";
import { ForkFilter, ForkQueryState } from "@Types/LogicLayerTypes";

describe("useFormSubmission", () => {
    let mockForm: FilterFormState;
    let mockReturnedFilter: ForkFilter;
    let mockReturnedQueryState: ForkQueryState;
    const mockOnFiltersChange = vi.fn();
    
    beforeEach(() => {
        mockForm = {
            repository: "owner/repo",
            forksCount: "10",
            forksOrder: "stargazers",
            forksAscDesc: "asc",
            commitsDateRangeFrom: "2023-01-01",
            commitsDateRangeUntil: "2023-01-31",
            commitTypeFilter: ["adaptive", "corrective"],
            ownerTypeFilter: ["User"],
            recentlyUpdated: "6"
        };

        mockReturnedFilter = {
            ownerTypes: ["User"],
            commitTypes: ["adaptive", "corrective"],
            updatedInLastMonths: 6
        };
        mockReturnedQueryState = {
            owner: "owner",
            repo: "repo",
            forksCount: 10,
            range: {
                start: new Date("2023-01-01"),
                end: new Date("2023-01-31")
            },
            sort: "stargazers",
            direction: "asc"
        };

        // Default sanitize mock returns (valid inputs)
        vi.spyOn(SanitizeUtils, "prepareRepository").mockReturnValue({
            owner: "owner",
            repositoryName: "repo"
        });
        vi.spyOn(SanitizeUtils, "prepareForksCount").mockReturnValue(10);
        vi.spyOn(SanitizeUtils, "prepareForksOrder").mockReturnValue("stargazers");
        vi.spyOn(SanitizeUtils, "prepareForksSortDirection").mockReturnValue("asc");
        vi.spyOn(SanitizeUtils, "prepareCommitsDateRangeFrom").mockReturnValue(new Date("2023-01-01"));
        vi.spyOn(SanitizeUtils, "prepareCommitsDateRangeUntil").mockReturnValue(new Date("2023-01-31"));
        vi.spyOn(SanitizeUtils, "prepareCommitsTypeFilter").mockReturnValue(["adaptive", "corrective"]);
        vi.spyOn(SanitizeUtils, "prepareOwnerTypeFilter").mockReturnValue(["User"]);
        vi.spyOn(SanitizeUtils, "prepareRecentlyUpdated").mockReturnValue(6);

        // Form submission factories
        vi.spyOn(FormUtils, "filterFactory").mockReturnValue(mockReturnedFilter);
        vi.spyOn(FormUtils, "forkQueryStateFactory").mockReturnValue(mockReturnedQueryState);

        mockOnFiltersChange.mockReset();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it("should not call onFiltersChange if a required field is invalid", () => {
        vi.spyOn(FormSubmissionUtils, "safePrepare").mockReturnValue(null); // Simulate bad input

        const { result } = renderHook(() =>
            useFormSubmission(mockForm, mockOnFiltersChange)
        );

        act(() => {
            result.current.onSubmit({ preventDefault: vi.fn() } as never);
        });

        expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should call onFiltersChange if all fields are valid", () => {
        const { result } = renderHook(() =>
            useFormSubmission(mockForm, mockOnFiltersChange)
        );

        act(() => {
            result.current.onSubmit({ preventDefault: vi.fn()} as never);
        });

        expect(mockOnFiltersChange).toHaveBeenCalledWith(mockReturnedFilter, mockReturnedQueryState);
    });

    it("should handle from > until date and set error", () => {
        vi.spyOn(SanitizeUtils, "prepareCommitsDateRangeFrom").mockReturnValue(new Date("2023-02-01"));
        vi.spyOn(SanitizeUtils, "prepareCommitsDateRangeUntil").mockReturnValue(new Date("2023-01-01"));

        const { result } = renderHook(() =>
            useFormSubmission(mockForm, mockOnFiltersChange)
        );

        act(() => {
            result.current.onSubmit({ preventDefault: vi.fn() } as never);
        });

        expect(result.current.commitsDateRangeFromInputError).toBeTruthy();
        expect(result.current.commitsDateRangeUntilInputError).toBeTruthy();
        expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should initialize all error states to null", () => {
        const { result } = renderHook(() =>
            useFormSubmission(mockForm, mockOnFiltersChange)
        );

        expect(result.current.repositoryInputError).toBe(null);
        expect(result.current.forksCountInputError).toBe(null);
        expect(result.current.forksOrderInputError).toBe(null);
        expect(result.current.forksAscDescInputError).toBe(null);
        expect(result.current.commitsDateRangeFromInputError).toBe(null);
        expect(result.current.commitsDateRangeUntilInputError).toBe(null);
        expect(result.current.recentlyUpdatedInputError).toBe(null);
        expect(result.current.commitsTypeFilterInputError).toBe(null);
        expect(result.current.ownerTypeFilterInputError).toBe(null);
    });

    it("should set UnknownError if thrown error is not instance of InputError", () => {
        // simulate a random error thrown
        vi.spyOn(SanitizeUtils, "prepareRepository").mockImplementation(() => {
            throw new Error("Random failure");
        });

        const { result } = renderHook(() =>
            useFormSubmission(mockForm, mockOnFiltersChange)
        );

        act(() => {
            result.current.onSubmit({ preventDefault: vi.fn() } as never);
        });

        expect(result.current.repositoryInputError?.message).toBe("Unknown error");
        expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });
});
