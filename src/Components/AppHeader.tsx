import { ImageIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { Avatar, Box, Button, Dialog, Header, useTheme } from "@primer/react";
import { ActionList } from "@primer/react/deprecated";
import { useCallback, useState } from "react";
import { useAuth } from "../Utils/AuthProvider";
import { redirectLogin, useAvatarUrl } from "../Utils/Auth";
import { SkeletonAvatar } from "@primer/react/experimental";

/**
 * AppHeader Component
 * 
 * This component represents the navigation bar for the application, handling user authentication,
 * display settings (dark mode, colorblind mode), and a side panel for additional user options.
 */
function AppHeader() {
    /** Controls the visibility of the settings side panel */
    const { isAuthenticated, login, logout } = useAuth();
    const avatarUrl = useAvatarUrl();

    const [isOpen, setIsOpen] = useState(false);
    const onDialogClose = useCallback(() => setIsOpen(false), []);
    const onDialogOpen = useCallback(() => setIsOpen(true), []);

    /** Colorblind mode toggle state */
    const [colorblindMode, setColorblindMode] = useState(false); // TODO: Implement colorblind mode functionality
    const onToggleColorblindMode = useCallback(() => {
        setColorblindMode((colorblindMode) => !colorblindMode);
    }, [colorblindMode]);

    /** Dark mode toggle state */
    const [darkMode, setDarkMode] = useState(false); // TODO: Implement dark mode functionality
    const onToggleDarkMode = useCallback(() => {
        setDarkMode((darkMode) => !darkMode);
    }, []);


    const handleLogout = useCallback(() => {
        logout();
        setIsOpen(false);
    }, []);

    const handleLogin = useCallback(() => {
        redirectLogin();
    }, [])

    const loginOrAvatar = isAuthenticated ?
        (
            <Box onClick={onDialogOpen}>
                {avatarUrl ?
                    <Avatar src={avatarUrl} />
                    :
                    <SkeletonAvatar />
                }
            </Box>
        )
        :
        (
            <Button onClick={handleLogin}>Login</Button>
        );

    return (
        <>
            {/* Application header section */}
            <Header aria-label="nav bar">
                <Header.Item>
                    <ImageIcon size={32} />
                </Header.Item>
                <Header.Item full>
                    <span>VisFork</span> {/* Application title */}
                </Header.Item>

                <Header.Item>
                    {loginOrAvatar}
                </Header.Item>
            </Header>

            {/* Side panel for user settings, opens when 'isOpen' is true */}
            {isOpen && (
                <Dialog title="Settings" onClose={onDialogClose} position={"right"} width="small">
                    <ActionList
                        items={[
                            { text: "Colorblind mode", onClick: onToggleColorblindMode, selected: colorblindMode },
                            {
                                text: darkMode ? "Light mode" : "Dark mode", onClick: onToggleDarkMode,
                                leadingVisual: darkMode ? SunIcon : MoonIcon
                            },
                            ActionList.Divider,
                            /** Logout option: clears user data and session storage */
                            { text: "Sign out", onClick: handleLogout, variant: "danger" },
                        ]}
                    />
                </Dialog>
            )}
        </>
    );
}

export default AppHeader;
