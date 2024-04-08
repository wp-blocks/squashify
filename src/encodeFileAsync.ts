import {
  CompressImagePaths,
  CompressionMeta,
  OutputData,
  SVGCompressionOption,
} from "./types";
import path from "path";
import { getFileName, logMessage } from "./utils";
import { encodeSvg } from "./encodeSvg";
import { encodeAnimation } from "./encodeAnimation";
import { encodeImage } from "./encodeImage";

export function encodeFileAsync(
  encodeSetup: CompressionMeta,
): Promise<OutputData> {
  /** destructuring the settings */
  const { compressor, paths, options } = encodeSetup as CompressionMeta;
  /**
   * If the compression is enabled for the image format and the extension is an image file
   */
  if (paths.ext === ".svg" && compressor === "svgo") {
    /**
     * SVG optimization
     */
    const filePath = path.join(paths.distPath, paths.base);
    logMessage("📐 Processing " + filePath, encodeSetup?.verbose);
    return encodeSvg(paths.srcDir, filePath, options as SVGCompressionOption);
  } else {
    /**
     * Default Images compression
     */
    const outputFile = getFileName(
      options?.extMode,
      paths as CompressImagePaths,
      compressor,
    );

    /**
     * The rest of the image formats
     */
    if ("encodeAnimated" in encodeSetup) {
      logMessage("🎬️ Processing " + outputFile, encodeSetup?.verbose);
      return encodeAnimation(
        paths.srcPath,
        path.join(paths.distPath, outputFile),
      );
    } else {
      logMessage("🖼️ Processing " + outputFile, encodeSetup?.verbose);

      return encodeImage(
        paths.srcPath,
        path.join(paths.distPath, outputFile),
        encodeSetup,
      );
    }
  }
}
