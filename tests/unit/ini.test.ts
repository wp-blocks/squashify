import { describe, expect, it } from "@jest/globals";
import { getIniOptions } from "../../src/parseIni";

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
