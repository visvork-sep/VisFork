import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BACKEND_URL } from "./Configuration/Configuration";
import { useFetchClient } from "./hooks/useFetchClient"; // Adjust path as needed

/**
 * GitHubCallback Component
 * 
 * This component handles the GitHub OAuth callback process. It extracts the authorization
 * code from the URL, exchanges it for an access token via the backend, and stores the
 * token in session storage before redirecting the user to the home page.
 */
function GitHubCallback() {
    const [searchParams] = useSearchParams(); // Retrieve query parameters
    const code = searchParams.get("code"); // Extract GitHub OAuth authorization code
    const navigate = useNavigate(); // React Router navigation function

    const fetchClient = useFetchClient(); // Custom fetch hook instance
    // Destructure the POST method from your custom hook
    const { loading, error } = useFetchClient();
    
    /**
     * useEffect to handle OAuth authentication when the component mounts.
     * If the authorization code is present, it sends a POST request to the backend
     * to exchange the code for an access token.
     */
    useEffect(() => {
        if (code) {
            fetchClient.POST<{ accessToken: string }>(`${BACKEND_URL}/auth/github/token`, { code })
                .then((data) => {
                    if (data.accessToken) {
                        sessionStorage.setItem("authToken", data.accessToken); // Store token in session
                        navigate("/"); // Redirect to home page
                    } else {
                        console.error("No accessToken in response:", data);
                    }
                })
                .catch((error) => console.error("OAuth Error:", error));
        }
    }, [code, navigate]);

    return (
        <>
            {loading && <p>Loading...</p>} {/* Display loading message while waiting for response */}
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if request fails */}
        </>
    );
}

export default GitHubCallback;
