module.exports = {
	env: {
		node: true,
		es6: true
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	overrides: [
		{
			files: 'tests/**/*',
			rules: {
				'@typescript-eslint/no-unsafe-call': 'off'
			}
		},
		{
			files: ['*.js', '*.cjs'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/restrict-template-expressions': 'off'
			}
		},
		{
			files: ['src/**/*'],
			rules: {
				'no-console': 'off',
				'jsdoc/no-undefined-types': 'off',
				'@typescript-eslint/no-unsafe-argument': 'off'
			}
		},
		{
			files: ['packages/image/**/*'],
			rules: {
				'no-console': 'off'
			}
		}
	],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx']
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
				project: [
					'./tsconfig.eslint.json',
					'./examples/*/tsconfig.json',
					'./packages/*/tsconfig.json'
				]
			}
		},
		jsdoc: {
			tagNamePreference: {
				// Override `@wordpress/eslint-plugin/recommended`
				returns: 'returns'
			}
		}
	},
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: ['tsconfig.json']
	}
}
