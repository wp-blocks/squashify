import fs from "fs";
import {convertImages} from "../../src/compression";
import {getIniOptions} from "../../src/ini";

const srcDir = './tests/images/test2';
const distDir = './tests/images/dist-custom';

// get test options
const options = getIniOptions({
	configFile: './tests/data/.squash'
});

describe('convertImages with options', () => {

	test('should apply compression options correctly', async () => {

		const r = await convertImages({
			srcDir,
			distDir,
			compressionOptions: {
				...options.compressionOptions,
				'.png': {compressor: 'avif', quality: 20},
				'.gif': {compressor: 'png'},
				'.tiff': {compressor: 'jpg', quality: 20}
			},
		})

		if (r) {
			expect(fs.readdirSync(`${distDir}`)).toMatchObject(["deep", "image.png.avif"] );
			expect(fs.readdirSync(`${distDir}`).length).toBe(2);

			// check if the image was compressed to destination directory
			expect(fs.existsSync(`${distDir}/image.png.avif`)).toBe(true);
			expect(fs.existsSync(`${distDir}/deep/image.jpg`)).toBe(true);
			expect(fs.existsSync(`${distDir}/deep/with-images/image.tiff.jpg`)).toBe(true);
			expect(fs.existsSync(`${distDir}/deep/with-images/image.gif.png`)).toBe(true);
		}
	})
});
