/// <reference types="vitest"/>
/// <reference types="vite/client"/>

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        include: ["**/*.test.*"],
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/vitest.setup.ts"],
        css: true,
        coverage: {
            reporter: ["text", "lcov"],
            reportsDirectory: "../coverage",
            exclude: [
                "Types/**",
                "Queries/**",
                "**/*.d.ts",
                "**/*.js",
                "**/*.json",
                "**/*.css",
                "**/*.scss",
                "**/*.html",
                "**/*.md",
                "main.tsx",
            ],
        },
        root: "./src",
        exclude: [
            "Types/**", // Exclude Types folder,
            "Queries/**", // Exclude Queries folder,
            "**/*.d.ts", // Exclude TypeScript declaration files
            "**/*.js", // Exclude JavaScript files
            "**/*.json", // Exclude JSON files
            "**/*.css", // Exclude CSS files
            "**/*.scss", // Exclude SCSS files
            "**/*.html", // Exclude HTML files
            "**/*.md", // Exclude Markdown files
        ],
    },
    server: {
        watch: {
            usePolling: true
        }
    }
});
