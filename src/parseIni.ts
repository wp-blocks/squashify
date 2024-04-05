import fs from "fs";
import ini from "ini";
import { type IniOptions } from "./types";
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

	console.log(iniOptions);

	return iniOptions;
}
