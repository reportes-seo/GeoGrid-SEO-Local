/**
 * ESLint flat config (ESLint 9+)
 *
 * Reparto de responsabilidades, a proposito:
 *  - ESLint  -> correccion (bugs, variables sin usar, comparaciones laxas).
 *  - Prettier -> formato (comillas, indentacion, punto y coma, comas finales).
 *
 * Por eso aqui NO hay reglas de estilo: las de formato del core de ESLint estan
 * deprecadas desde la v9 y chocarian con .prettierrc. Formato: `npm run format`.
 */

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'build/**', '.dev/**']
  },

  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prefer-const': 'warn',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all']
    }
  },

  {
    // Dos sitios ejecutan codigo DENTRO del navegador, no en Node:
    //  - views/templates/*: el JS del informe, inyectado como string.
    //  - services/screenshot.service.js: las callbacks de page.evaluate()
    //    y page.waitForFunction(), que Puppeteer serializa y corre en la pagina.
    files: ['views/templates/**/*.js', 'services/screenshot.service.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        L: 'readonly'
      }
    }
  }
];
