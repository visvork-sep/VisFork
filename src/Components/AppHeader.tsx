import { ImageIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { Avatar, Box, Button, Dialog, Header } from "@primer/react";
import { ActionList } from "@primer/react/deprecated";
import { useCallback, useState } from "react";

//Interface to store the impotant data that comes form App.tsx
interface User {
    login: string;
    id: number;
    avatar_url: string;
}

//Define exparcted data for components
interface AppHeaderProps {
    user: User | null; //Logged in user or null if user is logged out
    //User state update. Log in or out for the user.
    setUser: React.Dispatch<React.SetStateAction<User | null>>;

}


function AppHeader( {user, setUser}:  AppHeaderProps) {
    
    //Redirects to github login page
    const handleLogin = () => {
        window.location.href = "http://localhost:5000/auth/github";
    };
    
    //Logs user out, and deletes user data.
    const handleLogout = () => {
        fetch("http://localhost:5000/auth/logout", { method: "POST", credentials: "include" })
            .then(() => {setUser(null); window.location.reload()}); // Reload to reset session
    };

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
                    {user !== null ? ( /** If user has data than update the user profile. */
                        <Box onClick={onDialogOpen}> 
                            <Avatar src= {user.avatar_url} size={24}/> 
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