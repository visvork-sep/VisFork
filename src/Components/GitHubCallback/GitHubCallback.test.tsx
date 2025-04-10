import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import GitHubCallback from "./GitHubCallback";
import { useAuth } from "@Providers/AuthProvider";
import { useQuery, UseQueryResult  } from "@tanstack/react-query";
import { vi } from "vitest";

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseAuth = vi.mocked(useAuth);

// Mocks
vi.mock("@Providers/AuthProvider", () => ({
    useAuth: vi.fn()
}));

vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn()
}));
mockedUseQuery.mockReturnValue({
    isPending: false,
    isSuccess: false,
    data: null,
    isError: false,
    error: null,
    isLoading: false,
    refetch: vi.fn()
} as unknown as UseQueryResult);

const mockedNavigate = vi.fn();
let mockedSearchParams = new URLSearchParams({ code: "test-code" });

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
        useSearchParams: () => [mockedSearchParams]
    };
});

describe("GitHubCallback", () => {
    beforeEach(() => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: false,
            login: vi.fn(),
            logout: vi.fn(),
            getAccessToken: vi.fn(),
        });
    });
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("redirects with error when code is missing", async () => {
        mockedSearchParams = new URLSearchParams({
            error_description: "Access Denied"
        });

        render(
            <MemoryRouter initialEntries={["/callback"]}>
                <Routes>
                    <Route path="/callback" element={<GitHubCallback />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith("/", {
                state: {
                    fromError: true,
                    errorDescription: "Access Denied",
                }
            });
        });
    });

    test("calls login and redirects when token is received", async () => {
        mockedSearchParams = new URLSearchParams({ code: "test-code" });

        (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            isPending: false,
            isSuccess: true,
            data: { data: { accessToken: "abc123" } },
            isError: false,
            error: null,
            isLoading: false,
            refetch: vi.fn()
        });

        render(
            <MemoryRouter initialEntries={["/callback"]}>
                <Routes>
                    <Route path="/callback" element={<GitHubCallback />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockedUseAuth().login).toHaveBeenCalledWith("abc123");
            expect(mockedNavigate).toHaveBeenCalledWith("/");
        });
    });

    test("shows spinner when pending", () => {
        (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            isPending: true,
            isSuccess: false,
            data: null,
            isError: false,
            error: null,
            isLoading: true,
            refetch: vi.fn()
        });

        render(
            <MemoryRouter>
                <GitHubCallback />
            </MemoryRouter>
        );

        expect(document.querySelector("svg")).toBeInTheDocument();
    });

    test("shows error when token request fails", () => {
        (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            isPending: false,
            isSuccess: false,
            data: null,
            isError: true,
            error: new Error("Failed"),
            isLoading: false,
            refetch: vi.fn()
        });

        render(
            <MemoryRouter>
                <GitHubCallback />
            </MemoryRouter>
        );

        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });
});
