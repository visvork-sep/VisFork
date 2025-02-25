import { BaseStyles, Box, ThemeProvider } from "@primer/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <ThemeProvider>
                <BaseStyles>
                    <Box className="body" >
                        <App/>
                    </Box>
                </BaseStyles>
            </ThemeProvider>
        </StrictMode>
    );
} else {
    console.error("Root element not found");
}

