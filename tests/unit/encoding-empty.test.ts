import fs from "fs";
import {convertImages} from "../../src/compression";
import {getIniOptions} from "../../src/ini";

// get test options
const options = getIniOptions({
	srcDir: './tests/images/non-image',
	distDir: './tests/images/dist-non-image',
	configFile: './tests/data/.squash'
});

describe('convertImages', () => {

	it('should handle non-image files correctly', async () => {

		const r = await convertImages(options)

		if (r) {
			// check if the non-image file was copied to destination directory
			expect(fs.existsSync(`${options.distDir}/a.txt`)).toBe(true);
		}

	});
});
