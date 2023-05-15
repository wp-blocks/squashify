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
			srcDir: './src',
			distDir: './dist',
			compressionOptions: null
		};

		const result = getIniOptions(options);

		// check the srcDir and distDir
		expect(result.srcDir).toEqual('./old');
		expect(result.distDir).toEqual('./new');

		// check the compression options
		expect(result.compressionOptions).toMatchObject({
			"avif": {
				"compress": "no",
				"compressor": "webp",
				"quality": 80
			},
			"gif": {
				"compress": "no",
				"compressor": "webp",
				"quality": 80
			},
			"jpeg": {
				"compress": "no",
				"compressor": "webp",
				"quality": 80
			},
			"jpg": {
				"compress": "yes",
				"compressor": "mozjpeg",
				"progressive": true,
				"quality": "85"
			},
			"png": {
				"compress": "yes",
				"compressor": "webp",
				"quality": "80"
			},
			"svg": {
				"compress": "yes",
				"options": "CleanupAttrs, RemoveDoctype, RemoveXMLProcInst, RemoveComments, RemoveMetadata, RemoveXMLNS, RemoveEditorsNSData, RemoveTitle, RemoveDesc, RemoveUselessDefs, RemoveEmptyAttrs, RemoveHiddenElems, RemoveEmptyContainers, RemoveEmptyText, RemoveUnusedNS, ConvertShapeToPath, SortAttrs, MergePaths, SortDefsChildren, RemoveDimensions, RemoveStyleElement, RemoveScriptElement, InlineStyles, removeViewBox, removeElementsByAttr, cleanupIDs, convertColors, removeRasterImages, removeUselessStrokeAndFill, removeNonInheritableGroupAttrs,",
			},
			"tiff": {
				"compress": "no",
				"compressor": "webp",
				"quality": 80
			},
			"webp": {
				"compress": "no",
				"compressor": "webp",
				"quality": 80
			}
		});

		// Check that options for all input formats have been parsed
		inputFormats.forEach(format => {
			expect(result.compressionOptions[format.substring(1)]).toBeDefined();
		});
	});
});
