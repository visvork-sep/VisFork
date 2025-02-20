import { ImageIcon } from "@primer/octicons-react";
import { Avatar, Box, Button, Header } from "@primer/react";
import React, { useState } from "react";



function AppHeader() {
    const [user, setUser] = useState(null);

    const handleLogin = () => {
        // Redirect user to the GitHub OAuth login
        fetch("https://github.com/login/oauth/authorize", {method: "GET", body: JSON.stringify({client_id: 'Ov23litxFPn7VKcZSWSH'})});
    }

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