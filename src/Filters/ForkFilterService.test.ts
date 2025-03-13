import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { act } from "react";
import { ForkFilterService } from "./ForkFilterService";

const ffs: ForkFilterService = new ForkFilterService();

describe("ForkFilterService - isValidForkByFilter", () => {
    it("should throw an error when param fork is null", () => {
        const { result } = ffs.#isValidForkByFilter(null, null as any);
        expect(() => result).toThrow("Fork is null or undefined");
    });
});