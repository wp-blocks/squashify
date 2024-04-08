import { CompressionMeta, OutputData } from "./types.js";
import sharp, { FitEnum } from "sharp";
import { transparentColor } from "./constants.js";

export function encodeImage(
  src: string,
  dist: string,
  compressOpt: CompressionMeta,
): Promise<OutputData> {
  /** @var {any} image Load the image with sharp */
  let image = sharp(src);

  const options = compressOpt;

  /**
   * The rest of the image formats
   * Will apply compression settings if specified in the settings
   */
  if (compressOpt.compressor) {
    switch (compressOpt.compressor) {
      case "avif":
        image = image.avif({
          quality: compressOpt.quality,
        } as sharp.AvifOptions);
        break;
      case "webp":
        image = image.webp({
          quality: compressOpt.quality,
        } as sharp.WebpOptions);
        break;
      case "png":
        image = image.png({} as sharp.PngOptions);
        break;
      case "mozjpeg":
        image = image.jpeg({
          mozjpeg: true,
          quality: compressOpt.quality,
        } as sharp.JpegOptions);
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
  if (options.options?.maxSize) {
    image = image.resize({
      width: options.options?.maxSize,
      height: options.options?.maxSize,
      fit: options.options?.resizeType as keyof FitEnum,
      background: options.options?.background ?? transparentColor,
    });

    if (options.options?.outMargin) {
      image.extend({
        top: options.options?.outMargin,
        bottom: options.options?.outMargin,
        left: options.options?.outMargin,
        right: options.options?.outMargin,
        background: options.options?.background ?? transparentColor,
      });
    }
  }

  // Save the image to the destination directory
  return image.toFile(dist);
}
