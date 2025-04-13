import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ThemeProvider } from "@primer/react";
import HomePage from "./HomePage";

// Mock components
vi.mock("@Components/AppHeader", () => ({
    default: () => <div data-testid="header">MockHeader</div>,
}));

vi.mock("@Components/DataComponents", () => ({
    default: () => <div data-testid="data">MockData</div>,
}));

const mockLocationState = null;

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useLocation: () => ({
            pathname: "/",
            state: mockLocationState
        })
    };
});

// Mock browser APIs needed by Primer
beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))
    });
});

const renderWithPrimer = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("HomePage", () => {
    it("renders header, data section, and footer", () => {
        renderWithPrimer(<HomePage />);

        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("data")).toBeInTheDocument();
        expect(screen.getByLabelText("Footer")).toBeInTheDocument();
    });
});
