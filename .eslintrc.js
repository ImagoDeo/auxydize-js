module.exports = {
  env: {
    browser: false,
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    },
  ],
  rules: {
    'no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
  },
  root: true,
};
