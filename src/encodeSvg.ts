import type { PluginConfig as SvgoPluginConfig } from "svgo";
import { readFile, writeFile } from "node:fs/promises";
import { getSvgoOptions, optimizeSvg } from "./utils";
import sharp from "sharp";

export async function encodeSvg(
	filePath: string,
	destFile: string,
	options?: SvgoPluginConfig[] | undefined,
) {
	// Get the extension of the file
	let message: string = "";
	// Read the SVG file from the file system
	return readFile(filePath, "utf8")
		.then(async (data) => {
			message = "svg file " + filePath + " size " + data.length;
			// Save the image to the destination directory
			return await optimizeSvg(data, getSvgoOptions(options));
		})
		.then(async (optimizedSvg) => {
			if (!optimizedSvg) {
				return message + " has failed";
			}
			message += " optimizedSvg size " + optimizedSvg.length;
			// Write the optimized SVG to the output file
			const writePromise = writeFile(destFile, optimizedSvg as string);

			// Get image metadata
			const imageMeta = sharp(optimizedSvg).metadata();

			return [writePromise, imageMeta];
		});
}
