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
            "quotes": ["error", "double", {}],
            "linebreak-style": ["error", "windows"],
            "no-irregular-whitespace": ["error"],
            "semi": ["error", "always"],
            "max-len": ["error", { code: 120, tabWidth: 4 }],
            "indent": ["error", 4, { SwitchCase: 1 }],
            "react/jsx-indent": ["error", 4],
            "react/jsx-indent-props": ["error", 4],
            "react/react-in-jsx-scope": "off" // Ignore "React must be in scope" rule
        }
    }
];