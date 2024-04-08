import { Config as SvgoConfig, optimize } from "svgo";
import { readFile, writeFile } from "node:fs/promises";
import { getSvgoOptions } from "./utils.js";
import { OutputData, SVGCompressionOption } from "./types.js";
import { parseString } from "xml2js";

interface SVGMetadata {
  width?: string | null;
  height?: string | null;
  viewBox?: string | null;
  title?: string | null;
  description?: string | null;
  author?: string | null;
  creationDate?: string | null;
  copyright?: string | null;
  softwareUsed?: string | null;
  customMetadata?: string[];
}

async function getSVGMetadata(svgString: string): Promise<{
  metadata: SVGMetadata;
  itemCount: number;
}> {
  return await new Promise((resolve, reject) => {
    parseString(svgString, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      const svgElement = result.svg;

      const metadata: SVGMetadata = {
        width: svgElement.$.width,
        height: svgElement.$.height,
        viewBox: svgElement.$.viewBox,
      };

      // If width and height are not defined, use viewBox to determine dimensions
      if ((!metadata.width || !metadata.height) && metadata.viewBox) {
        const viewBox = metadata.viewBox.split(" ");
        if (viewBox.length === 4) {
          metadata.width = viewBox[2];
          metadata.height = viewBox[3];
        }
      }

      if (svgElement.title && svgElement.title.length > 0) {
        metadata.title = svgElement.title[0];
      }

      if (svgElement.desc && svgElement.desc.length > 0) {
        metadata.description = svgElement.desc[0];
      }

      if (svgElement.metadata && svgElement.metadata.length > 0) {
        const metadataElements = svgElement.metadata[0];
        for (const key in metadataElements) {
          if (key === "$") continue; // Skip attributes
          const content = metadataElements[key][0];
          switch (key) {
            case "author":
              metadata.author = content;
              break;
            case "creationdate":
              metadata.creationDate = content;
              break;
            case "copyright":
              metadata.copyright = content;
              break;
            case "softwareused":
              metadata.softwareUsed = content;
              break;
            default:
              if (!metadata.customMetadata) {
                metadata.customMetadata = [];
              }
              metadata.customMetadata.push(`${key}: ${content}`);
              break;
          }
        }
      }

      // remove the metadata that are undefined or false
      for (const key in metadata as SVGMetadata) {
        if (!metadata[key as keyof SVGMetadata]) {
          delete metadata[key as keyof SVGMetadata];
        }
      }

      const itemCount = Object.keys(svgElement).length - 1; // Subtract 1 for metadata

      resolve({ metadata, itemCount });
    });
  });
}

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
 * @param srcFilename - The path to the SVG file.
 * @param distFileName - The path to the destination file.
 * @param {SvgoPluginConfig[] | undefined} options - Optional Svgo plugin configurations.
 * @return {Promise<Metadata>} A promise that resolves with the metadata of the optimized image.
 */
export async function encodeSvg(
  srcFilename: string,
  distFileName: string,
  options: SVGCompressionOption,
): Promise<OutputData> {
  // Read the SVG file from the file system
  const originalSvg = await readFile(srcFilename, "utf8");

  /**
   * Read the SVG file from the file system and optimize it using SVGO
   */
  const result = optimizeSvg(originalSvg, getSvgoOptions(options.plugins));

  const { metadata, itemCount } = await getSVGMetadata(result);

  // Write the optimized SVG to the destination directory
  return writeFile(distFileName, result, "utf8").then(() => {
    /**
     * Mock the output data
     */
    return {
      originalSize: originalSvg.length,
      size: result.length,
      src: srcFilename,
      dist: distFileName,
      metadata,
      itemCount,
    } as OutputData;
  });
}
