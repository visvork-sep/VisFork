import { describe, expect, it } from "vitest";
import { useFilterForm } from "./useFilterForm";
import { FORKSASCDESC, FORKSCOUNT_INITAL_VALUE, FORKSORDER_OPTIONS, FORKTYPES } from "@Utils/Constants";
import { renderHook } from "@testing-library/react";


describe("useFilterForm initial state", () => {
    it("Should set intial state of repositoryOwner as empty string", () => {
        const { result } = renderHook(useFilterForm);
        const form = result.current.form;

        expect(form.repositoryOwner).toEqual("");
    });

    it("Should set intial state of repositoryOwner as empty string", () => {
        const { result } = renderHook(useFilterForm);
        const form = result.current.form;

        expect(form.repositoryOwner).toEqual("");
    });

    it("Should set intial state of forksCount as FORKSCOUNT_INITIAL_VALUE", () => {
        const { result } = renderHook(useFilterForm);
        const form = result.current.form;

        expect(form.forksCount).toEqual(FORKSCOUNT_INITAL_VALUE);
    });

    it("Should set the intial state of forksOrder as FORKSORDER_OPTIONS[0]", () => {
        const { result } = renderHook(useFilterForm);
        const form = result.current.form;

        expect(form.forksOrder).toEqual(FORKSORDER_OPTIONS[0]);
    });

    it("Should set forksAscDesc to FORKSASCDESC[0[", () => {
        const { result } = renderHook(useFilterForm);
        const form = result.current.form;

        expect(form.forksAscDesc).toEqual(FORKSASCDESC[0]);
    });

    it("Should set forks set the intial forksType filter to include all forktypes", () => {
        const { result } = renderHook(useFilterForm);
        const form = result.current.form;

        const intialTypes = form.forksTypeFilter;

        FORKTYPES.forEach((t) => {
            expect(intialTypes).toContain(t);
        });
    });
});
