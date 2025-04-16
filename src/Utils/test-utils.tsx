import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BaseStyles, Box, ThemeProvider } from "@primer/react";
import { AuthProvider } from "@Providers/AuthProvider";

/**
 * Create a new QueryClient instance for handling API calls caching and state.
 */
const queryClient = new QueryClient();

/**
 * Create a wrapper component that includes all necessary providers for testing
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeProvider colorMode="light" >
            <BaseStyles>
                <QueryClientProvider client={ queryClient }>
                    <AuthProvider>
                        <Box className="body" >
                            {children}
                        </Box>
                    </AuthProvider>
                </QueryClientProvider>
            </BaseStyles>
        </ThemeProvider>
    );
};

/**
 * Custom render function that wraps the component with all necessary providers,
 * simplifying tests setup.
 */
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
