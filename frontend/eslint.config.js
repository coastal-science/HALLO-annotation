import eslintReact from "eslint-plugin-react";

/*
  This file is needlessly complicated as eslint undergoes
  changes to their config API

  https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new

  Updates to eslint-plugin-react and vscode-eslint are around the corner
*/

const baseRules = {
  "indent": ["error", 2],
  "linebreak-style": ["error", "unix"],
  "no-unused-vars": ["warn", {
    "argsIgnorePattern": "_$",
    "varsIgnorePattern": "_$",
    "caughtErrorsIgnorePattern": "_$"
  }],
  "quotes": ["error", "double"],
  "semi": ["error", "always"],
};

const js = {
  files: ["**/*.js"],
  linterOptions: {
    noInlineConfig: true,
    reportUnusedDisableDirectives: true
  },
  rules: baseRules
};

const jsx = {
  files: ["**/*.jsx"],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      jsxPragma: null,
    },
  },
  plugins: {
    react: eslintReact
  },
  rules: {
    ...baseRules,
    ...eslintReact.configs["recommended"].rules,
    // "react/display-name": 2,
    // "react/jsx-key": 2,
    // "react/jsx-no-comment-textnodes": 2,
    // "react/jsx-no-duplicate-props": 2,
    // "react/jsx-no-target-blank": 2,
    // "react/jsx-no-undef": 2,
    // "react/jsx-uses-react": 2,
    // "react/jsx-uses-vars": 2,
    // "react/no-children-prop": 2,
    // "react/no-danger-with-children": 2,
    // "react/no-deprecated": 2,
    // "react/no-direct-mutation-state": 2,
    // "react/no-find-dom-node": 2,
    // "react/no-is-mounted": 2,
    // "react/no-render-return-value": 2,
    // "react/no-string-refs": 2,
    // "react/no-unescaped-entities": 2,
    // "react/no-unknown-property": 2,
    // "react/no-unsafe": 0,
    // "react/prop-types": 2,
    // "react/react-in-jsx-scope": 2,
    // "react/require-render-return": 2,

    ...eslintReact.configs["jsx-runtime"].rules,
    // "react/react-in-jsx-scope": 0,
    // "react/jsx-uses-react": 0,

    // overrides
    "react/prop-types": 0,
  }
};

export default [js, jsx];
