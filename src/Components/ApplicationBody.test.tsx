import { render, screen } from "@testing-library/react";
import { Mock, vi } from "vitest";
import ApplicationBody from "./ApplicationBody";
import { Commit, Repository } from "@Types/LogicLayerTypes";
import { useVisualizationData } from "@Hooks/useVisualizationData";

// Mock child components
vi.mock("@Components/Plots/Histogram/Histogram", () => ({
    default: () => <div data-testid="Histogram" />,
}));
vi.mock("@Components/Plots/ForkList/ForkList", () => ({
    default: () => <div data-testid="ForkList" />,
}));
vi.mock("@Components/Plots/Timeline/CommitTimeline", () => ({
    default: () => <div data-testid="CommitTimeline" />,
}));
vi.mock("@Components/Plots/CommitTable/CommitTable", () => ({
    default: () => <div data-testid="CommitTable" />,
}));
vi.mock("@Components/Plots/CollaborationGraph/CollaborationGraph", () => ({
    default: () => <div data-testid="CollaborationGraph" />,
}));
vi.mock("@Components/Plots/SankeyDiagram/SankeyDiagram", () => ({
    SankeyDiagram: () => <div data-testid="SankeyDiagram" />,
}));
vi.mock("@Components/Plots/WordCloud/WordCloud", () => ({
    default: () => <div data-testid="WordCloud" />,
}));
vi.mock("@Components/InfoButton/InfoButton", () => ({
    InfoButton: ({ title }: { title: string; }) => (
        <div data-testid={`InfoButton-${title}`} />
    ),
}));

// Mock hook
vi.mock("@Hooks/useVisualizationData", () => ({
    useVisualizationData: vi.fn(),
}));

const fakeForks: Repository[] = [
    {
        id: 1,
        name: "repo-1",
        owner: { login: "user" },
        description: "desc",
        created_at: new Date(),
        last_pushed: new Date(),
        ownerType: "User",
        defaultBranch: "main",
    },
];

const fakeCommits: Commit[] = [
    {
        sha: "abc123",
        id: "1",
        parentIds: [],
        node_id: "node123",
        author: "Author",
        login: "user",
        date: new Date(),
        url: "http://example.com",
        message: "Initial commit",
        branch: "main",
        repo: "repo-1",
        mergedNodes: [],
        commitType: "adaptive",
    },
];

describe("ApplicationBody", () => {
    beforeEach(() => {
        (useVisualizationData as Mock).mockReturnValue({
            visData: {
                forkListData: { forkData: [] },
                histogramData: { commitData: [] },
                timelineData: { commitData: [] },
                commitTableData: { commitData: [] },
                wordCloudData: { commitData: [] },
                sankeyData: { commitData: [] },
                collabGraphData: { commitData: [] },
            },
            handlers: {
                handleHistogramSelection: vi.fn(),
                handleTimelineSelection: vi.fn(),
                handleSearchBarSubmission: vi.fn(),
            },
            defaultBranches: {},
        });
    });

    it("renders all visualizations and info buttons", () => {
        render(<ApplicationBody forks={fakeForks} commits={fakeCommits} />);

        // Visual components
        expect(screen.getByTestId("ForkList")).toBeInTheDocument();
        expect(screen.getByTestId("Histogram")).toBeInTheDocument();
        expect(screen.getByTestId("CommitTimeline")).toBeInTheDocument();
        expect(screen.getByTestId("CommitTable")).toBeInTheDocument();
        expect(screen.getByTestId("WordCloud")).toBeInTheDocument();
        expect(screen.getByTestId("SankeyDiagram")).toBeInTheDocument();
        expect(screen.getByTestId("CollaborationGraph")).toBeInTheDocument();

        // Info buttons
        expect(screen.getByTestId("InfoButton-Fork List")).toBeInTheDocument();
        expect(screen.getByTestId("InfoButton-Histogram")).toBeInTheDocument();
        expect(screen.getByTestId("InfoButton-Commit Timeline")).toBeInTheDocument();
        expect(screen.getByTestId("InfoButton-Commit Table")).toBeInTheDocument();
        expect(screen.getByTestId("InfoButton-Word Cloud")).toBeInTheDocument();
        expect(screen.getByTestId("InfoButton-Sankey Diagram")).toBeInTheDocument();
        expect(screen.getByTestId("InfoButton-Collaboration Graph")).toBeInTheDocument();
    });

    it("shows render time label", () => {
        render(<ApplicationBody forks={fakeForks} commits={fakeCommits} />);
        expect(screen.getByText(/Render time:/)).toBeInTheDocument();
    });
});
