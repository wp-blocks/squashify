import fs from 'fs';

import ini from 'ini';

import { inputFormats } from './constants';
import { ScriptOptions } from './types';

function getCompressor(iniOptions, format: string) {
	return iniOptions?.[ format ]?.compressor ??
	( format === 'jpg' ? 'mozjpeg' : format === 'svg' ? 'svgo' : 'webp' )
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
		options.srcDir = iniOptions?.path?.in ?? options.srcDir;
		options.distDir = iniOptions?.path?.out ?? options.distDir;

		// parse known options
		inputFormats
			// remove the dot from the start of each string by using the .substring() method
			.map( ( format ) => format.substring( 1 ) )
			// then parse the options for each format
			.forEach( ( format ) => {
				options.compressionOptions[ format ] = {
					compressor: getCompressor( iniOptions, format ),
					quality: Number(iniOptions?.[ format ]?.quality) ?? 80,
					progressive:
						format === 'jpg'
							? iniOptions?.[ format ]?.progressive ?? true
							: null,
					options:
						format === 'svg'
							? iniOptions?.[ format ]?.options ?? []
							: null,
				};
			} );
	}

	console.log( 'configuration file loaded, options:', options );
	return options as ScriptOptions;
}
