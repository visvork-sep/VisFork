import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";

/**
 * Defines the shape of the authentication context,
 * including current authentication state and functions to log in, log out, and get the access token.
 */
interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    getAccessToken: () => string | null;
}

/**
 * Create a context for authentication.
 * It is initialized as null and must be provided via AuthProvider.
 */
const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: PropsWithChildren) {
    // Track the user's authentication state.
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // On component mount, check session storage for an access token to determine auth state.
        const token = getAccessToken();
        setIsAuthenticated(!!token);
    }, []);

    // Stores the access token in session storage and sets auth state to true.
    const login = useCallback((token: string) => {
        sessionStorage.setItem("access_token", token);
        setIsAuthenticated(true);
    }, [isAuthenticated]);

    // Removes the access token from session storage and sets auth state to false.
    const logout = useCallback(() => {
        sessionStorage.removeItem("access_token");
        setIsAuthenticated(false);
    }, [isAuthenticated]);

    // Retrieves the access token from session storage.
    const getAccessToken = useCallback(() => {
        return sessionStorage.getItem("access_token");
    }, [isAuthenticated]);

    return (
        // Provide the authentication state and functions to all child components.
        <AuthContext.Provider value={{ isAuthenticated, login, logout, getAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to access the authentication context.
 * This hook ensures that the context is used within an AuthProvider.
 */
function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("Context must be used inside provider");
    }
    return context;
};

export {
    AuthProvider,
    useAuth,
};
export type { AuthContextType };
