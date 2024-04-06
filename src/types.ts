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
	[key: string]: unknown;
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
	srcDir: string;
	distDir: string;
	relativePath: string;
	filePath: string;
	srcPath: string;
	distPath: string;
	cwd: string;
} & ParsedPath;

export interface CompressionOption {
	extMode: ExtModes;
	maxSize?: number | undefined;
	resizeType?: ResizeType;
	outMargin?: number;
	background?: string;
	plugins?: SvgoPluginConfig[];
}

/* These are types defining the settings for compressing different types of files. */
export type CompressionOptions = {
	compressor?: Compressor;
	quality?: number;
	progressive?: boolean;
	originalSize?: number;
};

export interface CompressionMeta extends CompressionOptions {
	paths: CompressImagePaths;
	options: CompressionOption;
}
