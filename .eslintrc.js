module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: ['plugin:vue/strongly-recommended', 'eslint:recommended'],

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    eqeqeq: 1,
    'no-extra-parens': 2,
    'valid-jsdoc': 2,
    'no-multi-spaces': 2,
    'array-bracket-spacing': [
      2,
      'never'
    ],
    'block-spacing': 2,
    'comma-style': 2,
    indent: [
      2,
      2
    ],
    'no-trailing-spaces': 2,
    'object-curly-spacing': [
      2,
      'always'
    ],
    'require-jsdoc': [
      1,
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: false,
          ClassDeclaration: false,
          ArrowFunctionExpression: false,
          FunctionExpression: false
        }
      }
    ],
    semi: [
      2,
      'never'
    ],
    'semi-spacing': 2,
    'comma-spacing': 2,
    'spaced-comment': [
      2,
      'always',
      {
        markers: [
          '/',
          '//'
        ]
      }
    ],
    'space-before-function-paren': [
      2,
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    'arrow-spacing': 2,
    'no-var': 2,
    quotes: [
      2,
      'single'
    ],
    'newline-per-chained-call': [
      2
    ],
    'multiline-ternary': [
      2,
      'always-multiline'
    ],
    'operator-linebreak': [
      2,
      'before'
    ],
    'space-infix-ops': 2,
    'key-spacing': 2,
    'space-before-blocks': 2,
    'keyword-spacing': [
      2,
      {
        before: true
      }
    ],
    'vue/max-attributes-per-line': 'off',
    'vue/component-name-in-template-casing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/no-v-html': 'off',
    'vue/html-self-closing': 'off',
    'vue/html-indent': ['error', 2, {
      'attribute': 1,
      'baseIndent': 1,
      'closeBracket': 0,
      'alignAttributesVertically': false,
      'ignores': []
    }],
  },

  parserOptions: {
    parser: 'babel-eslint'
  }
}