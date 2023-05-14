import fs from 'fs';

import ini from 'ini';

import { inputFormats } from './constants';
import { ScriptOptions } from './types';

/**
 * Get the script options from the configuration file.
 *
 * @param options
 */
export function getIniOptions( options ): ScriptOptions {
	let iniOptions;

	try {
		// Get the compression options in the configuration file
		iniOptions = ini.parse(
			fs.readFileSync( options.configFile, 'utf-8' )
		);
	} catch ( err ) {
		console.log(
			'image: No configuration file found. Please read the ReadMe to know more about!'
		);
		return options;
	}

	// If the compression options are not specified, add them
	if ( ! options.compressionOptions ) {
		options.compressionOptions = {};
	}

	if ( Object.keys( iniOptions ).length ) {
		options.srcDir = iniOptions?.path?.in ?? undefined;
		options.distDir = iniOptions?.path?.out ?? undefined;

		// parse known options
		inputFormats
			// remove the dot from the start of each string by using the .substring() method
			.map( ( format ) => format.substring( 1 ) )
			// then parse the options for each format
			.forEach( ( format ) => {
				options.compressionOptions[ format ] = {
					compress: iniOptions[ format ] ? 'yes' : 'no',
					compressor:
						iniOptions?.[ format ]?.compressor ??
						( format === 'jpg' ? 'mozjpeg' : 'webp' ),
					quality: iniOptions?.[ format ]?.quality ?? 80,
					progressive:
						format === 'jpg'
							? iniOptions?.[ format ]?.progressive ?? true
							: undefined,
					options:
						format === 'svg'
							? iniOptions?.[ format ]?.options ?? []
							: undefined,
				};
			} );
	}
	console.log( 'configuration file loaded, options:', options );
	return options as ScriptOptions;
}
