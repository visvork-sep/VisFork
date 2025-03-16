import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_URL } from "@Utils/Constants";

/**
 * GitHubLogout Component
 *
 * This component automatically revokes the OAuth token on mount and logs out the user.
 */
function GitHubLogout() {
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/"); // Redirect to home if no token is found
            return;
        }

        // Revoke the token by calling the backend logout endpoint
        fetch(`${AUTH_URL}/auth/github/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ accessToken })
        })
            .then(() => {
                // Clear token from storage
                localStorage.removeItem("accessToken");
                sessionStorage.removeItem("accessToken");

                // Redirect to home after logout
                navigate("/");
            })
            .catch((error) => {
                console.error("Logout failed:", error);
                navigate("/");
            });

    }, [navigate]);

    return <div>Logging out...</div>; // Display a message while logging out
}

export default GitHubLogout;
