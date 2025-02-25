import { ImageIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { Avatar, Box, Button, Dialog, Header } from "@primer/react";
import { ActionList } from "@primer/react/deprecated";
import { useCallback, useEffect, useState } from "react";
import { fetchUser, logoutUser, loginUser, GitHubUser } from "../api/api";


function AppHeader() {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    /**Sidepanel*/
    const [isOpen, setIsOpen] = useState(false);     
    const onDialogClose = useCallback(() => setIsOpen(false), []);
    const onDialogOpen = useCallback(() => setIsOpen(true), []);    
    
    /**Colorblind mode*/
    const [colorblindMode, setColorblindMode] = useState(false); // todo implement colorblind mode
    const onToggleColorblindMode = useCallback(() => {
        setColorblindMode((colorblindMode) => !colorblindMode)
    }, [colorblindMode]);   
    
    /**Dark mode*/
    const [darkMode, setDarkMode] = useState(false); // todo implement dark mode
    const ontoggleDarkMode = useCallback(() => {
        setDarkMode((darkMode) => !darkMode)
    }, []);


    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get("token");
        if (token) {
            // Store token (and avatarUrl if needed) in sessionStorage
            sessionStorage.setItem("authToken", token);
            // Remove token and other query parameters from the URL
            window.history.replaceState(null, "", window.location.pathname);
        }
        
        // Now fetch the GitHub user data using the helper from api.ts
        fetchUser().then((userData:GitHubUser | null) => {
            if (userData) {
                setAvatarUrl(userData.avatar_url);
            }
        });
    }, []);
    
    //Redirects to github login page
    const handleLogin = () => {
        loginUser();
    };
    //Logs user out, and deletes user data.
    const handleLogout = () => {
        logoutUser().then(() => {
            setAvatarUrl(null);
            sessionStorage.removeItem("authToken"); // Remove token on logout
        });
        setIsOpen(false);
    };
    
    return (
        <>
            <Header aria-label="nav bar">
                <Header.Item>
                    <ImageIcon size={32}/>
                </Header.Item>
                <Header.Item full>
                    <span>VisFork</span>
                </Header.Item>

                <Header.Item>
                    {avatarUrl ? ( /** If user has data than update the user profile. */
                        <Box onClick={onDialogOpen}> 
                            <Avatar src= {avatarUrl} size={24}/> 
                        </Box>
                        
                    ) : (  /**If user data is not present, keep the login button. */
                        <Button onClick={handleLogin}>
                            Log in
                        </Button>
                    )}
                </Header.Item>
            </Header>

            {isOpen && (
                <Dialog title="Settings" onClose={onDialogClose} position={"right"} width="small">
                    <ActionList 
                        items={[
                            {text: "colorblind mode", onClick: onToggleColorblindMode, selected: colorblindMode},

                            {text: darkMode ? "light mode" :"dark mode", onClick: ontoggleDarkMode,
                                leadingVisual: darkMode ? SunIcon : MoonIcon},
                            ActionList.Divider,
                            /**Use handle logout to delete user data and destroy session. */
                            {text: "Sign out", onClick: handleLogout, variant: "danger"}, 
                        ]}>
                    </ActionList>
                </Dialog>
            )}
        </>
    );
}

export default AppHeader;