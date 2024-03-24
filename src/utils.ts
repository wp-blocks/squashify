/* eslint-disable no-console */

import fs from "fs";
import path from "path";

import {
	type Compressor,
	defaultSvgoPlugins,
	inputFormats,
	type InputFormats,
} from "./constants";
import { type CompressionOptions, type CompressionOptionsMap } from "./types";
import {
	type Config as SvgoConfig,
	optimize,
	type PluginConfig as SvgoPluginConfig,
} from "svgo";

/**
 * The function returns compression options for a given image format.
 *
 * @param imageFormat The format of the image that needs to be compressed, such as
 *                    "jpeg", "png", etc.
 * @param options     The options parameter is an object that contains compression
 *                    options for different image formats. It is expected to have properties for each
 *                    supported image format, where the property name is the format name (e.g. "jpeg",
 *                    "png") and the value is an object containing compression options for that format.
 * @returns either the compression options for the specified image format from the
 * provided options object, or false if no compression options are found for that
 * format.
 */
export function getCompressionOptions(
	imageFormat: string,
	options: CompressionOptionsMap,
): CompressionOptions | false {
	return options[imageFormat as InputFormats] ?? false;
}

/**
 * Type guard for image formats
 *
 * @param ext the image format to check
 */
export function asInputFormats(ext: unknown): ext is InputFormats {
	return inputFormats.includes(ext as InputFormats);
}

/**
 * this function returns an array of image formats in a given folder
 *
 * @param folderPath The folder to search for images in
 * @returns An array of image formats
 */
export function getImageFormatsInFolder(
	folderPath: string,
): any | InputFormats[] {
	const imageFormats = new Set<InputFormats>(); // using a Set to store unique image formats

	/**
	 * This function searches for all image files in a given folder
	 *
	 * @param {string} dir The folder to search for images in.
	 */
	function searchForImages(dir: string) {
		const files = fs.readdirSync(dir);

		// iterate over each file
		files.forEach((file) => {
			const filePath = path.join(dir, file);

			// Get the stats of the file
			const stats = fs.statSync(filePath);

			// Check if the file is a directory
			if (stats.isDirectory()) {
				// Recursively call this function on the subdirectory
				searchForImages(filePath);
			} else {
				// Get the extension of the file
				const ext = path.extname(file).toLowerCase(); // get the file extension in lowercase

				// Check if the file is an image
				if (asInputFormats(ext)) {
					// check if it's an image file
					imageFormats.add(ext); // add the image format to the Set
				}
			}
		});
	}
	// Call this function on the source directory
	searchForImages(folderPath);

	return [...imageFormats]; // convert the Set to an array
}

/**
 * Log a message to the console if the verbose flag is set
 *
 * @param message The message to log
 * @param verbose Whether or not to log the message
 */
export function logMessage(message: string, verbose = false) {
	if (verbose) console.log(message);
}

/**
 * The function optimizes an SVG file asynchronously using SVGO and writes the optimized SVG to a
 * specified output file.
 *
 * @param filePath    The path to the SVG file that needs to be optimized.
 * @param distPath    The `distPath` parameter is a string representing the file path
 *                    where the optimized SVG file will be written to.
 * @param svgoOptions `svgoOptions` is an object that contains options for optimizing
 *                    the SVG using SVGO (SVG Optimizer). These options can include things like removing
 *                    comments, removing empty groups, and optimizing path data. The specific options and
 *                    their values will depend on the desired optimization settings.
 */
export async function optimizeSvg(
	filePath: string,
	distPath: string,
	svgoOptions: SvgoConfig,
): Promise<void> {
	// Start a Promise that resolves when the file is written
	await new Promise((resolve) => {
		// Read the SVG file from the file system
		// Read the SVG file from the file system
		const svg = fs.readFileSync(filePath, "utf8");

		// Optimize the SVG with SVGO
		const optimizedSvg = optimize(svg, svgoOptions);

		// Write the optimized SVG to the output file
		fs.writeFileSync(distPath, optimizedSvg.data);

		// Resolve the Promise with the optimized SVG
		resolve(optimizedSvg);
	});
}

/**
 * Returns the output file extension for a given image format
 * is needed because the mozjpeg compressor needs to be saved with the jpg extension
 * and to avoid the jpeg extension being added to the output file when saving a jpeg file
 *
 * @param compressor  The image format
 * @param originalExt The original file extension
 * @returns The output file extension
 */
export function getOutputExtension(
	compressor: Compressor | undefined,
	originalExt: InputFormats,
) {
	// If no compressor is found, return the original extension
	if (!compressor) return originalExt;

	// If the original extension is not jpg, return the original extension
	let newExt = ".".concat(compressor);

	// If the original extension is jpg, add the jpg extension
	switch (compressor) {
		case "jpg":
		case "mozjpeg":
			newExt = ".jpg";
			break;
	}

	// Return the new extension
	return originalExt !== newExt ? newExt : "";
}

