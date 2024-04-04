import { type Compressor, type InputFormats } from "./constants";
import { PluginConfig as SvgoPluginConfig } from "svgo";
import { ParsedPath } from "path";
import { Path } from "glob";

export type ExtModes = "add" | "replace";

export type ResizeType =
	| "contain"
	| "cover"
	| "fill"
	| "inside"
	| "outside"
	| "none";

export type CompressionOptionsMap = {
	[key in InputFormats]: CompressionOptions;
};

export type IniOptions = {
	[key: string]: string | unknown;
};

/* The `ScriptOptions` interface is defining the settings that can be passed to a script. */
export interface ScriptOptions {
	srcDir: string;
	distDir: string;
	configFile: string;
	verbose?: boolean;
	interactive?: boolean;
	options: CompressionOption;
	compressionOptions: CompressionOptionsMap;
}

export type CompressImagePaths = {
	src: string;
	dist: string;
	source: string;
	destination: string;
	distFileName?: string; // dist file
} & ParsedPath;

export interface CompressionOption {
	extMode: ExtModes;
	maxSize?: number | undefined;
	resizeType?: ResizeType;
}

/* These are types defining the settings for compressing different types of files. */
export type CompressionOptions = {
	compressor?: Compressor;
	quality?: number;
	progressive?: boolean;
	originalSize?: number;
	paths?: CompressImagePaths;
	plugins?: SvgoPluginConfig[];
	options?: CompressionOption;
};
