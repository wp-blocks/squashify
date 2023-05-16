import fs from "fs";
import {convertImages} from "../../src/compression";
import {getIniOptions} from "../../src/ini";

// get test options
const options = getIniOptions({
	srcDir: './tests/images/test1',
	distDir: './tests/images/dist',
	configFile: './tests/data/.squash'
});

describe('convertImages', () => {

	it('Should handle default options correctly', async () => {

		const r = await convertImages(options)

		if (r) {
			expect(fs.readdirSync(`${options.distDir}`)).toMatchObject(["image.gif.webp", "image.jpg", "image.png.webp", "image.svg", "image.tiff.webp"] );
			expect(fs.readdirSync(`${options.distDir}`).length).toBe(5);

			// check if the subdirectory was created and image was converted to destination directory
			// the jpg file exists
			expect(fs.existsSync(`${options.distDir}/image.jpg`)).toBe(true);

			// the png file is encoded into webp
			expect(fs.existsSync(`${options.distDir}/image.png.webp`)).toBe(true);
			expect(fs.existsSync(`${options.distDir}/image.png`)).not.toBe(true);

			expect(fs.existsSync(`${options.distDir}/image.gif.webp`)).toBe(true);
			expect(fs.existsSync(`${options.distDir}/image.tiff.webp`)).toBe(true);
		}
	});
});
