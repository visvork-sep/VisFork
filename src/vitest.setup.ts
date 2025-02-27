import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi, } from "vitest";

vi.stubGlobal("CSS", {
    supports: vi.fn().mockReturnValue(true),
});

// Mock matchMedia for media queries used in @primer/react or CSS-in-JS
vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query) => ({
    matches: false, // Set this to true if you want to simulate a match
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
})));

// Mock ResizeObserver if CSS grid/flex layouts cause errors in tests
vi.stubGlobal("ResizeObserver", class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
});

vi.stubGlobal("IntersectionObserver", class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
});

afterEach(() => {
    cleanup();
});
