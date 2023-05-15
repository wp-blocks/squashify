import fs from "fs";
import {convertImages, optimizeSvg} from "../../src/compression";
import {getIniOptions} from "../../src/ini";

const srcDirWithImgs = './tests/images/test1';
const srcDirWithImgs2 = './tests/images/test2';
const srcDirWithoutImgs = './tests/images/non-image';
const distDir = './tests/images/dist';
const distDir2 = './tests/images/dist2';

// get test options
const options = getIniOptions({
	configFile: './tests/data/.squash'
});

describe('convertImages', () => {

	afterEach(() => {
		// remove the created directory after each test
		fs.rm(distDir, {recursive: true, force: true})
	});

	test('should handle subdirectories correctly', async () => {

		const r = await convertImages({
			srcDir: srcDirWithImgs, distDir, compressionOptions: options.compressionOptions
		})

		if (r) {
			expect(fs.readdirSync(`${distDir}`)).toMatchObject(["image.gif.webp", "image.jpg", "image.png.webp", "image.svg", "image.tiff.webp"] );
			expect(fs.readdirSync(`${distDir}`).length).toBe(5);

			// check if the subdirectory was created and image was converted to destination directory
			// the jpg file exists
			expect(fs.existsSync(`${distDir}/image.jpg`)).toBe(true);
			// the png file is encoded into webp
			expect(fs.existsSync(`${distDir}/image.png.webp`)).toBe(true);
			expect(fs.existsSync(`${distDir}/image.png`)).not.toBe(true);

			expect(fs.existsSync(`${distDir}/image.gif.webp`)).toBe(true);
			expect(fs.existsSync(`${distDir}/image.tiff.webp`)).toBe(true);
		}
	});

	test('should handle non-image files correctly', async () => {

		const r = await convertImages({srcDir: srcDirWithoutImgs, distDir, compressionOptions: options.compressionOptions})

		if (r) {
			// check if the non-image file was copied to destination directory
			expect(fs.existsSync(`${distDir}/a.txt`)).toBe(true);
		}

	});
});


describe('convertImages with options', () => {

	afterEach(() => {
		// remove the created directory after each test
		fs.rm(distDir2, {recursive: true, force: true})
	});

	test('should apply compression options correctly', async () => {

		const r = await convertImages({
			srcDir: srcDirWithImgs2,
			distDir: distDir2,
			compressionOptions: {
				...options.compressionOptions,
				'.png': {compressor: 'avif', quality: 20},
				'.gif': {compressor: 'png'},
				'.tiff': {compressor: 'jpg', quality: 20}
			},
		})

		if (r) {
			// check if the image was compressed to destination directory
			expect(fs.existsSync(`${distDir2}/image.png.avif`)).toBe(true);
			expect(fs.existsSync(`${distDir2}/deep/image.jpg`)).toBe(true);
			expect(fs.existsSync(`${distDir2}/deep/with-images/image.tiff.jpg`)).toBe(true);
			expect(fs.existsSync(`${distDir2}/deep/with-images/image.gif.png`)).toBe(true);
		}
	})
});
