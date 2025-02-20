import { BaseStyles, Box, ThemeProvider } from "@primer/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BaseStyles>
        <Box className="body">
          <App/>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  </StrictMode>
);
