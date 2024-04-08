import fs from "fs";
import { rm } from "node:fs/promises";
import { describe, expect, it, afterAll } from "vitest";
import { convertImages } from "../../src/compression.js";
import { getIniOptions } from "../../src/parseIni.js";

// get test settings
const options = getIniOptions("./tests/data/.squash");

describe("convertImages", () => {
  afterAll(async () => {
    if (fs.existsSync(options.distDir)) {
      await rm(options.distDir, { recursive: true, force: true });
    }
  });

  it("Should handle default settings correctly", async () => {
    // options.verbose = true;
    await convertImages(options as any);

    expect(fs.readdirSync(`${options.distDir}`)).toMatchObject([
      "image.gif.webp",
      "image.jpg",
      "image.png.avif",
      "image.svg",
      "image.tiff.jpg",
    ]);

    expect(fs.readdirSync(`${options.distDir}`).length).toBe(5);
  });
});
