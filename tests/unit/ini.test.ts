import { describe, expect, it } from "@jest/globals";
import { getIniOptions } from "../../src/parseIni";
import { inputFormats } from "../../src/constants";
import { parseOptions } from "../../src/parseOptions";
import { ScriptOptions } from "../../src/types";

describe("getIniOptions", () => {
  it("should return the input settings when no configuration file is found", () => {
    const options = {
      configFile: "invalid_path",
      srcDir: "src",
      distDir: "dist",
      compressionOptions: null,
    };

    const result = getIniOptions("fakepath", options);

    expect(result).toEqual(options);
  });

  it("should load the configuration file and update the settings", () => {
    let result = getIniOptions("./tests/data/.squash");

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
        encodeAnimated: true,
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
          "RemoveMetadata",
          "RemoveXMLNS",
          "RemoveEditorsNSData",
          "RemoveTitle",
          "RemoveDesc",
          "RemoveUselessDefs",
          "RemoveEmptyAttrs",
          "RemoveHiddenElems",
          "RemoveEmptyContainers",
          "RemoveEmptyText",
          "RemoveUnusedNS",
          "ConvertShapeToPath",
          "SortAttrs",
          "MergePaths",
          "SortDefsChildren",
          "RemoveDimensions",
          "RemoveStyleElement",
          "RemoveScriptElement",
          "InlineStyles",
          "removeViewBox",
          "removeElementsByAttr",
          "cleanupIDs",
          "convertColors",
          "removeRasterImages",
          "removeUselessStrokeAndFill",
          "removeNonInheritableGroupAttrs",
        ],
      },
    });
  });
});
