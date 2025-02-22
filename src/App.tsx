import AppHeader from "./Components/AppHeader";
import { useEffect, useState } from "react";
import DataComponents from "@Components/DataComponents";
import { SplitPageLayout } from "@primer/react";

interface User {
  login: string;
  id: number;
  avatar_url:string;
}
function App() {
  const [user, setUser] = useState<User | null> (null);

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
                <AppHeader user = {user} setUser={setUser}/>
            </SplitPageLayout.Header>
    
            <DataComponents/>

            <SplitPageLayout.Footer aria-label="Footer">
                <div>Footer</div>
            </SplitPageLayout.Footer>
        </SplitPageLayout>
    );
}

export default App; 