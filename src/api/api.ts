import { BACKEND_URL } from "../Components/Configuration/Configuration";

// Define an interface for the GitHub user data.
export interface GitHubUser {
    avatar_url: string; // User's profile picture URL
}

/**
 * Logs out the user by making a request to the backend logout endpoint.
 * @returns {Promise<Response>} - A Promise resolving to the response of the fetch request.
 */
export async function logoutUser() {
    sessionStorage.removeItem("authToken"); // Remove the token
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
