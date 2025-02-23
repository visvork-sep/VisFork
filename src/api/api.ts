export async function fetchUser() {
    const response = await fetch(`${process.env.BACKEND_URL}/auth/user`, {
        credentials: "include",
    });
    return response.ok ? response.json() : null;
}

export async function logoutUser() {
    return fetch(`${process.env.BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
}

export async function loginUser() {
    window.location.href = `${process.env.BACKEND_URL}/auth/github`;
}