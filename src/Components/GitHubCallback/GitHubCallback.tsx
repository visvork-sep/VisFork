import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@primer/react";
import { useAuth } from "@Providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { paths } from "@generated/auth-schema";
import createClient from "openapi-fetch";
import { AUTH_URL } from "@Utils/Constants";
import { useEffect } from "react";

/**
 * Creates a typed OpenAPI fetch client.
 * @constant
 */
const fetchClient = createClient<paths>({
    baseUrl: AUTH_URL
});

/**
 * GitHubCallback Component
 *
 * Handles GitHub OAuth callback by:
 * 1. Reading the authorization code (or error) from the query string.
 * 2. Exchanging that code for an access token (using fetchClient).
 * 3. If successful, storing the token and navigating home.
 * 4. Otherwise, navigating home with an error state so a popup can be displayed.
 */
function GitHubCallback() {

    //Reads the URL query parameters for "code" (successful auth) or "error_description" (canceled or failed auth).
    const [searchParams] = useSearchParams();  
    //The React Router function for programmatic navigation.   
    const navigate = useNavigate();
    //GitHub returns the OAuth "code" here upon success; if null, the user denied access.
    const code = searchParams.get("code");
    //Description of any OAuth error that occurred (e.g., user canceled).
    const errorDescription = searchParams.get("error_description"); 
    //Global authentication context; contains methods to detect login status and log in/out.
    const { isAuthenticated, login } = useAuth();

    //Effect to detect if the "code" param is missing or empty.
    //If so, user canceled GitHub auth; navigate back to "/" with an error state. 
    useEffect(() => {
        if (!code) {
            // Pass the error description so we can show it in a popup later
            const errorDescription = searchParams.get("error_description");
            navigate("/", {
                state: {
                    fromError: true,
                    errorDescription: errorDescription ?? "Authentication was canceled."
                }
            });
        }
    }, [code, navigate, errorDescription]);

    //Queries our backend for an access token (if we got a "code" and aren't already authenticated).
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
    //If we obtained a valid token from the backend, store it and redirect home.
    useEffect(() => {
        if (isSuccess && data?.data?.accessToken) {
            login(data.data.accessToken);
            navigate("/");
        }
    }, [isSuccess, data, login, navigate]);
    // While we’re pending, show a loading spinner
    if (isPending) {
        return <Spinner />; //You spin my head right round
    }
    // If our token request didn't succeed or is empty, show an error
    if (!isSuccess || !data?.data?.accessToken) {
        return <div>Error: Authentication failed. Please try again.</div>;
    }

    return null; // No need to render anything since user will be redirected.
}

export default GitHubCallback;
