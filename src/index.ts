#!/usr/bin/env node
import yargs from "yargs";

import { getCliOptions } from "./args";
import { convertImages } from "./compression";
import { getIniOptions } from "./ini";
import { getPromptOptions } from "./prompts";
import { defaultCompressionOptions } from "./utils";
import { hideBin } from "yargs/helpers";
import process from "process";

/**
 * Prompts the user for the source and destination directories
 * then runs a function that converts the images.
 *
 * @returns Promise that resolves when the image conversion is complete
 */
export default async function main(): Promise<unknown> {
	// Get the cli options
	let options = getCliOptions(yargs(hideBin(process.argv)));

	// Get the options from the ini file
	options = getIniOptions(options);

	// check for missing options
	const missingOptions = ["srcDir", "distDir"].filter(
		(option) => !options[option as keyof typeof options],
	);

	// Prompt the user for the script options
	if (options.interactive === true || missingOptions.length > 0) {
		options = await getPromptOptions(options);
	}

	if (Object.keys(options.compressionOptions).length === 0) {
		console.log(
			"No compression options found, so we will use the default compression options",
		);
		options.compressionOptions = defaultCompressionOptions();
	}

	// Print the options to the console
	if (options.verbose) {
		console.log("Options:", options);
	}

	// Start the timer
	const startTime = Date.now();

	// Then convert the images in the source directory
	const res = await convertImages(options);

	if (res) {
		res.forEach((result) => {
			if (result.status !== "fulfilled") {
				console.log("🔴 " + result.reason);
			} else {
				console.log("🟢 " + result.value);
			}
		});
		// Print the time elapsed in seconds to the console
		console.log(
			`The end 🎉 - Time elapsed: ${(Date.now() - startTime) / 1000} seconds`,
		);
		return res;
	}
}

main().catch((err) => {
	console.error(err);
});
