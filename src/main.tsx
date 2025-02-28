import { BaseStyles, Box, ThemeProvider } from "@primer/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@Providers/AuthProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider colorMode="auto">
            <BaseStyles>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <Box className="body">
                            <App />
                        </Box>
                    </AuthProvider>
                </QueryClientProvider>
            </BaseStyles>
        </ThemeProvider>
    </StrictMode>
);

