import { render, screen } from "@testing-library/react";
import Histogram from "./Histogram";
import { ThemeProvider } from "@primer/react";
import { describe, test, expect, vi, beforeEach } from "vitest";

describe("Histogram", () => {
  const mockCommitData = [
    { repo: "test-repo", date: new Date("2023-01-05") },
    { repo: "test-repo", date: new Date("2023-01-15") },
    { repo: "test-repo", date: new Date("2023-02-10") },
  ];

  const mockHandleHistogramSelection = vi.fn();

  beforeEach(() => {
    mockHandleHistogramSelection.mockClear();
  });

  test("renders without crashing", () => {
    render(
      <ThemeProvider>
        <Histogram
          commitData={mockCommitData}
          handleHistogramSelection={mockHandleHistogramSelection}
        />
      </ThemeProvider>
    );

    expect(
      screen.getByText("Slide to select a date range")
    ).toBeInTheDocument();
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  test("SVG contains correct chart elements", async () => {
    render(
      <ThemeProvider>
        <Histogram
          commitData={mockCommitData}
          handleHistogramSelection={mockHandleHistogramSelection}
        />
      </ThemeProvider>
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    const svg = document.querySelector("svg");
    expect(svg?.querySelector(".chartContext")).not.toBeNull();
    expect(svg?.querySelectorAll(".bar").length).toBeGreaterThan(0);
    expect(svg?.querySelector(".brush")).not.toBeNull();
  });
});
