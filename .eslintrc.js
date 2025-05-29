module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    ...(require('fs').existsSync('./tsconfig.json') ? ['@typescript-eslint/recommended'] : []),
    ...(require('fs').existsSync('./package.json') && JSON.parse(require('fs').readFileSync('./package.json')).dependencies?.react ? ['plugin:react/recommended', 'plugin:react-hooks/recommended'] : []),
    'prettier'
  ],
  parser: require('fs').existsSync('./tsconfig.json') ? '@typescript-eslint/parser' : undefined,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ...(require('fs').existsSync('./package.json') && JSON.parse(require('fs').readFileSync('./package.json')).dependencies?.react ? { ecmaFeatures: { jsx: true } } : {}),
  },
  plugins: [
    ...(require('fs').existsSync('./tsconfig.json') ? ['@typescript-eslint'] : []),
    ...(require('fs').existsSync('./package.json') && JSON.parse(require('fs').readFileSync('./package.json')).dependencies?.react ? ['react', 'react-hooks'] : []),
    'prettier'
  ],
  rules: {
    'prettier/prettier': 'error'
  },
  settings: {
    ...(require('fs').existsSync('./package.json') && JSON.parse(require('fs').readFileSync('./package.json')).dependencies?.react ? { react: { version: 'detect' } } : {})
  }
};
