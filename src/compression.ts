/* eslint-disable no-console */
import fs from "fs";
import path, { ParsedPath } from "path";

import { asInputFormats, getCompressionOptions, getFileName } from "./utils";
import {
	CompressImagePaths,
	CompressionMeta,
	CompressionOptions,
	type ScriptOptions,
} from "./types";
import { copyFile } from "node:fs/promises";
import { Glob } from "glob";
import { encodeImage } from "./encodeImage";
import { encodeSvg } from "./encodeSvg";
import { OutputInfo } from "sharp";
import { lstatSync } from "node:fs";

function copyFileAsync(
	encodeSetup: CompressionMeta,
): Promise<void | OutputInfo> {
	/** destructuring the settings */
	const { compressor, paths } = encodeSetup as CompressionMeta;
	/**
	 * If the compression is enabled for the image format and the extension is an image file
	 */
	if (compressor && asInputFormats(paths.ext)) {
		if (paths.ext === ".svg" && compressor === "svgo") {
			/**
			 * SVG optimization
			 */
			const filePath = path.join(paths.distPath, paths.base);
			console.log("📐 Processing", filePath);
			return encodeSvg(paths.srcDir, filePath, encodeSetup.options);
		} else {
			/**
			 * Images compression
			 */
			const outputFile = getFileName(
				encodeSetup.options?.extMode,
				paths as CompressImagePaths,
				compressor,
			);

			console.log("🖼️ Processing", outputFile);

			/**
			 * The rest of the image formats
			 */
			return encodeImage(
				paths.srcPath,
				path.join(paths.distPath, outputFile),
				encodeSetup,
			);
		}
	} else {
		console.log(
			"This is not an image file or the compression is not enabled for " +
				paths.ext,
			encodeSetup.compressor,
		);
		console.log(
			`📄 Copying ${paths.srcPath} file to ${path.join(paths.distPath, paths.base)}`,
		);

		return copyFile(paths.srcPath, path.join(paths.distPath, paths.base));
	}
}

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

	const promises: Promise<void | OutputInfo>[] = [];

	const paths: Partial<CompressImagePaths> = {
		srcDir: srcDir,
		distDir: distDir,
		cwd: process.cwd(),
	};

	// Loop through the files in the directory
	for await (const res of globResults as AsyncIterable<string>) {
		/** Collect the source and destination paths */
		const file = path.parse(res) as ParsedPath;
		const filePaths = {
			...paths,
			...file,
			res,
			srcPath: path.join(process.cwd(), srcDir, res),
			distPath: path.join(process.cwd(), distDir, file.dir),
		};

		/** Check if the src is a directory */
		const srcLstat = lstatSync(filePaths.srcPath);
		// if is a directory creating the copy of the directory if the src is different from the dist
		if (srcLstat?.isDirectory()) {
			const dirPath = path.join(process.cwd(), distDir, res);
			console.log("📁 New Folder created " + dirPath);
			// check if the directory exists
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath);
			}
		} else {
			/**
			 * Set the default settings for the image format
			 */
			const encodeSetup: CompressionMeta = {
				...settings,
				...getCompressionOptions(filePaths.ext, compressionOptions),
				paths: filePaths as CompressImagePaths,
			};

			promises.push(
				/* return the promise to copy/encode the file */
				copyFileAsync(encodeSetup),
			);
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
