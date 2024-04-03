import prompts from "prompts";

import {
	distDirQuestion,
	getImageCompressionOptions,
	srcDirQuestion,
} from "./options";
import { CompressionOptionsMap, type ScriptOptions } from "./types";
import {
	defaultCompressionOptions,
	getImageFormatsInFolder,
	logMessage,
} from "./utils";
import { InputFormats } from "./constants";

export async function getInteractiveCompressorOptions(
	imageFormats: InputFormats[],
	verbose = false,
): Promise<CompressionOptionsMap> {
	const response = await prompts({
		type: "confirm",
		name: "useDefaultCompressionOptions",
		message: "Do you want to use the default compression options?",
		initial: true,
	});

	if (response.useDefaultCompressionOptions) {
		//return a promise that resolves with the default compression options
		return await new Promise((resolve) => {
			resolve(defaultCompressionOptions(imageFormats));
		});
	} else {
		// Prompt the user for compression options
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
	const imageFormats = getImageFormatsInFolder(options.srcDir);

	// If no image formats are found, return
	if (imageFormats.length === 0) {
		logMessage(
			"No image formats found in the source directory",
			options.verbose,
		);
		return options;
	}

	// If the compression options are not specified, use the default compression options
	if (Object.keys(options.compressionOptions).length === 0) {
		console.log(
			"No compression options found, so we will use the default compression options",
		);
		options.compressionOptions = defaultCompressionOptions();
	}

	// If the compression options are not specified, prompt the user if he wants to use the default compression settings
	if (Object.keys(options.compressionOptions).length === 0) {
		options.compressionOptions = await getInteractiveCompressorOptions(
			imageFormats,
			options.verbose,
		);
	}

	return options;
}
