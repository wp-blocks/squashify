/* eslint-disable no-console */
import fs from "fs";
import path, { ParsedPath } from "path";

import {
  asInputFormats,
  getCompressionOptions,
  getFileName,
  logMessage,
} from "./utils";
import {
  CompressImagePaths,
  CompressionMeta,
  OutputData,
  type ScriptOptions,
  SVGCompressionOption,
} from "./types";
import { copyFile } from "node:fs/promises";
import { Glob } from "glob";
import { encodeImage } from "./encodeImage";
import { encodeSvg } from "./encodeSvg";
import { lstatSync } from "node:fs";
import { encodeAnimation } from "./encodeAnimation";

function copyFileAsync(encodeSetup: CompressionMeta): Promise<OutputData> {
  /** destructuring the settings */
  const { compressor, paths, options } = encodeSetup as CompressionMeta;
  /**
   * If the compression is enabled for the image format and the extension is an image file
   */
  if (compressor && options && asInputFormats(paths.ext)) {
    if (paths.ext === ".gif" && options.encodeAnimated) {
      /**
       * GIF optimization
       */
      const filePath = path.join(paths.distPath, paths.base);
      logMessage("🎬️ Processing " + filePath);
      return encodeAnimation(
        paths.srcPath,
        filePath,
        encodeSetup as CompressionMeta,
      );
    } else if (paths.ext === ".svg" && compressor === "svgo") {
      /**
       * SVG optimization
       */
      const filePath = path.join(paths.distPath, paths.base);
      logMessage("📐 Processing " + filePath);
      return encodeSvg(paths.srcDir, filePath, options as SVGCompressionOption);
    } else {
      /**
       * Images compression
       */
      const outputFile = getFileName(
        options?.extMode,
        paths as CompressImagePaths,
        compressor,
      );

      logMessage("🖼️ Processing " + outputFile);

      /**
       * The rest of the image formats
       */
      return encodeImage(
        paths.srcPath,
        path.join(paths.distPath, outputFile),
        encodeSetup,
      );
    }
  }
  return new Promise(() => {
    return {
      copy: true,
    } as OutputData;
  });
}

/**
 * The function converts images in a source directory to a specified format and
 * compresses them, while also copying non-image files to a destination directory.
 *
 * @param settings                    The settings object
 * @param settings.srcDir             The source directory from where the images will be read and
 *                                   converted.
 * @param settings.distDir            The destination directory where the converted images will be
 *                                   saved. If no value is provided, the images will be saved in the same directory as
 *                                   the source images.
 * @param settings.compressionOptions An optional object that contains compression settings
 *                                   for different image formats. The default value is an empty object. The object should
 *                                   have keys that correspond to image formats (e.g. "jpg", "png", "webp") and values
 *                                   that are objects containing compression settings for that format (e.g. "no", "mozjpeg", "jpeg").
 */
export async function convertImages(settings: ScriptOptions): Promise<void> {
  // destructuring the settings
  const { srcDir, distDir, compressionOptions } = settings;

  // check if the srcDir is a directory
  if (!fs.existsSync(srcDir)) {
    return new Promise(() => {
      console.warn(
        `🎃 Error! The specified source directory ${srcDir} does not exist.`,
      );
    });
  }

  // Get a list of files in the source directory
  const globResults = new Glob("**", {
    cwd: srcDir,
    exclude: "**/node_modules/**",
  });

  const promises: Promise<OutputData>[] = [];

  const paths: Partial<CompressImagePaths> = {
    srcDir: srcDir,
    distDir: distDir,
    cwd: process.cwd(),
  };

  // Loop through the files in the directory
  for await (const res of globResults as AsyncIterable<string>) {
    /** Collect the source and destination paths */
    const file = path.parse(res) as ParsedPath;
    const filePaths = {
      ...paths,
      ...file,
      res,
      srcPath: path.join(process.cwd(), srcDir, res),
      distPath: path.join(process.cwd(), distDir, file.dir),
    };

    /** If the src is a directory */
    const srcLstat = lstatSync(filePaths.srcPath);
    // if is a directory creating the copy of the directory if the src is different from the dist
    if (srcLstat?.isDirectory()) {
      const dirPath = path.join(process.cwd(), distDir, res);
      logMessage("📁 New Folder created " + dirPath);
      // check if the directory exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
    } else if (compressionOptions) {
      /**
       * If the compression is enabled for the image format
       */
      const encodeSetup: CompressionMeta = {
        ...settings,
        ...getCompressionOptions(filePaths.ext, compressionOptions),
        paths: filePaths as CompressImagePaths,
        options: settings.options,
      };

      promises.push(
        /* return the promise to copy/encode the file */
        copyFileAsync(encodeSetup),
      );
    } else {
      const destPath = path.join(filePaths.distPath, filePaths.base);
      /**
       * Otherwise the compression is not enabled, or the file is not an image,
       * so we copy it to the destination directory
       */
      logMessage(
        "This is not an image file or the compression is not enabled for " +
          filePaths.ext,
      );
      logMessage(`📄 Copying ${filePaths.srcPath} file to ${destPath}`);

      return copyFile(filePaths.srcPath, destPath);
    }
  }

  // Wait for all promises to resolve before returning
  return Promise.allSettled(promises).then((res) => {
    if (res) {
      res.forEach((result) => {
        if (result.status !== "fulfilled") {
          logMessage("🔴 " + result.reason);
        } else {
          // Print the result to the console
          if (Array.isArray(result.value) && result.value.length) {
            result.value?.map((x: OutputData) => {
              if (x && "size" in x) console.log("✅ " + x.size);
              else logMessage("✅ svg optimized to ");
            });
          }
        }
      });
    }
  });
}
