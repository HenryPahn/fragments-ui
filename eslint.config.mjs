import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        process: 'readonly', // Inform ESLint that 'process' is a global variable
      },
    }
  },
  pluginJs.configs.recommended,
];