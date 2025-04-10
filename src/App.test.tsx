import { render, screen } from "@testing-library/react";
import App from "./App";
import { vi } from "vitest";

// Mock the components being routed to
vi.mock("@Components/HomePage/HomePage", () => ({
    default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock("@Components/GitHubCallback/GitHubCallback", () => ({
    default: () => <div data-testid="github-callback">GitHub Callback</div>,
}));

describe("App Component", () => {
    it("renders HomePage on the root path", () => {
        render(<App />);

        // Check that HomePage is rendered
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });
});
