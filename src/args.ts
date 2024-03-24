import { defaultConfigFile, extModes } from "./constants";
import yargs from "yargs";
import { ExtModes, type ScriptOptions } from "./types";
import { hideBin } from "yargs/helpers";

/**
 * Get the command-line options
 */
export function getCliOptions(
	rawArgs: yargs.Argv<object> | undefined,
): ScriptOptions {
	if (!rawArgs) {
		rawArgs = yargs(hideBin(process.argv));
	}
	// Check for command-line arguments
	const argv = rawArgs
		.usage("Usage: $0 [options]")
		.option("input", {
			describe: "Source directory",
			type: "string",
			alias: "in",
		})
		.option("output", {
			describe: "Destination directory",
			type: "string",
			alias: "out",
		})
		.option("config", {
			alias: "c",
			describe: "Configuration File",
			type: "string",
		})
		.option("interactive", {
			alias: "i",
			describe: "Interactive mode",
			type: "boolean",
		})
		.option("extMode", {
			alias: "e",
			describe: "Whenever to add or replace extension",
			type: "string",
			choices: ["add", "replace"],
			default: "replace",
			coerce: (value: string) =>
				(extModes.includes(value) && (value as ExtModes)) || "replace",
		})
		.option("verbose", {
			alias: "v",
			type: "boolean",
			description: "Run with verbose logging",
		})
		.help("h")
		.alias("h", "help")
		.parseSync();

	return {
		srcDir: argv.input ?? "",
		distDir: argv.output ?? "",
		configFile: argv.config ?? defaultConfigFile,
		interactive: !!argv.interactive,
		extMode: argv.extMode ?? "replace",
		verbose: Boolean(argv.verbose),
		compressionOptions: {},
	};
}
