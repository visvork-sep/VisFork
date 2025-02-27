import {BACKEND_URL} from "../Components/Configuration/Configuration";

export async function fetchUser() {
    const response = await fetch(`${BACKEND_URL}/auth/user`, {
        credentials: "include",
    });
    return response.ok ? response.json() : null;
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