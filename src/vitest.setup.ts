import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.stubGlobal("CSS", {
    supports: vi.fn().mockReturnValue(true),
});

afterEach(() => {
    cleanup();
});
