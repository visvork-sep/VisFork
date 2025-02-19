import AppHeader from "@Components/AppHeader";
import React, { useEffect, useState } from "react";
import ApplicationBody from "@Components/ApplicationBody";
import Configuration from "@Components/Configuration/Configuration";
import { SplitPageLayout } from "@primer/react";


function App() {
  const [user, setUser] = useState(null);

    useEffect(() => {
        // Check URL for GitHub OAuth token
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
            // Fetch GitHub user data using the token
            fetch("https://api.github.com/user", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    setUser(data);
                    localStorage.setItem("token", token); // Store token for future sessions
                    window.history.replaceState({}, document.title, "/"); // Clean up URL
                });
        }
    }, []);
  return (
    <SplitPageLayout>
      <SplitPageLayout.Header aria-label="Header">
        <AppHeader/>
      </SplitPageLayout.Header>
      <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
        <Configuration/>
      </SplitPageLayout.Pane >
      <SplitPageLayout.Content aria-label="Content">
        <ApplicationBody/>
      </SplitPageLayout.Content>
      <SplitPageLayout.Footer aria-label="Footer">
        <div>Footer</div>
      </SplitPageLayout.Footer>
    </SplitPageLayout>
  );
}

export default App; 