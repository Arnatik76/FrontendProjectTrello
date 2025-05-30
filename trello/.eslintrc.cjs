module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "prettier",
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: ["react", "react-hooks", "jsx-a11y"],
    rules: {
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  };
  