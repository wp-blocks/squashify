import { convertImages } from "./compression.js";
import { getIniOptions } from "./parseIni.js";
import { getPromptOptions } from "./prompts.js";
import { parseOptions } from "./parseOptions.js";
import { getImageFormatsInFolder, logMessage } from "./utils.js";
import { encodeFileAsync } from "./encodeFileAsync.js";
import { encodeSvg } from "./encodeSvg.js";
import { encodeAnimation } from "./encodeAnimation.js";
import { encodeImage } from "./encodeImage.js";
import { CliOptions } from "./types.js";
import main from "./bin.js";

/**
 * Prompts the user for the source and destination directories
 * then runs a function that converts the images.
 *
 * @returns Promise that resolves when the image conversion is complete
 */
export default async function squashify(cliOptions: CliOptions) {
  // Get the settings from the .ini file
  const iniOptions = getIniOptions(cliOptions.configFile);

  // Parse the settings
  let options = parseOptions(cliOptions, iniOptions);

  // Prompt the user for the script settings
  if (cliOptions.interactive === true) {
    options = await getPromptOptions(options);
  }

  // Check for missing settings
  const missingOptions = ["srcDir", "distDir"].filter(
    (option) => !options[option as keyof typeof options],
  );
  if (missingOptions.length > 0) {
    throw new Error(`Missing required options: ${missingOptions.join(", ")}`);
  }

  // Print the settings to the console
  logMessage("Options:" + JSON.stringify(options), cliOptions.verbose);

  // Start the timer
  const startTime = Date.now();

  // Then convert the images in the source directory
  const result = await convertImages(options);

  return {
    result,
    timeElapsed: (Date.now() - startTime) / 1000,
    verbose: cliOptions.verbose,
  };
}

export {
  main,
  getIniOptions,
  convertImages,
  getImageFormatsInFolder,
  encodeFileAsync,
  encodeSvg,
  encodeAnimation,
  encodeImage,
};
