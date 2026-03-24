const globals = require("globals");
const pluginReact = require("eslint-plugin-react");
const pluginReactHooks = require("eslint-plugin-react-hooks");
const pluginReactNative = require("eslint-plugin-react-native");
const pluginImport = require("eslint-plugin-import");
const tseslint = require("typescript-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.expo/**",
      "**/web-build/**",
      "**/src/algorithms/sha1.js",
      "**/src/algorithms/passhash.js",
    ],
  },

  // Base config for all files
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2022,
      },
    },
    rules: {
      semi: ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
      quotes: ["error", "double", { avoidEscape: true }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // JavaScript-specific config
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // TypeScript/React Native config
  ...tseslint.config(
    {
      files: ["**/*.{ts,tsx}"],
    },
    {
      files: ["**/*.{ts,tsx}"],
      extends: [
        pluginReact.configs.flat.recommended,
        pluginReact.configs.flat["jsx-runtime"],
      ],
    },
    eslintConfigPrettier,
    {
      files: ["**/*.{ts,tsx}"],
      plugins: {
        "react-hooks": pluginReactHooks,
        "react-native": pluginReactNative,
        import: pluginImport,
        "@typescript-eslint": tseslint.plugin,
      },
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project: "./tsconfig.json",
          tsconfigRootDir: __dirname,
        },
        globals: {
          ...globals.browser,
          ...globals.es2022,
        },
      },
      rules: {
        // TypeScript strict type requirements
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-argument": "off",

        // Semi and comma rules (use base ESLint rules, not TS prefixed)
        semi: ["error", "always"],
        "comma-dangle": ["error", "always-multiline"],

        // Quotes (use base ESLint rules, not TS prefixed)
        quotes: ["error", "double", { avoidEscape: true }],

        // Import sorting
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
              "object",
              "type",
            ],
            "newlines-between": "always",
            alphabetize: {
              order: "asc",
              caseInsensitive: true,
            },
          },
        ],

        // React
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "react-native/no-inline-styles": "warn",
      },
      settings: {
        react: {
          version: "detect",
        },
      },
    },
  ),
];
