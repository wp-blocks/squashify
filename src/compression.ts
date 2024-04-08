/* eslint-disable no-console */
import fs from "fs";
import path, { ParsedPath } from "path";

import {
  asInputFormats,
  defaultCompressionOptions,
  getCompressionOptions,
  getImageFormatsInFolder,
  logMessage,
} from "./utils.js";
import {
  CompressImagePaths,
  CompressionMeta,
  OutputData,
  type ScriptOptions,
} from "./types.js";
import { copyFile, mkdir } from "node:fs/promises";
import { Glob } from "glob";
import { lstatSync } from "node:fs";
import { encodeFileAsync } from "./encodeFileAsync.js";

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
  const { srcDir, distDir, compressionOptions } = settings as ScriptOptions;

  // check if the srcDir is a directory
  if (srcDir && !fs.existsSync(srcDir)) {
    return new Promise(() => {
      console.warn(
        `🎃 Error! The specified source directory ${srcDir} does not exist.`,
      );
    });
  }

  if (settings.compressionOptions == undefined) {
    logMessage(
      "🎃 No compression options found. Using default compression options.",
    );
    const inputFormats = getImageFormatsInFolder(srcDir as string);
    settings.compressionOptions = defaultCompressionOptions(inputFormats);
  }

  // Get a list of files in the source directory
  const globResults = new Glob("**", {
    cwd: srcDir,
    exclude: "**/node_modules/**,**/.git/**,**/.DS_Store",
  });

  const promises: Promise<OutputData>[] = [];

  const paths: Partial<CompressImagePaths> = {
    srcDir: srcDir,
    distDir: distDir,
    cwd: process.cwd(),
  };

  logMessage(
    `🎃 Converting images in ${srcDir} to ${distDir} ... Please wait!`,
    true,
  );

  // Loop through the files in the directory
  for await (const res of globResults as AsyncIterable<string>) {
    /** Collect the source and destination paths */
    const file = path.parse(res) as ParsedPath;
    const filePaths = {
      ...paths,
      ...file,
      res,
      srcPath: path.join(process.cwd(), srcDir as string, res),
      distPath: path.join(process.cwd(), distDir as string, file.dir),
    };

    /** If the src is a directory */
    const srcLstat = lstatSync(filePaths.srcPath);
    // if is a directory creating the copy of the directory if the src is different from the dist
    if (srcLstat?.isDirectory()) {
      const dirPath = path.join(process.cwd(), distDir as string, res);
      // check if the directory exists
      const exists = fs.existsSync(dirPath);
      if (exists) {
        logMessage("📁 Folder already exists " + dirPath, settings.verbose);
        continue;
      } else {
        logMessage("📁 Folder created " + dirPath, settings.verbose);
        promises.push(
          mkdir(dirPath).then(() => {
            return {
              copy: true,
              srcPath: filePaths.srcPath,
              distPath: dirPath,
            } as OutputData;
          }),
        );
        continue;
      }
    }

    /**
     * If the compression is enabled for the image format
     */
    const encodeSetup: CompressionMeta = {
      ...getCompressionOptions(filePaths.ext.substring(1), compressionOptions),
      compressor:
        settings.compressionOptions[filePaths.ext?.substring(1)]?.compressor ??
        undefined,
      paths: filePaths as CompressImagePaths,
      options: settings.options,
      verbose: settings.verbose,
    };

    if (
      encodeSetup.compressor !== undefined &&
      asInputFormats(encodeSetup.paths.ext.substring(1))
    ) {
      promises.push(
        /* return the promise to copy/encode the file */
        encodeFileAsync(encodeSetup),
      );
      continue;
    }

    const destPath = path.join(filePaths.distPath, filePaths.base);
    /**
     * Otherwise the compression is not enabled, or the file is not an image,
     * so we copy it to the destination directory
     */
    logMessage(
      "This is not an image file or the compression is not enabled for " +
        filePaths.ext,
      settings.verbose,
    );
    logMessage(
      `📄 Copying ${filePaths.srcPath} file to ${destPath}`,
      settings.verbose,
    );

    /** Copy the file */
    promises.push(
      copyFile(filePaths.srcPath, destPath).then(() => {
        return {
          copy: true,
          srcPath: filePaths.srcPath,
          distPath: destPath,
        } as OutputData;
      }),
    );
  }

  // Wait for all promises to resolve before returning
  const res = await Promise.allSettled(promises);
  if (res.length) {
    res.forEach((result) => {
      if (result.status !== "fulfilled") {
        logMessage("🔴 " + result.reason, true);
      } else {
        logMessage(
          "✅ " +
            JSON.stringify(
              (result as PromiseFulfilledResult<OutputData>).value,
            ),
          settings.verbose,
        );
      }
      return;
    });
  } else {
    logMessage("🔴 No files found", true);
  }
}
