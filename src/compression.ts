/* eslint-disable no-console */
import fs from "fs";
import path from "path";

import sharp, { OutputInfo } from "sharp";

import {
	asInputFormats,
	getCompressionOptions,
	getOutputExtension,
	getSvgoOptions,
	logMessage,
	optimizeSvg,
} from "./utils";
import {
	CompressionOptions,
	CompressionOptionsMap,
	type ScriptOptions,
} from "./types";
import { Compressor, compressors } from "./constants";

/**
 * The function converts images in a source directory to a specified format and
 * compresses them, while also copying non-image files to a destination directory.
 *
 * @param options                    The options object
 * @param options.srcDir             The source directory from where the images will be read and
 *                                   converted.
 * @param options.distDir            The destination directory where the converted images will be
 *                                   saved. If no value is provided, the images will be saved in the same directory as
 *                                   the source images.
 * @param options.compressionOptions An optional object that contains compression options
 *                                   for different image formats. The default value is an empty object. The object should
 *                                   have keys that correspond to image formats (e.g. "jpg", "png", "webp") and values
 *                                   that are objects containing compression options for that format (e.g. "no", "mozjpeg", "jpeg").
 */
export async function convertImages(
	options: ScriptOptions,
): Promise<PromiseSettledResult<unknown>[]> {
	// destructuring the options
	const { srcDir, distDir, compressionOptions } = options;

	// check if the srcDir is a directory
	if (!fs.existsSync(srcDir)) {
		return new Promise(() => {
			console.warn(
				`🎃 Error! The specified source directory ${srcDir} does not exist.`,
			);
		});
	}

	// check if the srcDir is a directory
	if (typeof compressionOptions === "undefined") {
		if (options.interactive) {
			return new Promise(() => {
				console.warn("🎃  Error! Compression options were not provided.");
			});
		} else {
			logMessage(
				"🎃 Warning! Compression options were not provided. Default options will be used.",
				options.verbose,
			);
		}
	}

	// create the output directory if it doesn't exist
	if (!fs.existsSync(distDir)) {
		fs.mkdirSync(distDir);
	}

	// Get a list of files in the source directory
	const files = fs.readdirSync(srcDir);

	// Loop through the files in the directory
	const promises = files.map(async (file: string) => {
		// Get the full path of the file
		const filePath = path.join(srcDir, file);

		// Get the stats of the file
		const stats = fs.statSync(filePath);

		// Check if the file is a directory
		if (stats.isDirectory()) {
			// Recursively call this function on the subdirectory
			const subDir = path.join(distDir, file);
			fs.mkdirSync(subDir, { recursive: true });

			logMessage(`Converted ${file} to ${subDir}`, options.verbose);

			// Call this function on the subdirectory
			return convertImages({
				srcDir: filePath,
				distDir: subDir,
				extMode: options.extMode,
				compressionOptions,
			});
		}

		// Get the extension of the file
		const fileParsedPath = path.parse(file);
		const extension = fileParsedPath.ext.toLowerCase();
		const basename = fileParsedPath.name;

		// Set the default options for the image format
		const compressOpt = getCompressionOptions(extension, compressionOptions);

		// Check if the file is an image
		if (asInputFormats(extension) && compressOpt) {
			// Apply compression options
			/**
			 * SVG optimization
			 */
			if (extension === ".svg" && compressOpt?.compress !== "no") {
				logMessage(
					`File SVG optimized source ${filePath} to ${file}`,
					options.verbose,
				);

				// Save the image to the destination directory
				return optimizeSvg(
					filePath,
					path.join(distDir, file),
					getSvgoOptions(compressOpt?.plugins),
				);
			} else {
				const outputExt = getOutputExtension(compressOpt.compressor, extension);
				// Save the image to the destination directory
				const distFileName = path.join(
					distDir,
					options.extMode === "add" &&
						extension.substring(1) !== compressOpt.compressor
						? file + outputExt
						: basename + outputExt,
				);

				/** @var {any} image Load the image with sharp */
				let image = sharp(filePath);

				/**
				 * The rest of the image formats
				 * Will apply compression options if specified in the options
				 */
				if (compressOpt.compressor) {
					switch (compressOpt.compressor) {
						case "avif":
							image = image.avif({
								quality: compressOpt.quality,
							});
							break;
						case "webp":
							image = image.webp({
								quality: compressOpt.quality,
							});
							break;
						case "png":
							image = image.png();
							break;
						case "mozjpeg":
							image = image.jpeg({
								mozjpeg: true,
								quality: compressOpt.quality,
							});
							break;
						case "jpg":
							image = image.jpeg({
								quality: compressOpt.quality,
								progressive: compressOpt.progressive,
							});
							break;
					}
				}

				logMessage(
					`File converted from ${filePath} to ${distFileName}`,
					options.verbose,
				);
				return image.toFile(distFileName);
			}
		} else {
			// Copy the file to the destination directory
			const distPath = path.join(distDir, file);
			logMessage(
				`File copied from ${filePath} to ${distPath}`,
				options.verbose,
			);

			// Write the contents to the destination file
			return fs.copyFile(filePath, distPath, (err) => {
				if (err) {
					console.warn("Error!", err);
				}
			});
		}
	});

	// Wait for all promises to resolve before returning
	return Promise.allSettled(promises);
}
