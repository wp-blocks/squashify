import { expect, it, describe, beforeEach } from "@jest/globals";
import { getCliOptions } from "../../src/args";
import { defaultConfigFile } from "../../src/constants";
import yargs, { argv } from "yargs";

describe("getCliOptions", () => {
	it("Should return the correct options", () => {
		const args =
			"--in ./source --out ./destination --config ./config.json --verbose --interactive";
		const options = getCliOptions(yargs(args.split(" ")));

		expect(options.srcDir).toBe("./source");
		expect(options.distDir).toBe("./destination");
		expect(options.configFile).toBe("./config.json");
		expect(options.verbose).toBe(true);
		expect(options.interactive).toBe(true);
	});

	it("Should return the default options if no arguments are passed", () => {
		const options = getCliOptions(yargs([""]));
		expect(options.srcDir).toBe("");
		expect(options.distDir).toBe("");
		expect(options.configFile).toBe(defaultConfigFile);
		expect(options.verbose).toBe(false);
		expect(options.interactive).toBe(false);
	});
});
