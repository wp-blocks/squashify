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
	settings: ScriptOptions,
	iniOptions: IniOptions,
): ScriptOptions {
	// the source and destination directories
	settings.srcDir = settings.srcDir || String(iniOptions?.in) || "";
	settings.distDir = settings.distDir || String(iniOptions?.out) || "";

	const { resizeType, maxSize }: { resizeType?: ResizeType; maxSize?: number } =
		iniOptions.options ?? {
			resizeType: "none",
			maxSize: undefined,
		};

	settings.options = {
		// the ext format settings
		extMode: (iniOptions.extMode as ExtModes) ?? "replace",
		// the resize settings
		resizeType: resizeType ?? "none",
		maxSize: Number(maxSize) ?? undefined,
	};

	// parse known settings about formats
	settings.compressionOptions = { ...settings.compressionOptions };

	// parse the settings for all formats in the inputFormats array
	inputFormats
		// then parse the settings for each format
		.forEach((format) => {
			const currentIniOption = iniOptions[format] as Record<string, string>;

			settings.compressionOptions[format] = {
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
				settings.options.plugins = getSvgoPluginOptions(
					currentIniOption?.plugins.split(","),
				);
			}

			if (format === ".jpg") {
				settings.compressionOptions[format].progressive =
					getJpgCompressionOptions(Boolean(currentIniOption?.progressive));
			}
		});

	logMessage(
		`Configuration file loaded, options: ${JSON.stringify(settings)} ${settings.verbose}`,
	);
	return settings;
}
