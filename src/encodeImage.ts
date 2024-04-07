import {
  CompressionMeta,
  CompressionOption,
  OutputData,
  ResizeType,
} from "./types";
import sharp, { FitEnum } from "sharp";
import { transparentColor } from "./constants";

export function encodeImage(
  src: string,
  dist: string,
  compressOpt: CompressionMeta,
): Promise<OutputData> {
  /** @var {any} image Load the image with sharp */
  let image = sharp(src);

  const options = compressOpt.options;

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
  if (options?.maxSize && options?.resizeType !== "none") {
    image = image.resize({
      width: options?.maxSize,
      height: options?.maxSize,
      fit: options?.resizeType as keyof FitEnum,
      background: options?.background ?? transparentColor,
    });

    if (options?.outMargin) {
      image.extend({
        top: options?.outMargin,
        bottom: options?.outMargin,
        left: options?.outMargin,
        right: options?.outMargin,
        background: options?.background ?? transparentColor,
      });
    }
  }

  // Save the image to the destination directory
  return image.toFile(dist);
}
