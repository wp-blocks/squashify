import { describe, expect, it } from "@jest/globals";
import { getIniOptions } from "../../src/parseIni";
import { inputFormats } from "../../src/constants";

describe("getIniOptions", () => {
	it("should return the input settings when no configuration file is found", () => {
		const options = {
			configFile: "invalid_path",
			srcDir: "src",
			distDir: "dist",
			compressionOptions: null,
		};

		const result = getIniOptions(options);

		expect(result).toEqual(options);
	});

	it("should load the configuration file and update the settings", () => {
		const options = {
			configFile: "./tests/data/.squash",
			srcDir: "old",
			distDir: "new",
			compressionOptions: null,
		};

		const result = getIniOptions(options);

		// check the srcDir and distDir
		expect(result.srcDir).toEqual("old");
		expect(result.distDir).toEqual("new");

		// check the compression settings
		expect(result.compressionOptions).toMatchObject({
			".jpg": {
				compressor: "mozjpeg",
				quality: 80,
				progressive: true,
				plugins: undefined,
			},
			".jpeg": {
				compressor: "mozjpeg",
				quality: 80,
				progressive: true,
				plugins: undefined,
			},
			".png": {
				compressor: "webp",
				quality: 80,
				progressive: undefined,
				plugins: undefined,
			},
			".webp": {
				compressor: "webp",
				quality: 80,
				progressive: undefined,
				plugins: undefined,
			},
			".avif": {
				compressor: "webp",
				quality: 80,
				progressive: undefined,
				plugins: undefined,
			},
			".tiff": {
				compressor: "webp",
				quality: 80,
				progressive: undefined,
				plugins: undefined,
			},
			".gif": {
				compressor: "webp",
				quality: 80,
				progressive: undefined,
				plugins: undefined,
			},
			".svg": {
				compressor: undefined,
				quality: undefined,
				progressive: undefined,
				plugins: ["preset-default"],
			},
		});

		// Check that settings for all input formats have been parsed
		inputFormats.forEach((format) => {
			expect(result.compressionOptions[format]).toBeDefined();
		});
	});
});
