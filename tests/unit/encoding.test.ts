import fs from "fs";
import path from "path";
import {convertImages, optimizeSvg} from "../../src/compression";
import {getIniOptions} from "../../src/ini";

const srcDirWithImgs = './tests/images/test1';
const srcDirWithImgs2 = './tests/images/test2';
const srcDirWithoutImgs = './tests/images/non-image';
const distDir = './tests/images/dist';

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

		convertImages({
			srcDir: srcDirWithImgs, distDir, compressionOptions: options.compressionOptions
		}).then(() => {

			// check if the subdirectory was created and image was converted to destination directory
			// the jpg file exists
			expect(fs.existsSync(`${distDir}/image.jpg`)).toBe(true);
			// the png file is encoded into webp
			expect(fs.existsSync(`${distDir}/image.png.webp`)).toBe(true);
			expect(fs.existsSync(`${distDir}/image.png`)).not.toBe(true);

			expect(fs.existsSync(`${distDir}/image.gif.webp`)).toBe(true);
			expect(fs.existsSync(`${distDir}/image.tiff.webp`)).toBe(true);

		})
	});

	test('should handle non-image files correctly', async () => {

		convertImages({srcDir: srcDirWithoutImgs, distDir, compressionOptions: options.compressionOptions}).then(() => {

			// check if the non-image file was copied to destination directory
			expect(fs.existsSync(`${distDir}/a.txt`)).toBe(true);

		})

	});

	test('should apply compression options correctly', async () => {

		convertImages({
			srcDir: srcDirWithImgs2,
			distDir,
			compressionOptions: {
				...options.compressionOptions,
				'png': {compressor: 'avif', quality: 20},
				'gif': {compressor: 'png'},
				'tiff': {compressor: 'jpg', quality: 20}
			},
		}).then(() => {
			// check if the image was compressed to destination directory
			expect(fs.existsSync(`${distDir}/image.png.avif`)).toBe(true);
			expect(fs.existsSync(`${distDir}/deep/image.jpg`)).toBe(true);
			expect(fs.existsSync(`${distDir}/deep/with-images/image.tiff.jpg`)).toBe(true);
			expect(fs.existsSync(`${distDir}/deep/with-images/image.gif.png`)).toBe(true);
		})
	});
});

describe('optimizeSvg', () => {
	const filePath = path.join(__dirname, '../images/test3/image.svg');

	const distPath = path.join(__dirname, '../images/dist/image.min.svg');

	it('optimizes an SVG file and writes it to the specified output file', async () => {
		// Call the optimizeSvg function with test arguments
		optimizeSvg(filePath, distPath, {} ).then(() => {

			// Check if the optimized file was written to the correct location
			expect(fs.existsSync(distPath)).toBe(true);

			// Check if the optimized SVG was written to the correct location
			const writtenSvgContent = fs.readFileSync(distPath, 'utf8');

			// the file was written
			expect(writtenSvgContent).toBeDefined();

			// the file has content
			expect(writtenSvgContent.length).toBeGreaterThan(0);

			// Cleanup
			fs.unlinkSync(distPath);
		});
	});
});
