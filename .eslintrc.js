module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'prefer-destructuring': 'off',
    'no-bitwise': 'off',
    'class-methods-use-this': 'off',
    'import/extensions': 'off',
    'import/no-relative-packages': 'off',
  },
};
