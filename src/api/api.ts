import { BACKEND_URL } from "../Components/Configuration/Configuration";

// Define an interface for the GitHub user data.
export interface GitHubUser {
    login: string; // GitHub username
    id: number; // GitHub user ID
    avatar_url: string; // User's profile picture URL
    name?: string; // Optional full name of the user
}

/**
 * Fetches the authenticated user's GitHub profile data from the GitHub API.
 * @returns {Promise<GitHubUser | null>} - The GitHub user data or null if authentication fails.
 */
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
        const data: GitHubUser = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching GitHub user profile", error);
        return null;
    }
}

/**
 * Logs out the user by making a request to the backend logout endpoint.
 * @returns {Promise<Response>} - A Promise resolving to the response of the fetch request.
 */
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

/**
 * Initiates the GitHub OAuth login process by redirecting the user to the backend authentication route.
 */
export async function loginUser() {
    window.location.href = `${BACKEND_URL}/auth/github`;
}

/**
 * Example function for making an authenticated API request to a protected route.
 * @returns {Promise<any>} - The JSON response from the API request.
 */
/*
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
