module.exports = {
  root: true,
  plugins: ["@typescript-eslint", "import"],
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
            target: "./src/view/",
            from: "./src/service/",
            message: "Client should not import service code",
          },
          {
            target: "./src/service/",
            from: "./src/view/",
            message: "Service should not import client code",
          },
        ],
      },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", disallowTypeAnnotations: true, fixStyle: "separate-type-imports" },
    ],
    "@typescript-eslint/member-ordering": "warn",
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
  },
  overrides: [
    {
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
    },
  ],
};
