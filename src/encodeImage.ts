import { CompressImagePaths, CompressionOptions } from "./types";
import sharp, { OutputInfo } from "sharp";

export function encodeImage(
	compressOpt: CompressionOptions,
	distFileName: string,
): Promise<OutputInfo> {
	const { paths } = compressOpt as {
		paths: CompressImagePaths;
	};

	/** @var {any} image Load the image with sharp */
	let image = sharp(paths?.source);

	/**
	 * The rest of the image formats
	 * Will apply compression settings if specified in the settings
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

	// Save the image to the destination directory
	if (compressOpt.options?.resizeType !== "none") {
		image = image.resize({
			width: compressOpt.options?.maxSize,
			height: compressOpt.options?.maxSize,
			fit: compressOpt.options?.resizeType,
		});
	}

	return image.toFile(distFileName);
}
