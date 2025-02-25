import {BACKEND_URL} from "../Components/Configuration/Configuration";
// Define an interface for the GitHub user data.
export interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
    name?: string;
  }

export async function fetchUser() {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
        return null;
    }
    try {
        const response = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch GitHub user data");
        }
        const data : GitHubUser = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching GitHub user profile", error);
        return null;
    }
}
    

export async function logoutUser() {
    const token = sessionStorage.getItem("authToken");
    return fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
}

export async function loginUser() {
    window.location.href = `${BACKEND_URL}/auth/github`;
}

/* EXAMPLE FOR QUERY TEAM
export async function authenticatedRequest() {
    const token = sessionStorage.getItem("authToken"); // Retrieve token

    const response = await fetch(`${BACKEND_URL}/some-protected-route`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`, // Attach token
            "Content-Type": "application/json"
        },
        credentials: "include"
    });

    return await response.json();
}*/