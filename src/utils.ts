/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import {
  type Config as SvgoConfig,
  type PluginConfig as SvgoPluginConfig,
} from "svgo";

import {
  type Compressor,
  inputFormats,
  type InputFormats,
} from "./constants.js";
import {
  CompressImagePaths,
  type CompressionOption,
  type CompressionOptionsMap,
  ExtMode,
  GenericCompressionOptions,
  ResizeType,
} from "./types.js";
import ini from "ini";
import { writeFileSync } from "node:fs";

/**
 * The function returns compression settings for a given image format.
 *
 * @param imageFormat The format of the image that needs to be compressed, such as
 *                    "jpeg", "png", etc.
 * @param options     The settings parameter is an object that contains compression
 *                    settings for different image formats. It is expected to have properties for each
 *                    supported image format, where the property name is the format name (e.g. "jpeg",
 *                    "png") and the value is an object containing compression settings for that format.
 * @returns either the compression settings for the specified image format from the
 * provided settings object, or false if no compression settings are found for that
 * format.
 */
export function getCompressionOptions(
  imageFormat: string,
  options: CompressionOptionsMap,
): Partial<CompressionOption> | undefined {
  if (imageFormat.startsWith(".")) {
    imageFormat = imageFormat.substring(1);
  }
  return options
    ? options[imageFormat as keyof CompressionOptionsMap]
    : undefined;
}

/**
 * Type guard for image formats
 *
 * @param ext the image format to check
 */
