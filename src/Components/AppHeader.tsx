import { ImageIcon } from "@primer/octicons-react";
import { Avatar, Box, Button, Header } from "@primer/react";
import React, { useState } from "react";

const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/github";
};


const handleLogout = () => {
    fetch("http://localhost:5000/auth/logout", { method: "POST", credentials: "include" })
        .then(() => window.location.reload()); // Reload to reset session
};

function AppHeader() {
    return (
        <Header aria-label="nav bar">
            <Header.Item>
                <ImageIcon size={32}/>
            </Header.Item>
            <Header.Item full>
                <span>VisFork</span>
            </Header.Item>
            <Header.Link>
                <Box mr={3}>
                    <Button onClick={handleLogin}>Sign in</Button>
                </Box>
            </Header.Link>
            <Header.Item>
                <Avatar src="https://avatars.githubusercontent.com/u/14032476?v=4" size={24}/>
            </Header.Item>
        </Header>
    );
}

export default AppHeader;