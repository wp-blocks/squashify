/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

import sharp from 'sharp';
import { Config as SvgoConfig, optimize } from 'svgo';

import { Compressor } from './constants';
import { asInputFormats, getCompressionOptions } from './utils';

/**
 * The function optimizes an SVG file using SVGO and writes the optimized SVG to a
 * specified output file.
 *
 * @param filePath    The path to the SVG file that needs to be optimized.
 * @param distPath    The `distPath` parameter is a string representing the file path
 *                    where the optimized SVG file will be written to.
 * @param svgoOptions `svgoOptions` is an object that contains options for optimizing
 *                    the SVG using SVGO (SVG Optimizer). These options can include things like removing
 *                    comments, removing empty groups, and optimizing path data. The specific options and
 *                    their values will depend on the desired optimization settings.
 */
export function optimizeSvg(
	filePath: string,
	distPath: string,
	svgoOptions: SvgoConfig
) {
	// Read the SVG file from the file system
	const svg = fs.readFileSync( filePath, 'utf8' );

	// Optimize the SVG with SVGO
	const optimizedSvg = optimize( svg, svgoOptions );

	// Write the optimized SVG to the output file
	fs.writeFileSync( distPath, optimizedSvg.data );
}

/**
 * Returns the output file extension for a given image format
 * is needed because the mozjpeg compressor needs to be saved with the jpg extension
 * and to avoid the jpeg extension being added to the output file when saving a jpeg file
 *
 * @param compressor  The image format
 * @param originalExt The original file extension
 * @returns The output file extension
 */
export function getOutputExtension( compressor: Compressor, originalExt ) {
	let newExt = '.'.concat( compressor );

	switch ( compressor ) {
		case 'jpg':
		case 'mozjpeg':
			newExt = '.jpg';
			break;
	}

	return originalExt !== newExt ? newExt : '';
}

/**
 * The function converts images in a source directory to a specified format and
 * compresses them, while also copying non-image files to a destination directory.
 *
 * @param opt                    The options object
 * @param opt.srcDir             The source directory from where the images will be read and
 *                               converted.
 * @param opt.distDir            The destination directory where the converted images will be
 *                               saved. If no value is provided, the images will be saved in the same directory as
 *                               the source images.
 * @param opt.compressionOptions An optional object that contains compression options
 *                               for different image formats. The default value is an empty object. The object should
 *                               have keys that correspond to image formats (e.g. "jpg", "png", "webp") and values
 *                               that are objects containing compression options for that format (e.g. "no", "mozjpeg", "jpeg").
 */
export function convertImages( opt ) {
	// destructuring the options
	const { srcDir, distDir, compressionOptions } = opt;

	// Get a list of files in the source directory
	const files = fs.readdirSync( srcDir );

	// Loop through the files in the directory
	const promises = files.map( ( file: string ) => {
		// Get the full path of the file
		const filePath = path.join( srcDir, file );

		// Get the stats of the file
		const stats = fs.statSync( filePath );

		// Check if the file is a directory
		if ( stats.isDirectory() ) {
			// Recursively call this function on the subdirectory
			const subDir = path.join( distDir, file );
			fs.mkdirSync( subDir, { recursive: true } );

			console.log( `Converted ${ file } to ${ subDir }` );

			// Call this function on the subdirectory
			return convertImages( {
				srcDir: filePath,
				distDir: subDir,
				compressionOptions,
			} );
		}

		// Save the image to the destination directory
		const distPath = path.join( distDir, file );

		// Get the extension of the file
		const extension = path.extname( filePath ).toLowerCase();

		// Set the default options for the image format
		const options = getCompressionOptions( extension, compressionOptions );

		// create the output directory if it doesn't exist
		if ( ! fs.existsSync( distDir ) ) {
			fs.mkdirSync( distDir );
		}

		// Check if the file is an image
		if ( asInputFormats( extension ) && options ) {
			// The output file name
			const distFileName = distPath.concat(
				getOutputExtension( options.compressor, extension )
			);

			// Apply compression options
			if ( extension === '.svg' ) {
				// Save the image to the destination directory
				optimizeSvg( filePath, distPath, { ...options.plugins } as SvgoConfig );
			} else {
				// Load the image with sharp
				let image = sharp( filePath );

				// Apply compression options if specified in the options
				if ( options.compressor ) {
					switch ( options.compressor ) {
						case 'avif':
							image = image.avif( {
								quality: options.quality,
							} );
							break;
						case 'webp':
							image = image.webp( {
								quality: options.quality,
							} );
							break;
						case 'mozjpeg':
							image = image.jpeg( {
								mozjpeg: true,
								quality: options.quality,
							} );
							break;
						case 'png':
							image = image.png();
							break;
						case 'jpg':
							image = image.jpeg( {
								quality: options.quality,
								progressive: options.progressive,
							} );
							break;
					}
				}

				console.log(
					`File converted from ${ filePath } to ${ distFileName }`
				);

				return image.toFile( distFileName );
			}
		} else {
			console.log( `File copied from ${ filePath } to ${ distPath }` );

			// Write the contents to the destination file
			return fs.promises.copyFile( filePath, distPath );
		}
	} );

	// Wait for all promises to resolve before returning
	return Promise.all( promises ).then( () => {
		return true;
	} );
}
