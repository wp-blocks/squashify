const jestConfig = {
	"testRegex": "(/tests/.*|(\\.|/)(test|spec))\\.tsx?$",
	"transformIgnorePatterns": ["/node_modules/"],
	"coverageThreshold": {
		"global": {
			"branches": 10,
			"functions": 10,
			"lines": 10,
			"statements": 10
		}
	},
	"collectCoverage": true,
};

module.exports = jestConfig;
