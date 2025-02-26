import { useState } from "react";

/**
 * Custom hook for handling API requests with authentication support.
 * Provides GET, POST, PUT, and DELETE methods with error handling and loading state management.
 */
export const useFetchClient = () => {
    // Retrieve authentication token from session storage
    const authToken: string | null = sessionStorage.getItem("authToken");
    
    // State variables to manage loading status and error handling
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Handles HTTP requests with the specified method and optional request body.
     * 
     * @template T - Expected response type.
     * @param {string} url - The endpoint URL.
     * @param {"GET" | "POST" | "PUT" | "DELETE"} method - The HTTP method.
     * @param {object} [body] - Optional request body for POST and PUT requests.
     * @returns {Promise<T>} - A Promise resolving to the response data.
     */
    const request = async <T>(url: string, method: "GET" | "POST" | "PUT" | "DELETE", body?: object): Promise<T> => {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        
        // Include Authorization header if authToken is available
        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }

        const options: RequestInit = {
            method,
            headers,
        };

        // Include request body if provided
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json() as T;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        GET: <T = unknown>(url: string) => request<T>(url, "GET"),
        POST: <T = unknown>(url: string, body: object) => request<T>(url, "POST", body),
        PUT: <T = unknown>(url: string, body: object) => request<T>(url, "PUT", body),
        DELETE: <T = unknown>(url: string) => request<T>(url, "DELETE"),
        loading,
        error
    };
};
