import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {ignores: ["dist/", "node_modules/", "__generated__/"]},
    {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
    {languageOptions: { globals: globals.browser }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    pluginReact.configs.flat.recommended,
    {
        rules: {
            "eol-last": ["warning", "always"],
            "quotes": ["warning", "double", {}],
            "no-irregular-whitespace": ["warning"],
            "semi": ["warning", "always"],
            "max-len": ["warning", { code: 120, tabWidth: 4 }],
            "indent": ["warning", 4, { SwitchCase: 1 }],
            "react/jsx-indent": ["warning", 4],
            "react/jsx-indent-props": ["warning", 4],
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
