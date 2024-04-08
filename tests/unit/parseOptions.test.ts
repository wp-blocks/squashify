import prompts from "prompts";
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  MockedFunction,
  vi,
} from "vitest";
import { getPromptOptions } from "../../src/prompts.js";
import { promptsToAsk } from "../../src/options.js";
import { getCompressionOptions, getOutputExtension } from "../../src/utils.js";
import { InputFormats } from "../../src/constants.js";

describe("getPromptOptions", () => {
  beforeAll(() => {
    vi.mock("prompts", () => ({ default: vi.fn() }));
  });
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Should prompt for source directory when not provided", async () => {
    const options = { distDir: "./dist" };

    // Mock the prompts function to return the user's input
    (prompts as MockedFunction<typeof prompts>).mockResolvedValueOnce({
      srcDir: "tests/images",
    });

    const result = await getPromptOptions(options as any);

    expect(result.srcDir).toBe("tests/images");
    expect(prompts).toBeCalledTimes(2);
  });

  it("Should prompt for destination directory when not provided", async () => {
    const options = { srcDir: "./tests/images" };

    // Mock the prompts function to return the user's input
    (prompts as MockedFunction<typeof prompts>).mockResolvedValueOnce({
      distDir: "./dist",
    });

    const result = await getPromptOptions(options as any);

    expect(result.distDir).toBe("./dist");
    expect(prompts).toBeCalledTimes(2);
  });

  it("Should not prompt for compression settings when already provided", async () => {
    const options = {
      srcDir: "./tests/images",
      distDir: "./dist",
      compressionOptions: {
        jpeg: { quality: 75 },
        png: {},
      },
    };

    const result = await getPromptOptions(options as any);

    expect(result.compressionOptions).toEqual(options.compressionOptions);
    expect(prompts).toBeCalledTimes(1);
  });
});

describe("promptsToAsk", () => {
  it("should return the correct prompts for .svg format", () => {
    const format: InputFormats = ".svg";
    const prompts = promptsToAsk(format);
    expect(prompts).toHaveLength(2);

    const [compressPrompt, pluginsPrompt] = prompts;

    expect(compressPrompt.name).toBe("compress");
    expect(compressPrompt.choices).toHaveLength(3);

    expect(pluginsPrompt.name).toBe("plugins");
    expect(pluginsPrompt.choices).toHaveLength(30);
  });

  it("should return the correct prompts for .jpg format", () => {
    const format: InputFormats = ".jpg";
    const prompts = promptsToAsk(format);
    expect(prompts).toHaveLength(4);

    const [compressPrompt, compressorPrompt, qualityPrompt, progressivePrompt] =
      prompts;

    expect(compressPrompt.name).toBe("compress");
    expect(compressPrompt.choices).toHaveLength(2);

    expect(compressorPrompt.name).toBe("compressor");
    /*expect(compressorPrompt.choices).toHaveLength(5);*/

    expect(qualityPrompt.name).toBe("quality");
    expect(qualityPrompt.min).toBe(1);
    expect(qualityPrompt.max).toBe(100);

    expect(progressivePrompt.name).toBe("progressive");
    expect(progressivePrompt.initial).toBe(true);
  });

  it("should return the correct prompts for .png format", () => {
    const format: InputFormats = ".png";
    const prompts = promptsToAsk(format);
    expect(prompts).toHaveLength(4);

    const [compressPrompt, compressorPrompt] = prompts;

    expect(compressPrompt.name).toBe("compress");
    expect(compressPrompt.choices).toHaveLength(2);
  });
});

describe("Should output file extension for a given image format", () => {
  it('Should return a new extension when compressor is "jpg" or "mozjpeg"', () => {
    expect(getOutputExtension("jpg", ".png")).toBe(".jpg");
    expect(getOutputExtension("mozjpeg", ".webp")).toBe(".jpg");
  });

  it("Should return an empty string when the new extension is the same as the original extension", () => {
    expect(getOutputExtension("mozjpeg", ".jpg")).toBe("");
    expect(getOutputExtension("png", ".png")).toBe("");
    expect(getOutputExtension("webp", ".webp")).toBe("");
  });

  it("Should return a new extension when the new extension is different from the original extension", () => {
    expect(getOutputExtension("jpg", ".png")).toBe(".jpg");
    expect(getOutputExtension("png", ".jpg")).toBe(".png");
    expect(getOutputExtension("webp", ".png")).not.toBe(".jpg");
  });
});

describe("getCompressionOptions", () => {
  it("Should return false for an unsupported image format", () => {
    const options = {
      ".jpeg": { quality: 80, progressive: true },
      ".png": {},
    };
    expect(getCompressionOptions(".webp", options)).toBe(undefined);
  });

  it("Should return the compression settings for a supported image format", () => {
    const options = {
      jpg: { quality: 80, progressive: true },
      png: {},
    };
    expect(getCompressionOptions(".jpg", options)).toMatchObject({
      progressive: true,
      quality: 80,
    });
  });

  it("Should return false when no settings are found for a supported image format", () => {
    const options = {
      ".jpeg": { quality: 80, progressive: true },
      ".png": {},
    };
    expect(getCompressionOptions(".pdf", options)).toBe(undefined);
  });
});
