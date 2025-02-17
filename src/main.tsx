import { BaseStyles, Box, ThemeProvider } from "@primer/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { paths } from "@generated/rest-schema.js";
import App from "./App.tsx";
import "./index.css";
import createClient from "openapi-fetch";


/**
 * Queryclient for React-query calls
 */
const queryClient = new QueryClient();

const fetchClient = createClient<paths>({
  baseUrl: process.env.API_URL // TODO! add the correct URL
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider colorMode="auto">
      <BaseStyles>
        <QueryClientProvider client={queryClient}>
          <Box className="body">
            <App/>
          </Box>
        </QueryClientProvider>
      </BaseStyles>
    </ThemeProvider>
  </StrictMode>
);
