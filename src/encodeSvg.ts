import { Config as SvgoConfig, optimize } from "svgo";
import { readFile, writeFile } from "node:fs/promises";
import { getSvgoOptions } from "./utils";
import { CompressImagePaths, CompressionOptions } from "./types";

/**
 * The function optimizes an SVG file asynchronously using SVGO and writes the optimized SVG to a
 * specified output file.
 *
 *                    where the optimized SVG file will be written to.
 * @param svg         The SVG file to optimize
 * @param svgoOptions `svgoOptions` is an object that contains settings for optimizing
 *                    the SVG using SVGO (SVG Optimizer). These settings can include things like removing
 *                    comments, removing empty groups, and optimizing path data. The specific settings and
 *                    their values will depend on the desired optimization settings.
 */
export function optimizeSvg(svg: string, svgoOptions: SvgoConfig) {
	// Optimize the SVG with SVGO
	const optimizedSvg = optimize(svg, svgoOptions);

	if (!optimizedSvg.data) {
		throw new Error("Failed to optimize SVG");
	}

	// Resolve the Promise with the optimized SVG
	return optimizedSvg.data;
}

/**
 * Encodes an SVG file, optimizes it, and saves it to a destination directory.
 *
 * @param {SvgoPluginConfig[] | undefined} options - Optional Svgo plugin configurations.
 * @param distFileName
 * @return {Promise<Metadata>} A promise that resolves with the metadata of the optimized image.
 */
export async function encodeSvg(
	options: CompressionOptions,
	distFileName: string,
): Promise<void> {
	const paths = options?.paths as CompressImagePaths;
	// Read the SVG file from the file system
	const originalSvg = await readFile(paths?.source, "utf8");

	/**
	 * Read the SVG file from the file system and optimize it using SVGO
	 */
	const result = optimizeSvg(originalSvg, getSvgoOptions(options?.plugins));
	return writeFile(distFileName, result, "utf8");
}
