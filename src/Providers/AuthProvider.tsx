import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: PropsWithChildren) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for access token in session storage
        const token = getAccessToken();
        setIsAuthenticated(!!token);
    }, []);

    const login = useCallback((token: string) => {
        sessionStorage.setItem("access_token", token);
        setIsAuthenticated(true);
    }, [isAuthenticated]);

    const logout = useCallback(() => {
        sessionStorage.removeItem("access_token");
        setIsAuthenticated(false);
    }, [isAuthenticated]);

    const getAccessToken = useCallback(() => {
        return sessionStorage.getItem("access_token");
    }, [isAuthenticated]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, getAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

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
