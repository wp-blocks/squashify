import { describe, expect, it } from "@jest/globals";
import { getIniOptions } from "../../src/parseIni";
import { inputFormats } from "../../src/constants";
import { parseOptions } from "../../src/parseOptions";
import { ScriptOptions } from "../../src/types";

describe("getIniOptions", () => {
	it("should return the input settings when no configuration file is found", () => {
		const options = {
			configFile: "invalid_path",
			srcDir: "src",
			distDir: "dist",
			compressionOptions: null,
		};

		const result = getIniOptions("fakepath", options);

		expect(result).toEqual(options);
	});

	it("should load the configuration file and update the settings", () => {
		const options = {
			configFile: "./tests/data/.squash",
			srcDir: "old",
			distDir: "new",
			compressionOptions: null,
		};

		let result = getIniOptions(options.configFile);

		// parse the settings for all formats in the inputFormats array

		const parsedOptions = parseOptions(options as any, result);

		// check the srcDir and distDir
		expect(parsedOptions.srcDir).toEqual("old");
		expect(parsedOptions.distDir).toEqual("new");
		/*
		// check the compression settings
		expect(parsedOptions.compressionOptions).toMatchObject({
			".jpg": {
				compressor: "mozjpeg",
				quality: 80,
				progressive: true,
			},
			".jpeg": {
				compressor: "mozjpeg",
				quality: 80,
				progressive: true,
			},
			".png": {
				compressor: "webp",
				quality: 80,
			},
			".webp": {
				compressor: "webp",
				quality: 80,
			},
			".avif": {
				compressor: "webp",
				quality: 80,
			},
			".tiff": {
				compressor: "webp",
				quality: 80,
			},
			".gif": {
				compressor: "webp",
				quality: 80,
			},
			".svg": {
				compressor: "svgo",
				plugins: ["preset-default"],
			},
		});

		// Check that settings for all input formats have been parsed
		inputFormats.forEach((format) => {
			expect(parsedOptions.compressionOptions[format]).toBeDefined();
		});*/
	});
});