/**
 * The function returns a compressor based on the input format, with a default value if none is
 * provided.
 * @param {Compressor} compressor - The compressor parameter is a variable of type Compressor, which is
 * likely an enum or a string type that specifies the type of image compressor to use.
 * @param {string} format - The format parameter is a string that represents the file format of an
 * image. It can be '.jpg', '.jpeg', or '.svg'.
 * @returns a compressor name based on the input format. If the format is '.jpg' or '.jpeg', it returns
 * the input compressor if it is not null or undefined, otherwise it returns 'mozjpeg'. If the format
 * is '.svg', it returns undefined. For all other formats, it returns the input compressor if it is not
 * null or undefined, otherwise it returns 'webp'.
 */
export function getCompressor(compressor: Compressor, format: string) {
	if (format === ".jpg" || format === ".jpeg") {
		return compressor ?? "mozjpeg";
	} else if (format === ".svg") {
		return undefined;
	} else {
		return compressor ?? "webp";
	}
}

/**
 * The function returns a default quality value of 80 or undefined if the format is .svg.
 * @param {number} quality - a number representing the quality of an image (between 0 and 100)
 * @param {string} format - The format parameter is a string that represents the file format of an
 * image. It is used to determine to apply a quality setting to the image. If the format
 * is '.svg', then no quality setting is applied and the function returns undefined. Otherwise, if the
 * format is any other image
 * @returns The function `getQuality` returns either the value of `quality` if `format` is not `.svg`,
 * or `undefined` if `format` is `.svg`. If `quality` is not provided or is falsy, the default value of
 * 80 is returned. The return type is `number | undefined`.
 */
export function getQuality(
	quality: number,
	format: string,
): number | undefined {
	return format === ".svg" ? undefined : quality || 80;
}

/**
 * The function returns progressive compression options for JPEG images, or undefined for other image
 * formats.
 * @param {boolean | undefined} progressive - A boolean value that indicates whether the JPEG
 * compression should be progressive or not. If it is undefined, the default value of true will be
 * used.
 * @param {string} format - a string representing the file format, such as ".jpg" or ".png"
 * @returns either the value of `progressive` if the `format` parameter is `.jpg` or `.jpeg`, or
 * `undefined` if it is not. If `progressive` is not provided, it defaults to `true`.
 */
export function getJpgCompressionOptions(
	progressive: boolean | undefined,
	format: string,
) {
	return format === ".jpg" || format === ".jpeg"
		? progressive ?? true
		: undefined;
}

/**
 * The function returns a set of options for an SVGO plugin based on the input format and plugins.
 * optimizing SVG files. If it is undefined, the function will use a default set of plugins.
 * @param optionsProvided - a string that contains a comma-separated list of options for configuring the `svgo` plugin
 * @param {string} format - a string representing the file format, with a leading dot (e.g. ".svg")
 * @returns The function `getSvgoPluginOptions` returns a string of SVGO plugin options if the `format`
 * parameter is `.svg`, otherwise it returns `undefined`. The `plugins` parameter is optional and if it
 * is not provided, the function returns a default set of SVGO plugins for cleaning up SVG attributes,
 * removing doctype, and removing XML processing instructions.
 */
export function getSvgoPluginOptions(
	optionsProvided: string | undefined,
	format: string,
) {
	if (format === ".svg") {
		// If a string is provided, split it by commas and trim each option otherwise return the default
		const plugins: string[] = optionsProvided
			? optionsProvided.split(",").map((option) => option.trim())
			: ["preset-default"];

		return plugins;
	} else {
		return undefined;
	}
}

/**
 * The function takes in a string of options, splits it by commas, and returns an object with the
 * options as an array under the "plugins" key.
 *
 * @param options The `options` parameter is a string that contains a comma-separated list of options
 *                for configuring the `svgo` plugin. These options will be split into an array and trimmed before
 *                being returned as an object with a `plugins` property.
 * @returns A function is being returned that takes in an argument `options` and returns an object of
 * type `SvgoConfig`. The function splits the `options` string by commas and trims each option, then
 * maps the resulting array to an array of `SvgoPluginConfig` objects. Finally, the function returns an
 * object with a `plugins` property set to the `conf` array.
 */
export function getSvgoOptions(
	options: SvgoPluginConfig[] | undefined,
): SvgoConfig {
	return {
		plugins: options ?? ["preset-default"],
	};
}

/**
 * The function takes in an array of image formats and returns
 * an object with the default compression options
 *
 * @param {InputFormats[]} imageFormats - an array of image formats
 */
export function defaultCompressionOptions(
	imageFormats?: InputFormats[],
): CompressionOptionsMap {
	if (!imageFormats) {
		imageFormats = inputFormats;
	}
	let options: Partial<CompressionOptionsMap> = {};
	imageFormats.forEach((format) => {
		if (format === ".svg") {
			options[format] = {
				plugins: defaultSvgoPlugins,
			};
		} else {
			options[format] = {
				compressor: "avif",
				quality: 50,
			};
		}
	});
	return options as CompressionOptionsMap;
}
