import { MoonIcon, SunIcon } from "@primer/octicons-react";
import { ActionMenu, Avatar, Box, Button, Dialog, Stack, useTheme } from "@primer/react";
import { ActionList } from "@primer/react";
import { useCallback, useState } from "react";
import { useAuth } from "@Providers/AuthProvider";
import { SkeletonAvatar } from "@primer/react/experimental";
import { AUTH_URL } from "@Utils/Constants";
import { useFetchAvatarUrl } from "../Queries/queries";
import visForkIcon from "/visForkIcon.svg";
/**
 * Redirects the user to GitHub OAuth login.
 *
 * This function initiates the authentication flow by redirecting the user
 * to the GitHub OAuth authorization endpoint. A small timeout is used
 * to accommodate Safari's behavior with redirects.
 */
function redirectLogin() {
    setTimeout(() => { // timeout for Safari behavior
        window.location.href = AUTH_URL + "/auth/github";
    }, 250);
}
function redirectLogout() {
    setTimeout(() => { // Timeout for smoother UI transition
        window.location.href = "/github/logout"; // Redirect to logout page
    }, 250);
}

/**
 * AppHeader Component
 *
 * This component represents the navigation bar for the application, handling user authentication,
 * display settings (dark mode, colorblind mode), and a side panel for additional user options.
 */
function AppHeader() {
    /** Controls the visibility of the settings side panel */
    const { isAuthenticated, logout } = useAuth();
    const { data } = useFetchAvatarUrl({});
    const avatarUrl = data?.viewer.avatarUrl as string | undefined;

    const { colorMode, setColorMode, dayScheme, nightScheme, setDayScheme, setNightScheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const onDialogClose = useCallback(() => setIsOpen(false), []);
    const onDialogOpen = useCallback(() => setIsOpen(true), []);
    
    const handleLogout = useCallback(() => {
        logout();
        setIsOpen(false);
        redirectLogout();
    }, []);

    const loginOrAvatar = isAuthenticated ?
        (
            <Box onClick={onDialogOpen}>
                {avatarUrl ?
                    <Avatar src={avatarUrl} size={32} />
                    :
                    <SkeletonAvatar size={32} />
                }
            </Box>
        )
        :
        (
            <Button onClick={redirectLogin}>Login</Button>
        );

    const currentlyColorblindMode = dayScheme === "light_colorblind" || nightScheme === "dark_colorblind";
    const onToggleColorblindMode = useCallback(() => {
        const newDayScheme = currentlyColorblindMode ? "light" : "light_colorblind";
        const newNightScheme = currentlyColorblindMode ? "dark" : "dark_colorblind";
        setDayScheme(newDayScheme);
        setNightScheme(newNightScheme);
    }, [currentlyColorblindMode, setDayScheme, setNightScheme]);

    const currentlyDarkMode = colorMode === "dark" || colorMode === "night";
    const onToggleDarkMode = useCallback(() => {
        const newMode = currentlyDarkMode ? "day" : "dark";
        setColorMode(newMode);
    }, [currentlyDarkMode, setColorMode]);
    return (
        <>
            <Stack direction="horizontal" align="center">
                <Stack.Item>
                    <Avatar src={visForkIcon} size={32} />
                </Stack.Item>
                <Stack.Item grow>
                    <span>VisFork</span>
                </Stack.Item>
                <Stack.Item>
                    {loginOrAvatar}
                </Stack.Item>
            </Stack>

            {/* Side panel for user settings, opens when 'isOpen' is true */}
            {isOpen && (
                <Dialog title="Settings" onClose={onDialogClose} position="right" width="small">
                    <ActionMenu>
                        <ActionList>
                            <ActionList.Item onClick={onToggleColorblindMode} aria-label="Toggle colorblind mode">
                                Colorblind mode
                            </ActionList.Item>

                            <ActionList.Item
                                onClick={onToggleDarkMode}
                                aria-label="Toggle light mode"
                            >
                                <ActionList.LeadingVisual>
                                    {currentlyDarkMode ? <SunIcon /> : <MoonIcon />}
                                </ActionList.LeadingVisual>
                                {currentlyDarkMode ? "Light mode" : "Dark mode"}
                            </ActionList.Item>

                            <ActionList.Divider />

                            <ActionList.Item onClick={handleLogout} variant="danger" aria-label="Sign out button">
                                Sign out
                            </ActionList.Item>
                        </ActionList>
                    </ActionMenu>
                </Dialog>
            )}
        </>
    );
}
export default AppHeader;
