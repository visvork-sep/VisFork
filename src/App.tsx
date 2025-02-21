import AppHeader from "./Components/AppHeader";
import React, { useEffect, useState } from "react";
import ApplicationBody from "@Components/ApplicationBody";
import Configuration from "@Components/Configuration/Configuration";
import { SplitPageLayout } from "@primer/react";


function App() {
  const [user, setUser] = useState(null);

    useEffect(() => {
       // Fetch user data from backend (token is stored in session)
        fetch("http://localhost:5000/auth/user", {
            credentials: "include", // Include session cookies
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setUser(null); // Not authenticated
                } else {
                    console.log("🔑 User Data from Backend:", data); // Log user session data
                    setUser(data); // Set user data
                }
            });
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