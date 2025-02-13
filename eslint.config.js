import js from "@eslint/js";
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      semi: ['error', 'always'],
      quotes: ['error', 'double'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)




// import { FlatCompat } from "@eslint/eslintrc";
// import { fileURLToPath } from "node:url";
// import globals from 'globals'
// import js from "@eslint/js";
// import path from "node:path";
// import reactHooks from 'eslint-plugin-react-hooks'
// import reactRefresh from 'eslint-plugin-react-refresh'
// import tsParser from "@typescript-eslint/parser";
// import tseslint from 'typescript-eslint'

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const compat = new FlatCompat({
//     baseDirectory: __dirname,
//     recommendedConfig: js.configs.recommended,
//     allConfig: js.configs.all
// });

// export default [
//     {
//         // Global ignores (isolated configuration)
//         ignores: ["dist/**"],
//     },
//     {
//         extends: [tseslint.configs.recommended],
//         languageOptions: {
//             parser: tsParser,
//             ecmaVersion: "latest",
//             globals: globals.browser
//         },
//         plugins: {
//             'react-hooks': reactHooks,
//             'react-refresh': reactRefresh,
//           },
//         rules: {
//             ...reactHooks.configs.recommended.rules,
//             semi: ["error", "always"],
//             quotes: ["error", "double"],
//             "@typescript-eslint/no-explicit-any": 1,
//             "@typescript-eslint/no-unused-vars": "warn",
//         },
//     },
    
// ];