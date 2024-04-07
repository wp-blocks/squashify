import fs from "fs";
import { convertImages } from "../../src/compression";

const srcDir = "./tests/images/test2";
const distDir = "./tests/images/dist-custom";

describe("convertImages with settings", () => {
	it("should apply compression settings correctly", async () => {
		const thisdistDir = distDir + "-1";
		const r = await convertImages({
			srcDir,
			distDir: thisdistDir,
			options: { extMode: "replace" },
			compressionOptions: {
				".png": { compressor: "avif", quality: 20 },
				".gif": { compressor: "png" },
				".tiff": { compressor: "jpg", quality: 20 },
			},
		});

		expect(fs.readdirSync(`${thisdistDir}`)).toMatchObject([
			"deep",
			"image.avif",
		]);
		expect(fs.readdirSync(`${thisdistDir}`).length).toBe(2);

		// check if the image was compressed to destination directory
		expect(fs.existsSync(`${thisdistDir}/image.avif`)).toBe(true);
		expect(fs.existsSync(`${thisdistDir}/deep/image.jpg`)).toBe(true);
		expect(fs.existsSync(`${thisdistDir}/deep/with-images/image.jpg`)).toBe(
			true,
		);
		expect(fs.existsSync(`${thisdistDir}/deep/with-images/image.png`)).toBe(
			true,
		);
	});
	it("should apply compression settings correctly when extMode is 'add'", async () => {
		const thisdistDir = distDir + "-2";
		const r = await convertImages({
			srcDir,
			distDir: thisdistDir,
			options: { extMode: "add" },
			compressionOptions: {
				".png": { compressor: "avif", quality: 20 },
				".gif": { compressor: "png" },
				".tiff": { compressor: "jpg", quality: 20 },
			},
		});

		expect(fs.readdirSync(`${thisdistDir}`)).toMatchObject([
			"deep",
			"image.png.avif",
		]);
		expect(fs.readdirSync(`${thisdistDir}`).length).toBe(2);

		// check if the image was compressed to destination directory
		expect(fs.existsSync(`${thisdistDir}/image.png.avif`)).toBe(true);
		expect(fs.existsSync(`${thisdistDir}/deep/image.jpg`)).toBe(true);
		expect(
			fs.existsSync(`${thisdistDir}/deep/with-images/image.tiff.jpg`),
		).toBe(true);
		expect(fs.existsSync(`${thisdistDir}/deep/with-images/image.gif.png`)).toBe(
			true,
		);
	});
});
