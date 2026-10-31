import antfu from '@antfu/eslint-config'

export default await antfu(
  {
    astro: true,
    ignores: [
      '**/build/**',
      '**/dist/**',
      '**/dev-dist/**',
      '**/node_modules/**',
      '**/.astro/**',
      'pnpm-workspace.yaml',
    ],
  },
  {
    files: ['**/*.md/**'],
    rules: {
      'ts/no-this-alias': 'off',
      'ts/no-unused-vars': 'off',
      'n/handle-callback-err': 'off',
      'no-restricted-syntax': 'off',
      'no-labels': 'off',
    },
  },
  {
    files: [
      '**/*.ts',
    ],
    rules: {
      'ts/no-unused-vars': 'off',
    },
  },
  {
    files: [
      '**/*.astro',
    ],
    rules: {
      'no-undef': 'off',
      'style/jsx-tag-spacing': 'off',
    },
  },
  {
    // it detects nested arrays wrongly
    files: ['.github/labeler.yml'],
    rules: {
      'yaml/indent': 'off',
    },
  },
)
