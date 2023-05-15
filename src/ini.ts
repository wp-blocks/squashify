import fs from 'fs';

import ini from 'ini';

import {defaultDist, defaultSrc, inputFormats} from './constants';
import { ScriptOptions } from './types';
import {logMessage, removeDotFromStart} from "./utils";

function getCompressor(iniOptions, format: string) {
	if (format === 'jpg' || format === 'jpeg') {
		return iniOptions?.[format]?.compressor ??
			'mozjpeg'
	} else if (format === 'svg' ) {
		return 'svgo'
	} else {
		return iniOptions?.[format]?.compressor ??
		'webp'
	}
}

/**
 * Get the script options from the configuration file.
 *
 * @param options
 */
export function getIniOptions( options ): ScriptOptions {
	let iniOptions;

	if ( ! options.configFile ) {
		console.log(
			'🎃 Squashify: No configuration file found. Please read the https://github.com/wp-blocks/squashify to know more about!'
		);
		return options;
	}

	try {
		// Get the compression options in the configuration file
		iniOptions = ini.parse(
			fs.readFileSync( options.configFile, 'utf-8' )
		);
	} catch ( err ) {
		console.log(
			`🎃 Squashify: Cannot find a valid configuration or ${options.configFile} does not exist.`
		);
		return options;
	}

	// If the compression options are not specified, add them
	if ( ! options.compressionOptions ) {
		options.compressionOptions = {};
	}

	if ( Object.keys( iniOptions ).length ) {
		options.srcDir = options.srcDir || iniOptions?.path?.in || '';
		options.distDir = options.distDir || iniOptions?.path?.out || '';

		// parse known options
		inputFormats
			// remove the dot from the start of each string by using the .substring() method
			.map( ( format ) => removeDotFromStart(format) )
			// then parse the options for each format
			.forEach( ( format ) => {
				options.compressionOptions[ format ] = {
					compressor: getCompressor( iniOptions, format ),
					quality: format === 'svg'
						? null
						: Number(iniOptions?.[ format ]?.quality) || 80,
					progressive:
						format === 'jpg' || format === 'jpeg'
							? iniOptions?.[ format ]?.progressive ?? true
							: null,
					options:
						format === 'svg'
							? iniOptions?.[ format ]?.options ?? []
							: null,
				};
			} );
	}

	logMessage( 'Configuration file loaded, options: '.concat(JSON.stringify(options)), options.verbose  );
	return options as ScriptOptions;
}
