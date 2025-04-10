/* eslint-disable @typescript-eslint/no-empty-function */
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.stubGlobal("CSS", {
    supports: vi.fn().mockReturnValue(true),
});

vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
});

document.body.setAttribute("data-color-mode", "light");

afterEach(() => {
    cleanup();
});
