import fs from "fs";
import { convertImages } from "../../src/compression";
import { getIniOptions } from "../../src/parseIni";

// get test settings
const options = getIniOptions("./tests/data/.squash", {
  srcDir: "./tests/images/non-image",
  distDir: "./tests/images/dist-non-image",
  configFile: "./tests/data/.squash",
});

describe("convertImages", () => {
  afterAll(() => {
    if (fs.existsSync(options.distDir as string))
      fs.rmdirSync(options.distDir as string);
  });

  it("should handle non-image files correctly", async () => {
    await convertImages(options as any);

    // check if the non-image file was copied to destination directory
    expect(fs.existsSync(`${options.distDir}/a.txt`)).toBe(true);
  });
});
