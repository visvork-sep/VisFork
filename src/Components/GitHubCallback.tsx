import { useNavigate, useSearchParams } from "react-router-dom";
import createClient from "openapi-fetch";
import { Spinner } from "@primer/react";
import { useQuery } from "@tanstack/react-query";
import { paths } from "@generated/auth-schema";
import { useAuth } from "../Utils/AuthProvider";
import { AuthFetchClient } from "../Utils/Auth";
import { useEffect } from "react";


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

    useEffect(() => {
        if (isAuthenticated) {
            console.log("already logged in");
            navigate("/")
        }

        if (!code) {
            console.log("incorrect path route back");
            navigate("/");
        }
    }, [isAuthenticated, code, navigate])


    const params: paths["/auth/github/token"]["get"]["parameters"] = {
        query: {
            code: code!
        }
    }

    const { isSuccess, isPending, data } = useQuery({
        queryKey: ["Login"],
        queryFn: async () => {
            return AuthFetchClient.GET("/auth/github/token", {
                params: params
            });
        },
        gcTime: 0
    })

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
