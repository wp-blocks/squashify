/* eslint-disable no-console */
import fs from "fs";
import path, { ParsedPath } from "path";

import { asInputFormats, getCompressionOptions } from "./utils";
import { CompressImagePaths, type ScriptOptions } from "./types";
import { copyFile } from "node:fs/promises";
import { Glob, Path } from "glob";
import { encodeImage } from "./encodeImage";
import { encodeSvg } from "./encodeSvg";

/**
 * The function converts images in a source directory to a specified format and
 * compresses them, while also copying non-image files to a destination directory.
 *
 * @param settings                    The options object
 * @param settings.srcDir             The source directory from where the images will be read and
 *                                   converted.
 * @param settings.distDir            The destination directory where the converted images will be
 *                                   saved. If no value is provided, the images will be saved in the same directory as
 *                                   the source images.
 * @param settings.compressionOptions An optional object that contains compression options
 *                                   for different image formats. The default value is an empty object. The object should
 *                                   have keys that correspond to image formats (e.g. "jpg", "png", "webp") and values
 *                                   that are objects containing compression options for that format (e.g. "no", "mozjpeg", "jpeg").
 */
export async function convertImages(
	settings: ScriptOptions,
): Promise<PromiseSettledResult<unknown>[]> {
	// destructuring the options
	const { srcDir, distDir, compressionOptions } = settings;

	// check if the srcDir is a directory
	if (!fs.existsSync(srcDir)) {
		return new Promise(() => {
			console.warn(
				`🎃 Error! The specified source directory ${srcDir} does not exist.`,
			);
		});
	}

	// create the output directory if it doesn't exist
	if (!fs.existsSync(distDir)) {
		fs.mkdirSync(distDir);
	}

	// Get a list of files in the source directory
	const globResults = new Glob(srcDir, {});

	const promises = [];

	// Loop through the files in the directory
	for await (const res of globResults as AsyncIterable<Path>) {
		// if is a directory creating the copy of the directory if the src is different from the dist
		if (res.isDirectory() && srcDir !== distDir) {
			fs.mkdirSync(path.join(distDir, res.name));
			continue;
		}

		// Get the file path and extension
		const paths: CompressImagePaths = {
			file: res,
			src: srcDir,
			dist: distDir,
			...(path.parse(res.path) as ParsedPath),
		};

		/**
		 * Set the default options for the image format
		 */
		const imageOptions = {
			...settings,
			...getCompressionOptions(paths.ext, compressionOptions),
			paths,
		};

		// Check if the file is an image
		if (asInputFormats(paths.ext) && !!imageOptions.compress) {
			if (paths.ext === ".svg" && imageOptions?.compress !== "no") {
				/**
				 * SVG optimization
				 */
				promises.push(await encodeSvg(res, paths.dist, imageOptions?.plugins));
			} else {
				/**
				 * The rest of the image formats
				 */
				promises.push(
					await encodeImage(filePath, paths.destPath, imageOptions),
				);
			}
		} else {
			/**
			 * Copy the non-image files
			 */
			const fileWriteStream = copyFile(filePath, paths.destPath);
			const message = new Promise((resolve) =>
				resolve(`Copied ${res} to ${paths.destPath}`),
			);

			promises.push(await Promise.all([message, fileWriteStream]));
		}
	}

	// Wait for all promises to resolve before returning
	return await Promise.allSettled(promises);
}
