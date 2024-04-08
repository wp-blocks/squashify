import { type Compressor, type InputFormats } from "./constants.js";
import { Config as SvgoConfig } from "svgo";
import { ParsedPath } from "path";
import { OutputInfo } from "sharp";

export const extModes = ["add", "replace"];

export type ExtMode = (typeof extModes)[number];

export const resizeType = [
  "contain",
  "cover",
  "fill",
  "inside",
  "outside",
  "none",
];

export type ResizeType = (typeof resizeType)[number];

export type CompressionOptionsMap = {
  [key in InputFormats]: CompressionOption;
};

export interface GenericCompressionOptions {
  compressor?: Compressor;
}

export interface SVGCompressionOption extends SvgoConfig {}

export interface GifCompressionOption extends GenericCompressionOptions {
  encodeAnimated?: boolean;
}

export interface JpegCompressionOption extends GenericCompressionOptions {
  quality?: number;
  progressive?: boolean;
}

export type CompressionOption = JpegCompressionOption &
  SVGCompressionOption &
  GifCompressionOption &
  GenericCompressionOptions;

/**
 * The `SquashOptions` interface is defining the settings that can be passed with the `.squash` .ini file that defines the general Squashify script settings.
 */
export type SquashOptions = {
  extMode?: ExtMode;
  resizeType?: ResizeType;
  overwrite?: boolean;
  maxSize?: number;
  outMargin?: number;
  background?: string;
};

export interface CliOptions {
  srcDir: string;
  distDir: string;
  verbose?: boolean;
  configFile?: string;
  interactive?: boolean;
  options?: SquashOptions;
}

/**
 * The `ScriptOptions` interface is defining the settings that can be passed to a script.
 */
export interface ScriptOptions extends CliOptions {
  configFile?: string;
  verbose?: boolean;
  interactive?: boolean;
  options?: SquashOptions;
  compressionOptions: CompressionOptionsMap;
}

export interface IniOptions extends ScriptOptions {
  in: string;
  out: string;
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

export type CompressionMeta = {
  compressor?: Compressor;
  paths: CompressImagePaths;
  options?: SquashOptions;
  verbose?: boolean;
} & CompressionOption;

export type OutputData =
  | OutputInfo
  | {
      src: string;
      dist: string;
      originalSize: number;
      size: number;
    }
  | {
      copy: boolean;
    };
