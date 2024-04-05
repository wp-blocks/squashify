import { CompressionOptions } from "./types";
import sharp, { OutputInfo } from "sharp";
import { transparentColor } from "./constants";

export function encodeImage(
	srcFilename: string,
	distFileName: string,
	compressOpt: CompressionOptions,
): Promise<OutputInfo> {
	/** @var {any} image Load the image with sharp */
	let image = sharp(srcFilename);

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
	if (
		compressOpt.options?.maxSize &&
		compressOpt.options?.resizeType !== "none"
	) {
		image = image.resize({
			width: compressOpt.options?.maxSize,
			height: compressOpt.options?.maxSize,
			fit: compressOpt.options?.resizeType,
			background: compressOpt.options?.background ?? transparentColor,
		});

		if (compressOpt.options?.outMargin) {
			image.extend({
				top: compressOpt.options?.outMargin,
				bottom: compressOpt.options?.outMargin,
				left: compressOpt.options?.outMargin,
				right: compressOpt.options?.outMargin,
				background: compressOpt.options?.background ?? transparentColor,
			});
		}
	}

	// Save the image to the destination directory
	return image.toFile(distFileName);
}
