/* eslint-disable no-console */
import fs from "fs";
import path, { ParsedPath } from "path";

import { asInputFormats, getCompressionOptions, getFileName } from "./utils";
import {
	CompressImagePaths,
	CompressionOptions,
	type ScriptOptions,
} from "./types";
import { copyFile } from "node:fs/promises";
import { Glob } from "glob";
import { encodeImage } from "./encodeImage";
import { encodeSvg } from "./encodeSvg";
import { OutputInfo } from "sharp";
import { lstatSync } from "node:fs";

/**
 * The function converts images in a source directory to a specified format and
 * compresses them, while also copying non-image files to a destination directory.
 *
 * @param settings                    The settings object
 * @param settings.srcDir             The source directory from where the images will be read and
 *                                   converted.
 * @param settings.distDir            The destination directory where the converted images will be
 *                                   saved. If no value is provided, the images will be saved in the same directory as
 *                                   the source images.
 * @param settings.compressionOptions An optional object that contains compression settings
 *                                   for different image formats. The default value is an empty object. The object should
 *                                   have keys that correspond to image formats (e.g. "jpg", "png", "webp") and values
 *                                   that are objects containing compression settings for that format (e.g. "no", "mozjpeg", "jpeg").
 */
export async function convertImages(settings: ScriptOptions): Promise<void> {
	// destructuring the settings
	const { srcDir, distDir, compressionOptions } = settings;

	// check if the srcDir is a directory
	if (!fs.existsSync(srcDir)) {
		return new Promise(() => {
			console.warn(
				`🎃 Error! The specified source directory ${srcDir} does not exist.`,
			);
		});
	}

	// Get a list of files in the source directory
	const globResults = new Glob("**", {
		cwd: srcDir,
		exclude: "**/node_modules/**",
	});

	const promises = [];

	function copyFileAsync(
		src: string,
		outPath: string,
	): Promise<void | OutputInfo> {
		// Get the file path and extension
		const paths: CompressImagePaths = {
			src: src,
			dist: outPath,
			...(path.parse(src) as ParsedPath),
		};

		/**
		 * Set the default settings for the image format
		 */
		const encodeSetup: CompressionOptions = {
			...settings,
			...getCompressionOptions(paths.ext, compressionOptions),
			paths,
		};

		if (encodeSetup.compressor && asInputFormats(paths.ext)) {
			if (paths.ext === ".svg" && encodeSetup.compressor === "svgo") {
				/**
				 * SVG optimization
				 */

				paths.distFullPath = path.join(outPath, paths.base);
				return encodeSvg(src, paths.distFullPath, encodeSetup);
			} else {
				/**
				 * Images compression
				 */
				const outputFile = getFileName(
					settings.options?.extMode,
					paths as CompressImagePaths,
					encodeSetup.compressor,
				);
				paths.distFullPath = path.join(outPath, outputFile);
				console.log("📄 " + src, "➡️", outputFile);
				process.exit();
				/**
				 * The rest of the image formats
				 */
				return encodeImage(src, outputFile, encodeSetup);
			}
		} else {
			console.log(
				"the image format is not enabled " + paths.ext,
				encodeSetup.compressor,
			);
			console.log("📄 copying " + paths.base);

			return copyFile(
				path.join(paths.src, paths.base),
				path.join(paths.dist, paths.base),
			);
		}
	}

	// Loop through the files in the directory
	for await (const res of globResults as AsyncIterable<string>) {
		const srcPath = path.join(process.cwd(), srcDir, res);
		const outPath = path.join(process.cwd(), distDir);
		const srcLstat = lstatSync(srcPath);
		// if is a directory creating the copy of the directory if the src is different from the dist
		if (srcLstat?.isDirectory()) {
			console.log("📁 " + srcPath, "➡️", outPath);
			// check if the directory exists
			if (!fs.existsSync(outPath)) {
				fs.mkdirSync(outPath);
			}
			settings.srcDir = outPath;
		} else {
			promises.push(copyFileAsync(srcPath, outPath));
		}
	}

	// Wait for all promises to resolve before returning
	return Promise.allSettled(promises).then((res) => {
		if (res) {
			res.forEach((result) => {
				if (result.status !== "fulfilled") {
					console.log("🔴 " + result.reason);
				} else {
					// Print the result to the console
					if (Array.isArray(result.value) && result.value.length) {
						result.value?.map((x: void | OutputInfo) => {
							if (x && "size" in x) console.log("✅ " + x.size);
							else console.log("✅ svg optimized to ");
						});
					}
				}
			});
		}
	});
}
