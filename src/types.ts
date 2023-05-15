import { Compressor, InputFormats } from './constants';

/* These are interfaces defining the options for compressing different types of files. */
export interface DefaultCompressionOptions {
	compress: string;
	compressor?: Compressor;
	quality?: number;
}

export interface JPGCompressionOptions extends DefaultCompressionOptions {
	progressive: boolean;
}

export interface SVGCompressionOptions extends DefaultCompressionOptions {
	plugins?: string;
}

export type CompressionOptions = JPGCompressionOptions | DefaultCompressionOptions | SVGCompressionOptions ;

export type CompressionOptionsMap = { [ key in InputFormats ]: CompressionOptions };

/* The `ScriptOptions` interface is defining the options that can be passed to a script. */
export interface ScriptOptions {
	srcDir: string;
	distDir: string;
	configFile: string;
	verbose: boolean;
	interactive: boolean;
	compressionOptions?: CompressionOptionsMap;
}
