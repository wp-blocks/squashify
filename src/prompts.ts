import prompts from "prompts";

import {
  distDirQuestion,
  promptsToAsk,
  srcDirQuestion,
  toggleQuestion,
} from "./options.js";
import { type CompressionOption, type ScriptOptions } from "./types.js";
import {
  defaultCompressionOptions,
  getImageFormatsInFolder,
  logMessage,
} from "./utils.js";
import type { InputFormats } from "./constants.js";

export async function getPromptOptions(
  options: ScriptOptions,
): Promise<ScriptOptions> {
  // If the source directory is not specified, prompt the user
  if (!options.srcDir) {
    const response = await prompts(srcDirQuestion);
    options.srcDir = response.srcDir;
  }

  // If the destination directory is not specified, prompt the user
  if (!options.distDir) {
    const response = await prompts(distDirQuestion);
    options.distDir = response.distDir;
  }

  // Get the image formats
  const imageFormats = getImageFormatsInFolder(options.srcDir as string);

  // If no image formats are found, return
  if (!imageFormats.length) {
    throw new Error("No image formats found in the source directory, aborting");
  } else {
    logMessage(
      `Found ${imageFormats.length} image formats in the source directory, ` +
        imageFormats.join(", "),
      true,
    );
  }

  // Check if the user wants to use the default compression options
  const response = await prompts(toggleQuestion);

  if (response?.loadDefaults !== false) {
    //return a promise that resolves with the default compression settings
    options.compressionOptions = await new Promise((resolve) => {
      resolve(defaultCompressionOptions(imageFormats));
    });
  } else {
    // Prompt the user for compression settings
    options.compressionOptions = await getImageCompressionOptions(
      imageFormats,
      options.verbose,
    );
  }

  return options;
}

/**
 * This function prompts the user for settings to compress different image formats,
 * including SVG files with custom SVGO plugins.
 *
 * @param imageFormats - An array of image file formats (e.g. ['.jpg', '.png', '.svg'])
 *                     that the function will prompt the user about compressing.
 * @param verbose - Whether to log messages
 * @returns an object containing compression settings for different image formats. The
 * settings are obtained through a series of prompts that ask the user whether they want
 * to compress each format, which compressor to use (if applicable), and the quality
 * level (if applicable). For SVG files, the user can also choose which SVGO plugins to
 * use for compression.
 */
export async function getImageCompressionOptions(
  imageFormats: InputFormats[],
  verbose = false,
): Promise<{ [key in InputFormats]: CompressionOption }> {
  const options = {} as { [key in InputFormats]: CompressionOption };

  for (const format of imageFormats) {
    logMessage("==".concat(format, "=="), verbose);
    const response: CompressionOption = (await prompts(
      promptsToAsk(format),
    )) as CompressionOption;

    if (!response.compressor) {
      logMessage(`Skipping ${format} files...`, verbose);
      continue;
    }

    options[format] = response;
  }

  return options;
}
