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
			configFile: './tests/data/.squash',
			srcDir: './old',
			distDir: './new',
			compressionOptions: null
		};

		const result = getIniOptions(options);

		// check the srcDir and distDir
		expect(result.srcDir).toEqual('./old');
		expect(result.distDir).toEqual('./new');

		// check the compression options
		expect(result.compressionOptions).toMatchObject({
				".jpg": {
					"compressor": "mozjpeg",
					"quality": 80,
					"progressive": true,
					"options": null
				},
				".jpeg": {
					"compressor": "mozjpeg",
					"quality": 80,
					"progressive": true,
					"options": null
				},
				".png": {
					"compressor": "webp",
					"quality": 80,
					"progressive": null,
					"options": null
				},
				".webp": {
					"compressor": "webp",
					"quality": 80,
					"progressive": null,
					"options": null
				},
				".avif": {
					"compressor": "webp",
					"quality": 80,
					"progressive": null,
					"options": null
				},
				".tiff": {
					"compressor": "webp",
					"quality": 80,
					"progressive": null,
					"options": null
				},
				".gif": {
					"compressor": "webp",
					"quality": 80,
					"progressive": null,
					"options": null
				},
				".svg": {
					"compressor": "svgo",
					"quality": null,
					"progressive": null,
					"options": "CleanupAttrs, RemoveDoctype, RemoveXMLProcInst"
				}
			}
		);

		// Check that options for all input formats have been parsed
		inputFormats.forEach(format => {
			expect(result.compressionOptions[format]).toBeDefined();
		});
	});
});
