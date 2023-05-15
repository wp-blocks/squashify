/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

import {Compressor, inputFormats, InputFormats} from './constants';
import {CompressionOptions} from "./types";
import {Config as SvgoConfig, optimize, PluginConfig as SvgoPluginConfig} from "svgo";

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
export function getCompressionOptions(imageFormat: string, options): CompressionOptions | false {
	return options[imageFormat] ?? false;
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
export function getImageFormatsInFolder(folderPath: string): InputFormats[] {
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
	svgoOptions: SvgoConfig
): Promise<void> {
	// Start a Promise that resolves when the file is written
	return new Promise((resolve, reject) => {
		// Read the SVG file from the file system
		fs.readFile(filePath, 'utf8', (err, svg) => {
			if (err) {
				return reject(err);
			}

			// Optimize the SVG with SVGO
			const optimizedSvg = optimize(svg, svgoOptions);

			// Write the optimized SVG to the output file
			fs.writeFile(distPath, optimizedSvg.data, (err) => {
				if (err) {
					return reject(err);
				}

				// Resolve the Promise when the file is written
				resolve();
			});
		});
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
export function getOutputExtension( compressor: Compressor, originalExt ) {
	let newExt = '.'.concat( compressor );

	switch ( compressor ) {
		case 'jpg':
		case 'mozjpeg':
			newExt = '.jpg';
			break;
	}

	return originalExt !== newExt ? newExt : '';
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
export function getSvgoOptions(options): SvgoConfig {
	// return the string as array split by commas
	const conf = options ? options.split(',').map(option => option.trim()) as SvgoPluginConfig[] : null;
	return {
		plugins: conf
	};
}
