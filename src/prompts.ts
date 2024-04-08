import prompts from "prompts";

import {
  distDirQuestion,
  getImageCompressionOptions,
  srcDirQuestion,
} from "./options.js";
import { CompressionOptionsMap, type ScriptOptions } from "./types.js";
import { defaultCompressionOptions, getImageFormatsInFolder } from "./utils.js";
import { InputFormats } from "./constants.js";

export async function getInteractiveCompressorOptions(
  imageFormats: InputFormats[],
  verbose: boolean | undefined = false,
): Promise<CompressionOptionsMap> {
  const response = await prompts({
    type: "confirm",
    name: "useDefaultCompressionOptions",
    message: "Do you want to use the default compression settings?",
  });

  if (response.useDefaultCompressionOptions !== true) {
    //return a promise that resolves with the default compression settings
    return await new Promise((resolve) => {
      resolve(defaultCompressionOptions(imageFormats));
    });
  } else {
    // Prompt the user for compression settings
    return await getImageCompressionOptions(imageFormats, verbose);
  }
}

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
  if (imageFormats.length === 0) {
    throw new Error("No image formats found in the source directory, aborting");
  }

  // If the compression settings are not specified, prompt the user if he wants to use the default compression settings
  options.compressionOptions = await getInteractiveCompressorOptions(
    imageFormats,
    options.verbose,
  );

  return options;
}
