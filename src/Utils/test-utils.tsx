import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BaseStyles, Box, ThemeProvider } from "@primer/react"; // Adjust as needed

const queryClient = new QueryClient();

const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <StrictMode>
            <ThemeProvider>
                <BaseStyles>
                    <QueryClientProvider client={queryClient}>
                        <Box className="body">{children}</Box>
                    </QueryClientProvider>
                </BaseStyles>
            </ThemeProvider>
        </StrictMode>
    );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
    render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from Testing Library
export * from "@testing-library/react";

// Override render method
export { customRender as render };
