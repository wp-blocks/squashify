import { ExtModes, IniOptions, ResizeType, ScriptOptions } from "./types";
import { Compressor, inputFormats } from "./constants";
import {
	getDefaultCompressor,
	getJpgCompressionOptions,
	getQuality,
	getSvgoPluginOptions,
	logMessage,
} from "./utils";

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