export function asInputFormats(ext: string | undefined): ext is InputFormats {
  return ext ? inputFormats.includes(ext as InputFormats) : false;
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
    const sourceDir = path.join(process.cwd(), dir);
    logMessage("Searching for images in " + path.resolve(sourceDir), true);

    const files = fs.readdirSync(sourceDir);

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
        const fileInfo = path.parse(file);
        let ext = fileInfo.ext.toLowerCase(); // get the file extension in lowercase

        if (ext.startsWith(".")) {
          ext = ext.substring(1); // remove the dot from the extension
        }

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
 * Returns the output file extension for a given image format
 * is needed because the mozjpeg compressor needs to be saved with the jpg extension
 * and to avoid the jpeg extension being added to the output file when saving a jpeg file
 *
 * @param compressor  The image format
 * @param originalExt The original file extension
 * @returns The output file extension
 */
export function getOutputExtension(
  compressor: Compressor | undefined,
  originalExt: InputFormats,
) {
  // If no compressor is found, return the original extension
  if (!compressor) return originalExt;

  // If the original extension is not jpg, return the original extension
  let newExt = "." + compressor;

  // If the original extension is jpg, add the jpg extension
  switch (compressor) {
    case "jpg":
    case "mozjpeg":
      newExt = ".jpg";
      break;
  }

  // Return the new extension
  return originalExt !== newExt ? newExt : "";
}

/**
 * The function returns a compressor based on the input format, with a default value if none is
 * provided.
 * @param {Compressor} compressor - The compressor parameter is a variable of type Compressor, which is
 * likely an enum or a string type that specifies the type of image compressor to use.
 * @param {string} format - The format parameter is a string that represents the file format of an
 * image. It can be '.jpg', '.jpeg', or '.svg'.
 * @returns a compressor name based on the input format. If the format is '.jpg' or '.jpeg', it returns
 * the input compressor if it is not null or undefined, otherwise it returns 'mozjpeg'. If the format
 * is '.svg', it returns undefined. For all other formats, it returns the input compressor if it is not
 * null or undefined, otherwise it returns 'webp'.
 */
export function getDefaultCompressor(
  compressor: string | undefined,
  format: string,
) {
  switch (format) {
    case "jpg":
    case "jpeg":
      return compressor ?? "mozjpeg";
    case "svg":
      return "svgo";
    default:
      return compressor ?? "webp";
  }
}

/**
 * The function returns a default quality value of 80 or undefined if the format is .svg.
 * @param {number} quality - a number representing the quality of an image (between 0 and 100)
 * @param {string} format - The format parameter is a string that represents the file format of an
 * image. It is used to determine to apply a quality setting to the image. If the format
 * is '.svg', then no quality setting is applied and the function returns undefined. Otherwise, if the
 * format is any other image
 * @returns The function `getQuality` returns either the value of `quality` if `format` is not `.svg`,
 * or `undefined` if `format` is `.svg`. If `quality` is not provided or is falsy, the default value of
 * 80 is returned. The return type is `number | undefined`.
 */
export function getQuality(
  quality: number,
  format: string,
): number | undefined {
  return format === ".svg" ? undefined : quality || 80;
}

/**
 * The function returns progressive compression settings for JPEG images, or undefined for other image
 * formats.
 * @param {boolean | undefined} progressive - A boolean value that indicates whether the JPEG
 * compression should be progressive or not. If it is undefined, the default value of true will be
 * used.
 * @returns either the value of `progressive` if the `format` parameter is `.jpg` or `.jpeg`, or
 * `undefined` if it is not. If `progressive` is not provided, it defaults to `true`.
 */
export function getJpgCompressionOptions(progressive: boolean | undefined) {
  return progressive ?? true;
}

/**
 * The function returns a set of settings for an SVGO plugin based on the input format and plugins.
 * optimizing SVG files. If it is undefined, the function will use a default set of plugins.
 * @param optionsProvided - a string that contains a comma-separated list of settings for configuring the `svgo` plugin
 * @returns The function `getSvgoPluginOptions` returns a string of SVGO plugin settings if the `format`
 * parameter is `.svg`, otherwise it returns `undefined`. The `plugins` parameter is optional and if it
 * is not provided, the function returns a default set of SVGO plugins for cleaning up SVG attributes,
 * removing doctype, and removing XML processing instructions.
 */
export function getSvgoPluginOptions(
  optionsProvided: string[],
): SvgoPluginConfig[] {
  // If a string is provided, split it by commas and trim each option otherwise return the default
  return optionsProvided
    ? optionsProvided.map((option) => option.trim() as SvgoPluginConfig)
    : (["preset-default"] as SvgoPluginConfig[]);
}

/**
 * The function takes in a string of settings, splits it by commas, and returns an object with the
 * settings as an array under the "plugins" key.
 *
 * @param options The `settings` parameter is a string that contains a comma-separated list of settings
 *                for configuring the `svgo` plugin. These settings will be split into an array and trimmed before
 *                being returned as an object with a `plugins` property.
 * @returns A function is being returned that takes in an argument `settings` and returns an object of
 * type `SvgoConfig`. The function splits the `settings` string by commas and trims each option, then
 * maps the resulting array to an array of `SvgoPluginConfig` objects. Finally, the function returns an
 * object with a `plugins` property set to the `conf` array.
 */
export function getSvgoOptions(
  options: SvgoPluginConfig[] | undefined,
): SvgoConfig {
  return {
    plugins: options ?? ["preset-default"],
  };
}

/**
 * The function takes in an array of image formats and returns
 * an object with the default compression settings
 *
 * @param {InputFormats[]} imageFormats - an array of image formats
 */
export function defaultCompressionOptions(
  imageFormats?: InputFormats[],
): CompressionOptionsMap {
  if (!imageFormats) {
    imageFormats = inputFormats;
  }
  const options: Partial<CompressionOptionsMap> = {};
  imageFormats.forEach((format) => {
    if (format === "svg") {
      options[format as "svg"] = {
        compressor: "svgo",
        plugins: ["default"],
      } as GenericCompressionOptions;
    } else if (format === "gif") {
      options[format] = {
        compressor: "webp",
        animation: true,
        quality: 80,
      } as GenericCompressionOptions;
    } else {
      options[format] = {
        compressor: "avif",
        quality: 50,
      } as GenericCompressionOptions;
    }
  });
  return options as CompressionOptionsMap;
}

/**
 * Get the file name based on the extension mode, extension, paths, and compressor.
 * @param extMode - the extension mode
 * @param paths - the paths
 * @param compressor - the compressor
 */
export function getFileName(
  extMode: ExtMode = "replace",
  paths: CompressImagePaths,
  compressor: Compressor,
) {
  if (compressor === "mozjpeg") {
    compressor = "jpg";
  }
  const ext = "." + compressor;
  return extMode === "add" && paths?.ext !== ext
    ? paths?.base + ext
    : paths?.name + ext;
}

/**
 * Generates a default configuration file based on the provided arguments.
 *
 * @param filename - The name of the configuration file.
 * @param {Record<string, string>} argv - The input arguments for configuration.
 */
export function generateDefaultConfigFile(
  filename: string,
  argv: Record<string, string>,
) {
  const opts = {
    verbose: argv.verbose === "true",
    extMode: (argv.extMode as ExtMode) || "replace",
    maxSize: Number(argv.maxSize) || undefined,
    resizeType: (argv.resizeType as ResizeType) || undefined,
  } as Record<string, unknown>;

  const defaultConfig: Record<string, unknown> = {
    path: {
      in: argv.input ?? "images",
      out: argv.output ?? "optimized",
    },
    options: JSON.parse(JSON.stringify(opts)), // will remove undefined values
    ...defaultCompressionOptions(),
    svg: {
      // override the default settings for SVG images
      compressor: "svgo",
      plugins: "defaults",
    },
  };

  const iniFileContent = ini.stringify(defaultConfig);

  return writeFileSync(filename, iniFileContent);
}

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}
