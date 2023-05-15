import fs from "fs";
import {convertImages} from "../../src/compression";
import {getIniOptions} from "../../src/ini";

const srcDirWithImgs = './tests/images/test1';
const distDir = './tests/images/dist';

// get test options
const {compressionOptions} = getIniOptions({
	configFile: './tests/data/.squash'
});

describe('convertImages', () => {

	test('Should handle default options correctly', async () => {

		const r = await convertImages({
			srcDir: srcDirWithImgs, distDir, compressionOptions
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
});
