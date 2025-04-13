import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppHeader from "./AppHeader";
import { describe, it, vi, beforeEach, expect, Mock } from "vitest";
import { useAuth } from "@Providers/AuthProvider";
import { useFetchAvatarUrl } from "@Queries/queries";
import { useTheme } from "@primer/react";

// Mocks
vi.mock("@Providers/AuthProvider", () => ({
    useAuth: vi.fn(),
}));

vi.mock("@Queries/queries", () => ({
    useFetchAvatarUrl: vi.fn(),
}));

vi.mock("@primer/react/experimental", () => ({
    SkeletonAvatar: vi.fn(() => <div data-testid="skeleton-avatar" />),
}));

vi.mock("@primer/react", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        useTheme: vi.fn(),
        Box: vi.fn(({ children, ...props }) => {
            return <div {...props}>{children}</div>;
        }),
        Dialog: ({ children }: never) => <div>{children}</div>,
    };
});

vi.mock("../../public/visForkIcon.svg", () => ({
    default: "mocked-icon-url",
}));

describe("AppHeader", () => {
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders logo and title", () => {
        (useAuth as Mock).mockReturnValue({ isAuthenticated: false });
        (useFetchAvatarUrl as Mock).mockReturnValue({ data: undefined });
        (useTheme as Mock).mockReturnValue({});

        render(<AppHeader />);
        expect(screen.getByText("VisFork")).toBeInTheDocument();
    });

    it("shows Sign in button when not authenticated", () => {
        (useAuth as Mock).mockReturnValue({ isAuthenticated: false });
        (useFetchAvatarUrl as Mock).mockReturnValue({ data: undefined });
        (useTheme as Mock).mockReturnValue({});

        render(<AppHeader />);
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("shows Avatar when authenticated with avatarUrl", () => {
        (useAuth as Mock).mockReturnValue({ isAuthenticated: true });
        (useFetchAvatarUrl as Mock).mockReturnValue({
            data: { viewer: { avatarUrl: "http://example.com/avatar.png" } },
        });
        (useTheme as Mock).mockReturnValue({});

        render(<AppHeader />);
        expect(screen.getByAltText("user avatar")).toHaveAttribute("src", "http://example.com/avatar.png");
    });

    it("shows SkeletonAvatar when authenticated but no avatarUrl", () => {
        (useAuth as Mock).mockReturnValue({ isAuthenticated: true });
        (useFetchAvatarUrl as Mock).mockReturnValue({
            data: { viewer: {} },
        });
        (useTheme as Mock).mockReturnValue({});

        render(<AppHeader />);
        expect(screen.getByTestId("skeleton-avatar")).toBeInTheDocument();
    });

    it("opens dialog on avatar click", async () => {
        (useAuth as Mock).mockReturnValue({ isAuthenticated: true });
        (useFetchAvatarUrl as Mock).mockReturnValue({
            data: { viewer: { avatarUrl: "http://example.com/avatar.png" } },
        });
        (useTheme as Mock).mockReturnValue({
            colorMode: "day",
            setColorMode: vi.fn(),
            dayScheme: "light",
            nightScheme: "dark",
            setDayScheme: vi.fn(),
            setNightScheme: vi.fn(),
        });

        render(<AppHeader />);
        waitFor(() => {
            fireEvent.click(screen.getByAltText("user avatar"));
            expect(screen.getByRole("dialog")).toBeInTheDocument();
        });
    });

    it("toggles colorblind mode", async () => {
        const setDayScheme = vi.fn();
        const setNightScheme = vi.fn();

        (useAuth as Mock).mockReturnValue({ isAuthenticated: true });
        (useFetchAvatarUrl as Mock).mockReturnValue({
            data: { viewer: { avatarUrl: "http://example.com/avatar.png" } },
        });
        (useTheme as Mock).mockReturnValue({
            colorMode: "day",
            setColorMode: vi.fn(),
            dayScheme: "light",
            nightScheme: "dark",
            setDayScheme,
            setNightScheme,
        });

        render(<AppHeader />);
        waitFor(() => {
            fireEvent.click(screen.getByAltText("user avatar"));
            fireEvent.click(screen.getByLabelText("Toggle colorblind mode"));
            expect(setDayScheme).toHaveBeenCalledWith("light_colorblind");
            expect(setNightScheme).toHaveBeenCalledWith("dark_colorblind");
        });
    });

    it("toggles dark mode", async () => {
        const setColorMode = vi.fn();

        (useAuth as Mock).mockReturnValue({ isAuthenticated: true });
        (useFetchAvatarUrl as Mock).mockReturnValue({
            data: { viewer: { avatarUrl: "http://example.com/avatar.png" } },
        });
        (useTheme as Mock).mockReturnValue({
            colorMode: "day",
            setColorMode,
            dayScheme: "light",
            nightScheme: "dark",
            setDayScheme: vi.fn(),
            setNightScheme: vi.fn(),
        });

        render(<AppHeader />);
        waitFor(() => {
            fireEvent.click(screen.getByAltText("user avatar"));
            fireEvent.click(screen.getByLabelText("Toggle light mode"));
            expect(setColorMode).toHaveBeenCalledWith("dark");
        });
    });

    it("logs out and closes dialog", async () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            logout: mockLogout,
        });
        (useFetchAvatarUrl as Mock).mockReturnValue({
            data: { viewer: { avatarUrl: "http://example.com/avatar.png" } },
        });
        (useTheme as Mock).mockReturnValue({
            colorMode: "day",
            setColorMode: vi.fn(),
            dayScheme: "light",
            nightScheme: "dark",
            setDayScheme: vi.fn(),
            setNightScheme: vi.fn(),
        });

        render(<AppHeader />);
        waitFor(() => {
            fireEvent.click(screen.getByAltText("user avatar"));
            fireEvent.click(screen.getByRole("button", { name: /sign out button/i }));
            expect(mockLogout).toHaveBeenCalled();
        });
    });
});
