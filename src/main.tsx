import { BaseStyles, Box, ThemeProvider } from "@primer/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const rootElement = document.getElementById("root");
const queryClient = new QueryClient();

if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <ThemeProvider>
                <BaseStyles>
                    <QueryClientProvider client={queryClient}>
                        <Box className="body">
                            <App />
                        </Box>
                    </QueryClientProvider>
                </BaseStyles>
            </ThemeProvider>
        </StrictMode>
    );
} else {
    console.error("Root element not found");
}

