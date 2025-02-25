import {BACKEND_URL} from "../Components/Configuration/Configuration";

export async function fetchUser() {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
        return null;
    }
    const response = await fetch(`${BACKEND_URL}/auth/user`, { 
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
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