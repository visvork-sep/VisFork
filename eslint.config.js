import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import "eslint-plugin-only-warn";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { ignores: ["dist/", "node_modules/", "__generated__/", ".contrib/"] },
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    pluginReact.configs.flat.recommended,
    {
        rules: {
            "max-lines": ["error", {"max": 400, "skipBlankLines": true, "skipComments": true}],
            "complexity": ["warn", { "max": 10 }],
            "eol-last": ["warn", "always"],
            "quotes": ["warn", "double", {}],
            "no-irregular-whitespace": ["warn"],
            "semi": ["warn", "always"],
            "max-len": ["warn", { code: 120, tabWidth: 4 }],
            "indent": ["warn", 4, { SwitchCase: 1 }],
            "react/jsx-indent": ["warn", 4],
            "react/jsx-indent-props": ["warn", 4],
            "react/react-in-jsx-scope": "off" // Ignore "React must be in scope" rule
        }
    },
    {
        settings: {
            react: {
                version: "detect",
            },
        },
    }
];
