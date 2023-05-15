import fs from "fs";
import {convertImages} from "../../src/compression";
import {getIniOptions} from "../../src/ini";

const srcDir = './tests/images/non-image';
const distDir = './tests/images/dist-non-image';

// get test options
const {compressionOptions} = getIniOptions({
	configFile: './tests/data/.squash'
});

describe('convertImages', () => {

	test('should handle non-image files correctly', async () => {

		const r = await convertImages({srcDir, distDir, compressionOptions})

		if (r) {
			// check if the non-image file was copied to destination directory
			expect(fs.existsSync(`${distDir}/a.txt`)).toBe(true);
		}

	});
});
