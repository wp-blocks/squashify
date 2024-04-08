import fs from "fs";
import { convertImages } from "../../src/compression.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const srcDir = "./tests/images/test2";
const distDir = "./tests/images/dist-custom";

describe("convertImages with settings", () => {
  beforeEach(() => {
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
  });
  afterEach(() => {
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
  });
  it("should apply compression settings correctly", async () => {
    const r = await convertImages({
      srcDir,
      distDir: distDir,
      options: { extMode: "replace" },
      compressionOptions: {
        png: { compressor: "avif", quality: 20 },
        gif: { compressor: "png" },
        tiff: { compressor: "jpg", quality: 20 },
      },
    });

    expect(fs.readdirSync(`${distDir}`)).toMatchObject(["deep", "image.avif"]);
    expect(fs.readdirSync(`${distDir}`).length).toBe(2);

    // check if the image was compressed to destination directory
    expect(fs.existsSync(`${distDir}/image.avif`)).toBe(true);
    expect(fs.existsSync(`${distDir}/deep/image.jpg`)).toBe(true);
    expect(fs.existsSync(`${distDir}/deep/with-images/image.jpg`)).toBe(true);
    expect(fs.existsSync(`${distDir}/deep/with-images/image.png`)).toBe(true);
  });
  it("should apply compression settings correctly when extMode is 'add'", async () => {
    const r = await convertImages({
      srcDir,
      distDir: distDir,
      options: { extMode: "add" },
      compressionOptions: {
        png: { compressor: "avif", quality: 20 },
        gif: { compressor: "png" },
        tiff: { compressor: "jpg", quality: 20 },
      },
    });

    expect(fs.readdirSync(`${distDir}`)).toMatchObject([
      "deep",
      "image.png.avif",
    ]);
    expect(fs.readdirSync(`${distDir}`).length).toBe(2);

    // check if the image was compressed to destination directory
    expect(fs.existsSync(`${distDir}/image.png.avif`)).toBe(true);
    expect(fs.existsSync(`${distDir}/deep/image.jpg`)).toBe(true);
    expect(fs.existsSync(`${distDir}/deep/with-images/image.tiff.jpg`)).toBe(
      true,
    );
    expect(fs.existsSync(`${distDir}/deep/with-images/image.gif.png`)).toBe(
      true,
    );
  });
});
