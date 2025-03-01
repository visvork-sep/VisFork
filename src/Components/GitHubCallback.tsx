import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@primer/react";
import { useAuth } from "@Providers/AuthProvider";
import { useExchangeAccessToken } from "@Utils/Auth";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { paths } from "@generated/auth-schema";
import createClient from "openapi-fetch";
import { AUTH_URL } from "@Utils/Constants";


const fetchClient = createClient<paths>({
    baseUrl: AUTH_URL
});

/**
 * GitHubCallback Component
 * 
 * This component handles the GitHub OAuth callback process. It extracts the authorization
 * code from the URL, exchanges it for an access token via the backend, and stores the
 * token in session storage before redirecting the user to the home page.
 */
function GitHubCallback() {
    const [searchParams] = useSearchParams(); // Retrieve query parameters
    const navigate = useNavigate(); // React Router navigation function
    const code = searchParams.get("code"); // Extract GitHub OAuth authorization code
    const { isAuthenticated, login } = useAuth();


    const { isSuccess, isPending, data } = useQuery({
        queryKey: ["Login"],
        queryFn: async () => {
            return fetchClient.GET("/auth/github/token", {
                params: { query: { code: code || "" } }
            });
        },
        gcTime: 0,
        enabled: !!code && !isAuthenticated
    });

    if (isPending) {
        return <Spinner />
    }

    if (isSuccess) {
        const accessToken = data.data?.accessToken;

        if (accessToken) {
            login(accessToken);
            navigate("/");
        }
    }

    return (
        <>
            An error has occurred
        </>
    );
}

export default GitHubCallback;
