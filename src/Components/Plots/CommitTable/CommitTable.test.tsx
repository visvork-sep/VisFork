import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@primer/react";
import CommitTable from "./CommitTable";
import { CommitTableDetails } from "@VisInterfaces/CommitTableData";

// Sample commit data
const mockCommits: CommitTableDetails[] = [
    {
        id: "abc1234def",
        repo: "user1/repo1",
        author: "Jane Doe",
        login: "janedoe",
        date: "2024-04-01",
        message: "Initial commit"
    },
    {
        id: "def5678ghi",
        repo: "user2/repo2",
        author: "John Smith",
        login: "johnsmith",
        date: "2024-04-02",
        message: "Added feature"
    },
    {
        id: "xyz9876uvw",
        repo: "user3/repo3",
        author: "Alice",
        login: "aliceGH",
        date: "2024-04-03",
        message: "Fixed bug in authentication"
    }
];

// Helper to render component with theme provider
const renderCommitTable = (data = mockCommits, handleSearchBarSubmission = vi.fn()) => {
    return render(
        <ThemeProvider>
            <CommitTable commitData={data} handleSearchBarSubmission={handleSearchBarSubmission} />
        </ThemeProvider>
    );
};

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
});

describe("CommitTable", () => {
    it("renders commit table with rows", () => {
        renderCommitTable();

        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
        expect(screen.getByText("John Smith")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Initial commit")).toBeInTheDocument();
        expect(screen.getByText("Added feature")).toBeInTheDocument();
    });

    it("filters commits based on search input", async () => {
        renderCommitTable();

        const input = screen.getByLabelText("Search commit messages");
        fireEvent.change(input, { target: { value: "feature" } });
        const searchButton = screen.getByRole("button");
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText("Added feature")).toBeInTheDocument();
            expect(screen.queryByText("Initial commit")).not.toBeInTheDocument();
            expect(screen.queryByText("Fixed bug in authentication")).not.toBeInTheDocument();
        });
    });

    it("sends filtered hashes to parent via handleSearchBarSubmission", async () => {
        const mockHandler = vi.fn();
        renderCommitTable(mockCommits, mockHandler);

        // should trigger once on initial mount
        expect(mockHandler).toHaveBeenCalledWith([
            "abc1234def", "def5678ghi", "xyz9876uvw"
        ]);

        const input = screen.getByLabelText("Search commit messages");
        fireEvent.change(input, { target: { value: "auth" } });
        const searchButton = screen.getByRole("button");
        fireEvent.click(searchButton);

        // should call again with filtered result
        await waitFor(() => {
            expect(mockHandler).toHaveBeenCalledWith(["xyz9876uvw"]);
        });
    });

    it("creates correct links for repo, author, and commit hash", () => {
        renderCommitTable();

        const repoLink = screen.getByRole("link", { name: "user1/repo1" });
        expect(repoLink).toHaveAttribute("href", "https://github.com/user1/repo1");

        const authorLink = screen.getByRole("link", { name: "Jane Doe" });
        expect(authorLink).toHaveAttribute("href", "https://github.com/janedoe");

        const hashLink = screen.getByRole("link", { name: "abc1234" }); // short hash
        expect(hashLink).toHaveAttribute("href", "https://github.com/user1/repo1/commit/abc1234def");
    });

    it("renders nothing when filtered results are empty", async () => {
        renderCommitTable();

        const input = screen.getByLabelText("Search commit messages");
        fireEvent.change(input, { target: { value: "nonexistent term" } });
        const searchButton = screen.getByRole("button");
        fireEvent.click(searchButton);

        await waitFor(() => {
            const visibleMessages = screen.queryAllByText(/./); // grab any text node
            const content = visibleMessages.map(node => node.textContent).join(" ");
            expect(content).not.toMatch(/Jane Doe|John Smith|Alice/);
        });
    });
});
