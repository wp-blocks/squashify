import fs from "fs";
import { describe, expect, it, afterAll } from "vitest";
import { convertImages } from "../../src/compression.js";
import { getIniOptions } from "../../src/parseIni.js";

// get test settings
const options = getIniOptions("./tests/data/.squash", {
  srcDir: "tests/images/non-image/",
  distDir: "tests/images/dist-non-image/",
  configFile: "tests/data/.squash",
} as any);

describe("convertImages", () => {
  afterAll(() => {
    if (fs.existsSync(options.distDir as string))
      fs.rmdirSync(options.distDir as string, { recursive: true, force: true });
  });

  it("should handle non-image files correctly", async () => {
    await convertImages(options as any);

    // check if the non-image file was copied to destination directory
    expect(fs.existsSync(`${options.distDir}/a.txt`)).toBe(true);
  });
});
