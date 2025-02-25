import {BACKEND_URL} from "../Components/Configuration/Configuration";

export async function fetchUser() {
    const response = await fetch(`${BACKEND_URL}/auth/user`, { credentials: "include" });
    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.token) {
        sessionStorage.setItem("authToken", data.token); // Store token in sessionStorage
    }

    return data;
}


export async function logoutUser() {
    return fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
}

export async function loginUser() {
    window.location.href = `${BACKEND_URL}/auth/github`;
}

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
}