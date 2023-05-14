// Import the default config file and expose it in the project root.
// Useful for editor integrations.

module.exports = {
	proseWrap: 'never',
	endOfLine: 'lf',
	overrides: [
		{
			files: '*.json',
			options: {
				printWidth: 100,
			},
		},
		{
			files: '*.{yml,yaml}',
			options: {
				singleQuote: false,
				tabWidth: 2,
			},
		},
	],
};
