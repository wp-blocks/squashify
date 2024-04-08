import fs from "fs";
import { describe, expect, it, beforeAll, vitest } from "vitest";

import { srcDirQuestion } from "../../src/options.js";
import { getImageFormatsInFolder } from "../../src/utils.js";

describe("srcDirQuestion", () => {
  it("should return true if the path exists and is a directory", async () => {
    const value = "tests/images/test1";

    const result =
      typeof srcDirQuestion.validate === "function"
        ? await srcDirQuestion.validate(value, {} as any, {} as any)
        : null;
    expect(result).toBe(true);
  });

  it("should return an error message if the path does not exist", async () => {
    const value = "tests/images/non-existent-path";
    const result =
      typeof srcDirQuestion.validate === "function"
        ? await srcDirQuestion.validate(value, {} as any, {} as any)
        : null;
    expect(result).toBe("Path does not exist");
  });

  it("should return an error message if the path exists but is not a directory", async () => {
    const value = "tests/images/test1/image.png";
    const result =
      typeof srcDirQuestion.validate === "function"
        ? await srcDirQuestion.validate(value, {} as any, {} as any)
        : null;
    expect(result).toBe("Path is not a directory");
  });

  it("should use the fs.promises.stat method to check if the path exists", async () => {
    const spy = vitest.spyOn(fs.promises, "stat");
    const value = "src/images";
    typeof srcDirQuestion.validate === "function"
      ? await srcDirQuestion.validate(value, {} as any, {} as any)
      : null;
    expect(spy).toHaveBeenCalledWith(value);
    spy.mockRestore();
  });
});

describe("getImageFormatsInFolder", () => {
  beforeAll(() => {
    if (!fs.existsSync("tests/images/empty"))
      fs.mkdirSync("tests/images/empty");
  });

  it("should return an empty array when given an empty folder", () => {
    expect(getImageFormatsInFolder("tests/images/empty")).toEqual([]);
  });

  it("should return an array of image formats for a folder containing images", () => {
    expect(getImageFormatsInFolder("tests/images/test2")).toHaveLength(4);
    expect(getImageFormatsInFolder("tests/images/test3")).toEqual([
      "svg",
      "tiff",
    ]);
    expect(getImageFormatsInFolder("tests/images/test1")).toEqual([
      "gif",
      "jpg",
      "png",
      "svg",
      "tiff",
    ]);
  });

  it("should ignore files that are not images", () => {
    expect(getImageFormatsInFolder("tests/images/non-image")).toEqual([]);
  });
});
