module.exports = {
  root: true,
  plugins: ["@typescript-eslint", "import", "eslint-plugin-local-rules"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "@vue/eslint-config-prettier",
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: {
      ts: "@typescript-eslint/parser",
      "<template>": "espree",
    },
  },
  env: {
    browser: true,
    node: true,
  },
  settings: {
    "import/resolver": {
      typescript: true,
    },
  },
  rules: {
    "object-shorthand": 1,
    "import/no-duplicates": "error",
    "import/no-cycle": "error",
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
      },
    ],
    "import/no-restricted-paths": [
      "error",
      {
        zones: [
          {
            target: "./src/renderer/",
            from: "./src/main/",
            message: "renderer should not import main code",
          },
          {
            target: "./src/main/",
            from: "./src/renderer/",
            message: "main should not import renderer code",
          },
        ],
      },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", disallowTypeAnnotations: true, fixStyle: "separate-type-imports" },
    ],
    "@typescript-eslint/member-ordering": [
      "warn",
      {
        default: {
          memberTypes: [
            "public-static-field",
            "protected-static-field",
            "private-static-field",
            "public-static-method",
            "protected-static-method",
            "private-static-method",
            "public-instance-field",
            "protected-instance-field",
            "private-instance-field",
            "public-abstract-field",
            "protected-abstract-field",
            "public-constructor",
            "protected-constructor",
            "private-constructor",
            "public-instance-method",
            "protected-instance-method",
            "private-instance-method",
            "public-abstract-method",
            "protected-abstract-method",
          ],
          order: "as-written",
        },
      },
    ],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        vars: "all",
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/ban-ts-comment": "off",
    "vue/multi-word-component-names": "off",
  },
  overrides: [
    {
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
    },
    {
      files: ["./src/main/**/*.ts"],
      parserOptions: {
        project: "./tsconfig.json",
      },
      rules: {
        "local-rules/catch-error-decorator": "warn",
      },
    },
  ],
};
