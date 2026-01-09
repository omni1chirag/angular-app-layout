// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@typescript-eslint/no-explicit-any": ["error"],
      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/no-unused-expressions": ["error"],
      "@angular-eslint/no-output-on-prefix": ["error"],

      "@typescript-eslint/no-empty-function": ["error"],
      "@typescript-eslint/no-unsafe-function-type": ["error"],

      "@typescript-eslint/explicit-module-boundary-types": ["error"],
      "@angular-eslint/prefer-inject": ["error"],
      "no-console": ["warn", { "allow": ["warn", "error", "debug"] }],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/eqeqeq": ["error"],
      "@angular-eslint/template/interactive-supports-focus": ["error"],
      "@angular-eslint/template/click-events-have-key-events": ["error"],
      "@angular-eslint/template/elements-content": ['off'],
    },
  }
);
