import { ImageIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { ActionMenu, Avatar, Box, Button, Dialog, Stack, useTheme } from "@primer/react";
//TODO replace this component with a non-deprecated one
import { ActionList } from "@primer/react/deprecated";
import { useCallback, useState } from "react";
import { useAuth } from "@Providers/AuthProvider";
import { redirectLogin } from "@Utils/Auth";
import { SkeletonAvatar } from "@primer/react/experimental";
import { useAvatarUrl } from "@Hooks/useAvatarUrl";

/**
 * AppHeader Component
 * 
 * This component represents the navigation bar for the application, handling user authentication,
 * display settings (dark mode, colorblind mode), and a side panel for additional user options.
 */
function AppHeader() {
    /** Controls the visibility of the settings side panel */
    const { isAuthenticated, logout } = useAuth();
    const avatarUrl = useAvatarUrl();

    const { colorMode, setColorMode, dayScheme, nightScheme, setDayScheme, setNightScheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const onDialogClose = useCallback(() => setIsOpen(false), []);
    const onDialogOpen = useCallback(() => setIsOpen(true), []);

    const handleLogout = useCallback(() => {
        logout();
        setIsOpen(false);
    }, []);

    const handleLogin = useCallback(() => {
        redirectLogin();
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
            <Button onClick={handleLogin}>Login</Button>
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
                    <ImageIcon size={32} />
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
                <Dialog title="Settings" onClose={onDialogClose} position={"right"} width="small">
                    <ActionMenu>
                        <ActionList
                            items={[
                                {
                                    text: "Colorblind mode", onClick: onToggleColorblindMode,
                                    selected: currentlyColorblindMode, "aria-label": "Toggle colorblind mode"
                                },
                                {
                                    text: currentlyDarkMode ? "Light mode" : "Dark mode", onClick: onToggleDarkMode,
                                    leadingVisual: currentlyDarkMode ? SunIcon : MoonIcon,
                                    "aria-label": "Toggle light mode"
                                },
                                ActionList.Divider,
                                {
                                    text: "Sign out", onClick: handleLogout, variant: "danger",
                                    "aria-label": "Sign out button"
                                },
                            ]}>
                        </ActionList>
                    </ActionMenu>
                </Dialog>
            )}
        </>
    );
}

export default AppHeader;
