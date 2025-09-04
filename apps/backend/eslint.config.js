import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node, // Node globals like process, __dirname
    },
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      "no-unused-vars": "warn", // show warnings for unused variables
      "no-console": "off", // allow console logs
      semi: ["error", "always"], // require semicolons
    },
  },
]);
