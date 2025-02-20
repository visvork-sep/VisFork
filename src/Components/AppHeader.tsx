import { ImageIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { ActionMenu, Avatar, Box, Button, Dialog, Header, useTheme } from "@primer/react";
import { ActionList } from "@primer/react/deprecated";
import { useCallback, useState } from "react";

function AppHeader() {
    const {colorMode, setColorMode, dayScheme, nightScheme, setDayScheme, setNightScheme} = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false); // TODO: Implement login


    const onDialogClose = useCallback(() => setIsOpen(false), []);
    const onDialogOpen = useCallback(() => setIsOpen(true), []);
    const onLogin = useCallback(() => setLoggedIn(true), []);
    const onLogout = useCallback(() => {
        onDialogClose();
        setLoggedIn(false);
    }, [onDialogClose]);


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
                    <ActionMenu>
                        <ActionList 
                            items={[
                                {text: "colorblind mode", onClick: onToggleColorblindMode, selected: currentlyColorblindMode},
                                {text: currentlyDarkMode ? "light mode" :"dark mode", onClick: onToggleDarkMode,
                                    leadingVisual: currentlyDarkMode ? SunIcon : MoonIcon},
                                ActionList.Divider,
                                {text: "Sign out", onClick: onLogout, variant: "danger"},
                            ]}>
                        </ActionList>
                    </ActionMenu>
                    
                    
                </Dialog>
            )}
        </>
    );
}

export default AppHeader;