import { BaseStyles, Box, ThemeProvider } from "@primer/react";
//import { StrictMode } from "react"; <- causes duplicat data sending between 
// App.tsx and AppHeader.tsx. Uncomment if this is not a problem and you need this.
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";



createRoot(document.getElementById("root")!).render(
    //<StrictMode>
    <ThemeProvider colorMode="auto">
        <BaseStyles>
            <Box className="body">
                <App/>
            </Box>
        </BaseStyles>
    </ThemeProvider>
    //</StrictMode>
);
