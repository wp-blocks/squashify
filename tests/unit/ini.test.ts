import {describe, expect, it} from "@jest/globals";
import {getIniOptions} from "../../src/ini";
import {inputFormats} from "../../src/constants";

describe('getIniOptions', () => {
	it('should return the input options when no configuration file is found', () => {
		const options = {
			configFile: 'invalid_path',
			srcDir: 'src',
			distDir: 'dist',
			compressionOptions: null
		};
		const result = getIniOptions(options);
		expect(result).toEqual(options);
	});

	it('should load the configuration file and update the options', () => {
		const options = {
			configFile: './tests/data/.image',
			srcDir: './src',
			distDir: './dist',
			compressionOptions: null
		};

		const result = getIniOptions(options);

		// check the srcDir and distDir
		expect(result.srcDir).toEqual('./src');
		expect(result.distDir).toEqual('./dist');

		// check the compression options
		expect(result.compressionOptions).toEqual({
			jpg: {compress: 'yes', compressor: 'mozjpeg', quality: '80', progressive: 'true'},
			png: {compress: 'yes', compressor: 'webp', quality: '80'},
			svg: {
				compress: 'no',
				compressor: 'svg',
				options: "CleanupAttrs, RemoveDoctype, RemoveXMLProcInst"
			}
		});

		// Check that options for all input formats have been parsed
		inputFormats.forEach(format => {
			expect(result.compressionOptions[format.substring(1)]).toBeDefined();
		});
	});
});
