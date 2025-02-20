import { ImageIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { Avatar, Box, Button, Dialog, Header, useTheme } from "@primer/react";
import { ActionList } from "@primer/react/deprecated";
import { useCallback, useState } from "react";


function AppHeader() {
    const {colorMode, setColorMode} = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false); // TODO: Implement login
    const [colorblindMode, setColorblindMode] = useState(false); // todo implement colorblind mode


    const onDialogClose = useCallback(() => setIsOpen(false), []);
    const onDialogOpen = useCallback(() => setIsOpen(true), []);
    const onLogin = useCallback(() => setLoggedIn(true), []);
    const onLogout = useCallback(() => {
        onDialogClose();
        setLoggedIn(false);
    }, []);

    const onToggleColorblindMode = useCallback(() => {
        setColorblindMode((colorblindMode) => !colorblindMode)
    }, [colorblindMode]);

    const currentlyDarkMode = colorMode === "dark" || colorMode === "night";
    const onToggleDarkMode = useCallback(() => {
        const newMode = currentlyDarkMode ? "day" : "dark";
        setColorMode(newMode);
    }, [currentlyDarkMode]);

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
                    {loggedIn ? (
                        <Box onClick={onDialogOpen}> 
                            <Avatar src="https://avatars.githubusercontent.com/u/14032476?v=4" size={24}/> 
                        </Box>
                        
                    ) : ( 
                        <Button onClick={onLogin}>
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

                            {text: currentlyDarkMode ? "light mode" :"dark mode", onClick: onToggleDarkMode,
                                leadingVisual: currentlyDarkMode ? SunIcon : MoonIcon},
                            ActionList.Divider,
                            {text: "Sign out", onClick: onLogout, variant: "danger"},
                        ]}>

                    </ActionList>
                </Dialog>
            )}
        </>
    );
}

export default AppHeader;