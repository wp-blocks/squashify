import { CompressImagePaths, CompressionOptions } from "./types";
import sharp from "sharp";
import { getOutputExtension } from "./utils";
import path from "path";

export function encodeImage(
	filePath: string,
	destFile: string,
	compressOpt = {} as CompressionOptions,
): (Promise<sharp.OutputInfo> | Promise<sharp.Metadata>)[] {
	const { basename, ext, file } = compressOpt.paths as CompressImagePaths;
	// Get the output extension
	const outputExt = getOutputExtension(compressOpt.compressor, ext);
	// Get the extension of the file
	const outputFile =
		compressOpt.options?.extMode === "add" &&
		ext.substring(1) !== compressOpt.compressor
			? file + outputExt
			: basename + outputExt;
	// Save the image to the destination directory
	const distFileName = path.join(destFile, outputFile);

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

	// Get image metadata
	const imageMeta = image.metadata();

	// Save the image to the destination directory
	if (compressOpt.resizeType !== "none") {
		image = image.resize({
			width: compressOpt.maxSize,
			height: compressOpt.maxSize,
			fit: compressOpt.resizeType,
		});
	}

	const writeFile = image.toFile(distFileName);

	return [writeFile, imageMeta];
}
