import { ImageIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { Avatar, Box, Button, Dialog, Header } from "@primer/react";
import { ActionList } from "@primer/react/deprecated";
import { useCallback, useEffect, useState } from "react";
import { logoutUser, loginUser } from "../api/api";
import { useFetchClient } from "./hooks/useFetchClient"; // Adjust path as needed
import { BACKEND_URL } from "./Configuration/Configuration";

export interface GitHubUser {
    avatarUrl: string; // User's profile picture URL
}

/**
 * AppHeader Component
 * 
 * This component represents the navigation bar for the application, handling user authentication,
 * display settings (dark mode, colorblind mode), and a side panel for additional user options.
 */
function AppHeader() {
    const fetchClient = useFetchClient();
    
    /** Stores the avatar URL of the logged-in user */
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
    
    /** Controls the visibility of the settings side panel */
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

    /** 
     * Fetch user authentication data from the URL and API.
     * If a token is found in the URL parameters, it is stored in session storage.
     * Then, user data is fetched and the avatar URL is updated if available.
     */
    useEffect(() => {
        const token = sessionStorage.getItem("authToken");
        if (!token) return;
        fetchClient.POST<GitHubUser>(`${BACKEND_URL}/auth/user`, { accessToken: token })
            .then((userData) => {
                if (userData.avatarUrl) {
                    setAvatarUrl(userData.avatarUrl);
                } else {
                    console.error("No avatarUrl found in response.");
                }
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
                sessionStorage.removeItem("authToken");
            });
    }, []);
    
    /**
     * Redirects user to GitHub login page.
     */
    const handleLogin = () => {
        loginUser();
    };
    
    /**
     * Logs the user out by clearing session data and closing the settings panel.
     */
    const handleLogout = () => {
        logoutUser().then(() => {
            setAvatarUrl(undefined);
        });
        setIsOpen(false);
    };// Trigger the rest of the application
    
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
                    {avatarUrl ? ( 
                        /** If the user is logged in, display their profile avatar */
                        <Box onClick={onDialogOpen}> 
                            <Avatar src={avatarUrl} size={24} /> 
                        </Box>
                    ) : (
                        /** If no user is logged in, show the login button */
                        <Button onClick={handleLogin}>Log in</Button>
                    )}
                </Header.Item>
            </Header>

            {/* Side panel for user settings, opens when 'isOpen' is true */}
            {isOpen && (
                <Dialog title="Settings" onClose={onDialogClose} position={"right"} width="small">
                    <ActionList 
                        items={[
                            {text: "Colorblind mode", onClick: onToggleColorblindMode, selected: colorblindMode},
                            {text: darkMode ? "Light mode" : "Dark mode", onClick: onToggleDarkMode,
                                leadingVisual: darkMode ? SunIcon : MoonIcon},
                            ActionList.Divider,
                            /** Logout option: clears user data and session storage */
                            {text: "Sign out", onClick: handleLogout, variant: "danger"}, 
                        ]}
                    />
                </Dialog>
            )}
        </>
    );
}

export default AppHeader;
