import fs from "fs";
import {convertImages} from "../../src/compression";
import {getIniOptions} from "../../src/ini";

describe('convertImages', () => {
	const srcDirWithImgs = './tests/images/test1';
	const srcDirWithoutImgs = './tests/images/non-image';
	const distDir = './tests/images/dist';

	afterEach(() => {
		// remove the created directory after each test
		fs.rm(distDir, { recursive: true, force: true })
	});

	// get test options
	const options = getIniOptions({
		configFile: './tests/data/.squash'
	});

	test('should handle subdirectories correctly', async () => {

		convertImages({
			srcDir: srcDirWithImgs, distDir, compressionOptions: options.compressionOptions
		})

		// check if the subdirectory was created and image was converted to destination directory
		// the jpg file exists
		expect(fs.existsSync(`${distDir}/image.jpg`)).toBe(true);
		// the png file is encoded into webp
		expect(fs.existsSync(`${distDir}/image.png.webp`)).toBe(true);
		expect(fs.existsSync(`${distDir}/image.png`)).not.toBe(true);

		expect(fs.existsSync(`${distDir}/image.gif`)).toBe(true);
		expect(fs.existsSync(`${distDir}/image.tiff`)).toBe(true);
	});

	test('should handle non-image files correctly', async () => {

		convertImages({srcDir: srcDirWithoutImgs, distDir, compressionOptions: options.compressionOptions}).then(() => {
			// check if the non-image file was copied to destination directory
			expect(fs.existsSync(`${distDir}/a.txt`)).toBe(true);
		});
	});

	test('should apply compression options correctly', async () => {

		convertImages({
			srcDir: srcDirWithImgs,
			distDir,
			compressionOptions: {
				...options.compressionOptions,
				png: {compress: 'yes', compressor: 'avif', quality: 10}
			},
		}).then(() => {
			// check if the image was compressed to destination directory
			expect(fs.existsSync(`${distDir}/image.png.avif`)).toBe(true);
		});
	});
});
