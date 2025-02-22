import AppHeader from "./Components/AppHeader";
import { useEffect, useState } from "react";
import DataComponents from "@Components/DataComponents";
import { SplitPageLayout } from "@primer/react";

//Interface to store the impotant data that comes form GitHub
interface User {
  login: string; //Username
  id: number; //User id number
  avatar_url:string; //Avatar picture url
}

function App() {
  //Create setUser to be callable. Alters user state.
  const [user, setUser] = useState<User | null> (null);
    //Fetch user data form the backend when it becomes visible and active
    useEffect(() => {
       // Fetch user data from backend (token is stored in session)
        fetch("http://localhost:5000/auth/user", {
            credentials: "include", // Include session cookies
        })
            .then((res) => res.json()) //convert to JSON format
            .then((data) => {
                if (data.error) {
                    setUser(null); // Not authenticated, no user found -> user = null
                } else {
                    console.log("🔑 User Data from Backend:", data); // Log user session data
                    setUser(data); // Set user data
                }
            });
    }, []);  
    
    //Sending data to AppHeader below
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