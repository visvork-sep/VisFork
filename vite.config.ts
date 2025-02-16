import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
        scss: {
            api: "modern-compiler", 
            // SASS deprecated some things that bootstrap hasnt patched yet (even in the latest release!)
            // so this line is only meant to keep the terminal clean of warnings related to third-party code
            silenceDeprecations: ["mixed-decls", "color-functions", "global-builtin", "import"]
        }
    }
},
});
