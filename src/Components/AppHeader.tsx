import { ImageIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { Avatar, Box, Button, Dialog, Header } from "@primer/react";
import { ActionList } from "@primer/react/deprecated";
import { useCallback, useState } from "react";

interface User {
    login: string;
    id: number;
    avatar_url: string;
}

interface AppHeaderProps {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}


function AppHeader( {user, setUser}:  AppHeaderProps) {
    

    const handleLogin = () => {
        window.location.href = "http://localhost:5000/auth/github";
    };
    
    const handleLogout = () => {
        fetch("http://localhost:5000/auth/logout", { method: "POST", credentials: "include" })
            .then(() => {setUser(null); window.location.reload()}); // Reload to reset session
    };

    const [isOpen, setIsOpen] = useState(false);
    const [colorblindMode, setColorblindMode] = useState(false); // todo implement colorblind mode
    const [darkMode, setDarkMode] = useState(false); // todo implement dark mode
    const onDialogClose = useCallback(() => setIsOpen(false), []);
    const onDialogOpen = useCallback(() => setIsOpen(true), []);    
    const onToggleColorblindMode = useCallback(() => {
        setColorblindMode((colorblindMode) => !colorblindMode)
    }, [colorblindMode]);    
    const ontoggleDarkMode = useCallback(() => {
        setDarkMode((darkMode) => !darkMode)
    }, []);
    /*
    const onLogin = useCallback(() => setLoggedIn(true), []);
    const onLogout = useCallback(() => {
        onDialogClose();
        setLoggedIn(false);
    }, []);*/
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
                    {user !== null ? (
                        <Box onClick={onDialogOpen}> 
                            <Avatar src= {user.avatar_url} size={24}/> 
                        </Box>
                        
                    ) : ( 
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
                            {text: "Sign out", onClick: handleLogout, variant: "danger"},
                        ]}>

                    </ActionList>
                </Dialog>
            )}
        </>
    );
}

export default AppHeader;