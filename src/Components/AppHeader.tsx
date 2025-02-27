import { ImageIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { ActionMenu, Avatar, Box, Button, Dialog, Stack, useTheme } from "@primer/react";
import { ActionList } from "@primer/react/deprecated";
import { useCallback, useState } from "react";

function AppHeader() {
    const { colorMode, setColorMode, dayScheme, nightScheme, setDayScheme, setNightScheme } = useTheme();
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
            {/* <Header aria-label="nav bar" sx={{
                backgroundColor: "canvas.subtle",
                color: "black"
            }}> */}
            <Stack direction="horizontal" align="center">
                <Stack.Item>
                    <ImageIcon size={32} />
                </Stack.Item>
                <Stack.Item grow>
                    <span>VisFork</span>
                </Stack.Item>
                <Stack.Item>
                    {loggedIn ? (
                        <Box onClick={onDialogOpen}>
                            <Avatar src="https://avatars.githubusercontent.com/u/14032476?v=4" size={24} />
                        </Box>
                    ) : (
                        <Button onClick={onLogin} aria-label="Login button">
                            Log in
                        </Button>
                    )}

                </Stack.Item>
            </Stack>
            {/* <Header.Item>
                <ImageIcon size={32} />
            </Header.Item>
            <Header.Item full>
                <span>VisFork</span>
            </Header.Item>

            <Header.Item aria-label="Open settings dialog">
                {loggedIn ? (
                    <Box onClick={onDialogOpen}>
                        <Avatar src="https://avatars.githubusercontent.com/u/14032476?v=4" size={24} />
                    </Box>

                ) : (
                    <Button onClick={onLogin} aria-label="Login button">
                        Log in
                    </Button>
                )}
            </Header.Item> */}
            {/* </Header> */}

            {isOpen && (
                <Dialog title="Settings" onClose={onDialogClose} position={"right"} width="small">
                    <ActionMenu>
                        <ActionList
                            items={[
                                {
                                    text: "Colorblind mode", onClick: onToggleColorblindMode,
                                    selected: currentlyColorblindMode, "aria-label": "Toggle colrblind mode"
                                },
                                {
                                    text: currentlyDarkMode ? "Light mode" : "Dark mode", onClick: onToggleDarkMode,
                                    leadingVisual: currentlyDarkMode ? SunIcon : MoonIcon,
                                    "aria-label": "Toggle light mode"
                                },
                                ActionList.Divider,
                                {
                                    text: "Sign out", onClick: onLogout, variant: "danger",
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
