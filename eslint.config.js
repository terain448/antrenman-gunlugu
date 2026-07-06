import globals from "globals";
import reactPlugin from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,jsx}"],
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "react/jsx-uses-vars": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
