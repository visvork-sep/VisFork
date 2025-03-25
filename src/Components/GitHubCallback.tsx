import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@primer/react";
import { useAuth } from "@Providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { paths } from "@generated/auth-schema";
import createClient from "openapi-fetch";
import { AUTH_URL } from "@Utils/Constants";
import { useEffect } from "react";

const fetchClient = createClient<paths>({
    baseUrl: AUTH_URL
});

/**
 * GitHubCallback Component
 *
 * Handles GitHub OAuth callback, exchanges the authorization code for an access token,
 * stores it, and redirects the user.
 */
function GitHubCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const code = searchParams.get("code");
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

    useEffect(() => {
        if (isSuccess && data?.data?.accessToken) {
            login(data.data.accessToken);
            navigate("/");
        }
    }, [isSuccess, data, login, navigate]);

    if (isPending) {
        return <Spinner />;
    }

    if (!isSuccess || !data?.data?.accessToken) {
        return <div>Error: Authentication failed. Please try again.</div>;
    }

    return null; // No need to render anything since user will be redirected.
}

export default GitHubCallback;
