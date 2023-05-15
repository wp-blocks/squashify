import yargs from "yargs";
import {getCliOptions} from "../../src/args";
import {defaultConfigFile, defaultDist, defaultSrc} from "../../src/constants";

describe('getCliOptions', () => {

	it('Should return the correct options', () => {

		const args = '--in ./source --out ./destination --config ./config.json --verbose --interactive'

		const options = getCliOptions( yargs( args.split(" ") ) );

		expect(options.srcDir).toBe('./source');
		expect(options.distDir).toBe('./destination');
		expect(options.configFile).toBe('./config.json');
		expect(options.verbose).toBe(true);
		expect(options.interactive).toBe(true);
	});

	it('Should return the default options if no arguments are passed', () => {

		const options = getCliOptions( yargs( [''] ) );

		expect(options.srcDir).toBe(defaultSrc);
		expect(options.distDir).toBe(defaultDist);
		expect(options.configFile).toBe(defaultConfigFile);
		expect(options.verbose).toBe(false);
		expect(options.interactive).toBe(false);
	});
});
