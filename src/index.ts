#!/usr/bin/env node
import yargs from "yargs";

import { getCliOptions } from "./args";
import { convertImages } from "./compression";
import { getIniOptions, parseOptions } from "./ini";
import { getPromptOptions } from "./prompts";
import { hideBin } from "yargs/helpers";
import process from "process";

/**
 * Prompts the user for the source and destination directories
 * then runs a function that converts the images.
 *
 * @returns Promise that resolves when the image conversion is complete
 */
export default async function main() {
	// Get the cli settings
	const cliOptions = getCliOptions(yargs(hideBin(process.argv)));

	// Get the settings from the .ini file
	const iniOptions = getIniOptions(cliOptions.configFile);

	// Parse the settings
	let options = parseOptions(cliOptions, iniOptions);

	// check for missing settings
	const missingOptions = ["srcDir", "distDir"].filter(
		(option) => !options[option as keyof typeof options],
	);

	// Prompt the user for the script settings
	if (cliOptions.interactive === true || missingOptions.length > 0) {
		options = await getPromptOptions(options);
	}

	// Print the settings to the console
	if (options.verbose) {
		console.log("Options:", options);
	}

	// Start the timer
	const startTime = Date.now();

	// Then convert the images in the source directory
	await convertImages(options);

	// Print the time elapsed in seconds to the console
	console.log(
		`The end 🎉 - Time elapsed: ${(Date.now() - startTime) / 1000} seconds`,
	);

	return;
}

main().catch((err) => {
	console.error(err);
});
