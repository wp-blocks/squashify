import fs from "fs";

import ini from "ini";

import { Compressor, inputFormats } from "./constants";
import {
	type CompressionOptionsMap,
	ExtModes,
	type IniOptions,
	ResizeType,
	type ScriptOptions,
} from "./types";
import {
	getCompressor,
	getJpgCompressionOptions,
	getQuality,
	getSvgoPluginOptions,
	logMessage,
} from "./utils";
import { PluginConfig as SvgoPluginConfig } from "svgo";

/**
 * This function reads and parses a configuration file to get compression options and updates the
 * script options accordingly.
 *
 * @param {ScriptOptions} scriptOptions - The `options` parameter is an object that contains various options
 * for a script. It is of type `ScriptOptions`.
 * @returns the updated `options` object with values from the configuration file, or the original
 * `options` object if no configuration file is found or if there is an error parsing the configuration
 * file.
 */
export function getIniOptions(scriptOptions: ScriptOptions): ScriptOptions {
	let iniOptions: IniOptions;

	if (!scriptOptions.configFile) {
		console.log(
			`🎃 Squashify: No ${scriptOptions.configFile} file found. Please read the https://github.com/wp-blocks/squashify to know more about!`,
		);
		return scriptOptions;
	}

	try {
		// Get the compression options in the configuration file
		iniOptions = ini.parse(
			fs.readFileSync(`./${scriptOptions.configFile}`, "utf-8"),
		);
	} catch (err) {
		console.log(
			`🎃 Squashify: Cannot find a valid configuration or ${scriptOptions.configFile} file does not exist.`,
		);
		return scriptOptions;
	}

	if (Object.keys(iniOptions).length > 0) {
		// the source and destination directories
		scriptOptions.srcDir =
			scriptOptions.srcDir || (iniOptions.path as { in?: string })?.in || "";
		scriptOptions.distDir =
			scriptOptions.distDir || (iniOptions.path as { out?: string })?.out || "";

		scriptOptions.options = {
			// the ext format options
			extMode:
				scriptOptions.options.extMode ??
				(iniOptions.extMode as ExtModes) ??
				"replace",
			// the resize options
			resizeType:
				scriptOptions.options.resizeType ??
				(iniOptions.resizeType as ResizeType) ??
				"none",
			maxSize:
				scriptOptions.options.maxSize ??
				Number(iniOptions.maxSize) ??
				undefined,
		};

		// parse known options about formats
		scriptOptions.compressionOptions = scriptOptions.compressionOptions ?? {};
		inputFormats
			// then parse the options for each format
			.forEach((format) => {
				const currentIniOption = iniOptions[format] as {
					compressor?: Compressor;
					quality?: string;
					progressive?: boolean;
					plugins?: string;
				};

				(scriptOptions.compressionOptions as CompressionOptionsMap)[format] = {
					compressor: getCompressor(currentIniOption?.compressor, format),
					quality: getQuality(Number(currentIniOption?.quality), format),
					progressive: getJpgCompressionOptions(
						currentIniOption?.progressive,
						format,
					),
					plugins: getSvgoPluginOptions(currentIniOption?.plugins, format) as
						| SvgoPluginConfig[]
						| undefined,
				};
			});
	}

	logMessage(
		`Configuration file loaded, options: ${JSON.stringify(scriptOptions)} ${scriptOptions.verbose}`,
	);
	return scriptOptions;
}
