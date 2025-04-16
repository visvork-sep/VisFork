import { render, screen } from "@testing-library/react";
import DataComponents from "./DataComponents";
import { vi } from "vitest";
import * as useFilteredDataHook from "@Hooks/useFilteredData";
import { Commit, Repository } from "@Types/LogicLayerTypes";
import { ThemeProvider } from "@primer/react";
beforeAll(() => {
    global.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addListener: vi.fn(),
        removeListener: vi.fn(),
    }));
});

afterAll(() => {
    vi.restoreAllMocks();
});

// Mock child components
vi.mock("@Components/ApplicationBody", () => ({
    default: ({ forks, commits }: { forks: Repository[], commits: Commit[]; }) => (
        <div data-testid="ApplicationBody">
            forks: {forks.length}, commits: {commits.length}
        </div>
    ),
}));
vi.mock("@Components/ConfigurationPane/ConfigurationPane", () => ({
    default: ({ isDataLoading }: { isDataLoading: boolean; }) => (
        <div data-testid="ConfigurationPane">
            {isDataLoading ? "Loading..." : "Ready"}
        </div>
    ),
}));

describe("DataComponents", () => {
    beforeEach(() => {
        vi.spyOn(useFilteredDataHook, "useFilteredData").mockReturnValue({
            onFiltersChange: vi.fn(),
            isLoading: false,
            filters: {
                commitTypes: ["adaptive", "perfective"],
                ownerTypes: ["User", "Organization"],
            },
            forks: [
                {
                    id: 1,
                    name: "test-repo",
                    owner: { login: "user" },
                    description: "A test repo",
                    created_at: new Date(),
                    last_pushed: new Date(),
                    ownerType: "User",
                    defaultBranch: "main",
                },
            ],
            commits: [
                {
                    sha: "abc123",
                    id: "1",
                    parentIds: [],
                    node_id: "node1",
                    date: new Date(),
                    url: "http://example.com",
                    author: "Jane",
                    login: "jane",
                    message: "feature: added something",
                    branch: "main",
                    repo: "user/test-repo",
                },
            ],
            data: undefined,
            forkQuery: undefined,
            forkError: null,
            commitError: null,
            isLoadingFork: false,
            isLoadingCommits: false
        });
    });

    it("renders ApplicationBody and ConfigurationPane with processed data", () => {
        render(
            <ThemeProvider>
                <DataComponents />
            </ThemeProvider>);

        expect(screen.getByTestId("ConfigurationPane")).toHaveTextContent("Ready");
        expect(screen.getByTestId("ApplicationBody")).toHaveTextContent("forks: 1, commits: 1");
    });
});
