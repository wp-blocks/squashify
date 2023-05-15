import yargs from 'yargs';

import { getCliOptions } from './args';
import { convertImages } from './compression';
import { getIniOptions } from './ini';
import { getPromptOptions } from './promps';
import {logMessage} from "./utils";

/**
 * Prompts the user for the source and destination directories
 * then runs a function that converts the images.
 *
 * @returns Promise that resolves when the image conversion is complete
 */
export default async function main() {
	// Get the cli options
	let options = getCliOptions( yargs( process.argv.slice( 2 ) ) );

	// Get the options from the ini file
	options = getIniOptions( options );

	// Prompt the user for the script options
	if ( options.interactive ) {
		options = await getPromptOptions( options );
	}

	// Start the timer
	const startTime = Date.now();

	// Then convert the images in the source directory
	const res = await convertImages( options )

	if ( res ) {
		// Print the time elapsed in seconds to the console
		logMessage(
			`The end 🎉 - Time elapsed: ${(Date.now() - startTime) / 1000} seconds`, options.verbose
		);

		return res;
	}
}

main().catch( ( err ) => {
	console.error( err );
} );
