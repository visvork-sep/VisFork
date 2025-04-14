import {
    prepareRepository,
    prepareForksCount,
    prepareForksOrder,
    prepareForksSortDirection,
    prepareCommitsDateRangeFrom,
    prepareCommitsDateRangeUntil,
    prepareCommitsTypeFilter,
    prepareOwnerTypeFilter,
    prepareRecentlyUpdated
} from "./Sanitize.ts";

import { describe, it, expect } from "vitest";
import {
    ForksCountInputErrors,
    RepositoryInputErrors,
    CommitsDateRangeFromInputErrors,
    CommitsDateRangeUntilInputErrors,
    RecentlyUpdatedInputErrors
} from "../Types/UIFormErrors";

describe("prepareRepository", () => {
    it("splits input correctly", () => {
        const result = prepareRepository("owner/repo");
        expect(result.owner).toBe("owner");
        expect(result.repositoryName).toBe("repo");
    });

    it("throws on forbidden characters", () => {
        expect(() => prepareRepository("own@r/repo")).toThrow(RepositoryInputErrors.ForbiddenCharactersError);
    });

    it("throws on incorrect format", () => {
        expect(() => prepareRepository("owneronly")).toThrow(RepositoryInputErrors.RepositorySyntaxError);
    });
});

describe("prepareForksCount", () => {
    it("parses valid integer string", () => {
        const result = prepareForksCount("25");
        expect(result).toBe(25);
    });

    it("throws on forbidden characters", () => {
        expect(() => prepareForksCount("2@5")).toThrow(ForksCountInputErrors.ForbiddenCharactersError);
    });

    it("throws on non-integer", () => {
        expect(() => prepareForksCount("2.5")).toThrow(ForksCountInputErrors.NonIntegralError);
    });

    it("throws on min range violation", () => {
        expect(() => prepareForksCount("0")).toThrow(ForksCountInputErrors.LessThanMinForksError);
    });

    it("throws on max range violation", () => {
        expect(() => prepareForksCount("9999")).toThrow(ForksCountInputErrors.GreaterThanMaxForksError);
    });

    it("throws on empty string", () => {
        expect(() => prepareForksCount("")).toThrow(ForksCountInputErrors.NonIntegralError);
    });
});

describe("prepareForksOrder", () => {
    it("returns input if clean", () => {
        expect(prepareForksOrder("stargazers")).toBe("stargazers");
    });
    // Note that although this function has robustness-checking, it can never enter that because 
    // of the type of the parameter
});

describe("prepareForksSortDirection", () => {
    it("returns input if clean", () => {
        expect(prepareForksSortDirection("desc")).toBe("desc");
    });
    // Note that although this function has robustness-checking, it can never enter that because 
    // of the type of the parameter
});

describe("prepareCommitsDateRangeFrom", () => {
    it("returns Date object for valid date", () => {
        const result = prepareCommitsDateRangeFrom("2024-12-01");
        expect(result).toBeInstanceOf(Date);
    });

    it("throws on forbidden characters", () => {
        expect(() => prepareCommitsDateRangeFrom("2024@12-01"))
            .toThrow(CommitsDateRangeFromInputErrors.ForbiddenCharactersError);
    });

    it("throws on invalid format", () => {
        expect(() => prepareCommitsDateRangeFrom("2024/12/01"))
            .toThrow(CommitsDateRangeFromInputErrors.InvalidDateError);
    });
});

describe("prepareCommitsDateRangeUntil", () => {
    it("returns Date object for valid date", () => {
        const result = prepareCommitsDateRangeUntil("2024-12-31");
        expect(result).toBeInstanceOf(Date);
    });

    it("throws on forbidden characters", () => {
        expect(() => prepareCommitsDateRangeUntil("2024-12@31"))
            .toThrow(CommitsDateRangeUntilInputErrors.ForbiddenCharactersError);
    });

    it("throws on invalid format", () => {
        expect(() => prepareCommitsDateRangeUntil("2024.12.31"))
            .toThrow(CommitsDateRangeUntilInputErrors.InvalidDateError);
    });
});

describe("prepareCommitsTypeFilter", () => {
    it("returns array if clean", () => {
        const result = prepareCommitsTypeFilter(["perfective", "adaptive"]);
        expect(result).toEqual(["perfective", "adaptive"]);
    });
    // Note that although this function has robustness-checking, it can never enter that because 
    // of the type of the parameter
});

describe("prepareOwnerTypeFilter", () => {
    it("returns array if clean", () => {
        const result = prepareOwnerTypeFilter(["User", "Organization"]);
        expect(result).toEqual(["User", "Organization"]);
    });
    // Note that although this function has robustness-checking, it can never enter that because 
    // of the type of the parameter
});

describe("prepareRecentlyUpdated", () => {
    it("returns null if input is empty", () => {
        const result = prepareRecentlyUpdated("");
        expect(result).toBe(null);
    });

    it("returns number if input is clean and in range", () => {
        const result = prepareRecentlyUpdated("3");
        expect(result).toBe(3);
    });

    it("throws on forbidden character", () => {
        expect(() => prepareRecentlyUpdated("3@")).toThrow(RecentlyUpdatedInputErrors.ForbiddenCharactersError);
    });

    it("throws on non-integer", () => {
        expect(() => prepareRecentlyUpdated("3.5")).toThrow(RecentlyUpdatedInputErrors.NonIntegralError);
    });

    it("throws on out-of-range value", () => {
        expect(() => prepareRecentlyUpdated("999")).toThrow(RecentlyUpdatedInputErrors.OutOfRecentlyUpdatedRangeError);
    });
});
