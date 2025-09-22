import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: ["dist", "node_modules", "*.config.js"],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Healthcare Dashboard Specific Rules
      // Custom rules for hospital dashboard
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "log"] }], // Allow console.log during development
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",

      // Import/Export rules with yellow underlines for unused imports
      "import/no-unused-modules": "warn",
      "import/no-unresolved": "off", // Handled by bundler

      // React specific rules
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Disable for now, can enable later with TypeScript
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Accessibility rules (critical for healthcare applications)
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/click-events-have-key-events": "warn", // Relaxed to warning
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/no-static-element-interactions": "warn", // Relaxed to warning

      // Import rules
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-unused-modules": "warn",
      "import/no-unresolved": "off", // Handled by bundler

      // Unused imports - show as warnings with yellow underlines
      "import/no-duplicates": "warn",
      "import/no-extraneous-dependencies": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx"],
        },
      },
    },
  },
];
