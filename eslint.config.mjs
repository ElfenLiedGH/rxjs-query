// @ts-check

import eslint from "@eslint/js";
import { importX } from "eslint-plugin-import-x";
import { defineConfig } from "eslint/config";

import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked, {
    languageOptions: {
      parserOptions: {
        projectService: true
      }
    }
  },
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    ignores: ["dist", "node_modules"]
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    settings: {
    },
    plugins: {
      prettier
    },
    rules: {
      "import-x/no-cycle": ["error", { maxDepth: Infinity }],
      "import-x/no-nodejs-modules": "warn",
      curly: [2, "all"],
      "arrow-body-style": ["error", "as-needed"],
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto"
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_"
        }
      ],
      "import-x/no-unresolved": "off",
      "import-x/order": [
        // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "type",
            "object",
            "unknown"
          ],
          pathGroups: [
            {
              pattern: "@{**/**,**}",
              group: "internal"
            }
          ],
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          },
          warnOnUnassignedImports: true,
          pathGroupsExcludedImportTypes: ["builtin"]
        }
      ]
    }
  }
);
