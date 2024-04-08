import { describe, expect, it } from "vitest";
import { getIniOptions } from "../../src/parseIni.js";
import { ScriptOptions } from "node:vm";
import { CliOptions } from "../../src/types.js";

describe("getIniOptions", () => {
  it("should return the input settings when no configuration file is found", () => {
    const options = {
      in: "invalid_path",
      out: "invalid_path",
      configFile: "invalid_path",
      srcDir: "src",
      distDir: "dist",
      compressionOptions: {},
    };

    const result = getIniOptions("fakepath", options);

    expect(result).toEqual(options);
  });

  it("should load the configuration file and update the settings", () => {
    let result = getIniOptions("./tests/data/.squash") as CliOptions;

    expect(result).not.toBeNull();

    // check the srcDir and distDir
    expect(result.srcDir).toEqual("tests/images/test1");
    expect(result.distDir).toEqual("tests/images/dist-1");

    expect(result.options).toMatchObject({
      overwrite: false,
      extMode: "add",
      maxSize: 50,
      resizeType: "contain",
    });

    // check the compression settings
    expect(result.compressionOptions).toMatchObject({
      jpg: {
        compressor: "mozjpeg",
        quality: 85,
        progressive: true,
      },
      png: {
        compressor: "avif",
        quality: 50,
      },
      gif: {
        compressor: "webp",
        animation: true,
      },
      tiff: {
        compressor: "mozjpeg",
        quality: 85,
      },
      svg: {
        compressor: "svgo",
        plugins: [
          "cleanupAttrs",
          "removeDoctype",
          "removeXMLProcInst",
          "removeComments",
          "removeMetadata",
          "removeXMLNS",
          "removeEditorsNSData",
          "removeTitle",
          "removeDesc",
          "removeUselessDefs",
          "removeEmptyAttrs",
          "removeHiddenElems",
          "removeEmptyContainers",
          "removeEmptyText",
          "removeUnusedNS",
          "convertShapeToPath",
          "sortAttrs",
          "mergePaths",
          "sortDefsChildren",
          "removeDimensions",
          "removeStyleElement",
          "removeScriptElement",
          "inlineStyles",
          "removeViewBox",
          "removeElementsByAttr",
          "cleanupIds",
          "convertColors",
          "removeRasterImages",
          "removeUselessStrokeAndFill",
          "removeNonInheritableGroupAttrs",
        ],
      },
    });
  });
});
