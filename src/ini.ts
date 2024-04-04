import fs from "fs";
import ini from "ini";
import { Compressor, inputFormats } from "./constants";
import {
	ExtModes,
	type IniOptions,
	ResizeType,
	type ScriptOptions,
} from "./types";
import {
	getDefaultCompressor,
	getJpgCompressionOptions,
	getQuality,
	getSvgoPluginOptions,
	logMessage,
} from "./utils";
import path from "path";

/**
 * This function reads and parses a configuration file to get compression settings and updates the
 * script settings accordingly.
 *
 * for a script. It is of type `ScriptOptions`.
 * @returns the updated `settings` object with values from the configuration file, or the original
 * `settings` object if no configuration file is found or if there is an error parsing the configuration
 * file.
 * @param configFile
 */
export function getIniOptions(
	configFile: string | undefined = ".squash",
): IniOptions {
	let iniOptions: IniOptions = {};

	try {
		// Get the compression settings in the configuration file
		iniOptions = ini.parse(
			fs.readFileSync(path.join(process.cwd(), configFile), "utf-8"),
		);
	} catch (err) {
		console.log(
			`🎃 Squashify: Cannot find a valid configuration or ${configFile} file does not exist.`,
		);
	}

	return iniOptions;
}

export function parseOptions(
	options: ScriptOptions,
	iniOptions: IniOptions,
): ScriptOptions {
	// the source and destination directories
	options.srcDir = options.srcDir || String(iniOptions?.in) || "";
	options.distDir = options.distDir || String(iniOptions?.out) || "";

	options.options = {
		// the ext format settings
		extMode:
			options.options.extMode ?? (iniOptions.extMode as ExtModes) ?? "replace",
		// the resize settings
		resizeType:
			options.options.resizeType ??
			(iniOptions.resizeType as ResizeType) ??
			"none",
		maxSize:
			Number(options.options.maxSize) ??
			Number(iniOptions.maxSize) ??
			undefined,
	};

	// parse known settings about formats
	options.compressionOptions = { ...options.compressionOptions };

	// parse the settings for all formats in the inputFormats array
	inputFormats
		// then parse the settings for each format
		.forEach((format) => {
			const currentIniOption = iniOptions[format] as Record<string, string>;

			options.compressionOptions[format] = {
				compressor: getDefaultCompressor(
					currentIniOption?.compressor,
					format,
				) as Compressor,
				quality: getQuality(
					Number(currentIniOption?.quality),
					format,
				) as number,
			};

			if (format === ".svg") {
				options.compressionOptions[format].plugins = getSvgoPluginOptions(
					currentIniOption?.plugins.split(","),
				);
			}

			if (format === ".jpg") {
				options.compressionOptions[format].progressive =
					getJpgCompressionOptions(Boolean(currentIniOption?.progressive));
			}
		});

	logMessage(
		`Configuration file loaded, options: ${JSON.stringify(options)} ${options.verbose}`,
	);
	return options;
}
