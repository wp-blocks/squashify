import prompts from "prompts";
import { beforeEach, describe, expect, it, Mock, vitest } from "vitest";
import { logMessage } from "../../src/utils.js";
import { getImageCompressionOptions } from "../../src/prompts.js";

vitest.mock("prompts");

describe("getImageCompressionOptions", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
  });

  it("prompts the user for compression settings for each format", async () => {
    // Mock the user's responses
    (prompts.prompt as Mock).mockResolvedValueOnce({
      compress: "yes",
      compressor: "png",
      quality: 80,
    });
    (prompts.prompt as Mock).mockResolvedValueOnce({
      compress: "yes",
      compressor: "jpg",
      quality: 75,
    });
    (prompts.prompt as Mock).mockResolvedValueOnce({ compress: "no" });

    const options = await getImageCompressionOptions([".png", ".jpg", ".webp"]);

    expect(options).toEqual({
      ".png": { compress: "yes", compressor: "png", quality: 80 },
      ".jpg": { compress: "yes", compressor: "jpg", quality: 75 },
    });
  });

  it("logs the message to the console when verbose is true", () => {
    // Redirect console.log to a mock function
    const consoleLogMock = vitest.fn();
    console.log = consoleLogMock;

    // Call the logMessage function with verbose set to true
    logMessage("Hello, world!", true);

    // Expect console.log to have been called with the message argument
    expect(consoleLogMock).toHaveBeenCalledWith("Hello, world!");
  });

  it("does not log the message to the console when verbose is false", () => {
    // Redirect console.log to a mock function
    const consoleLogMock = vitest.fn();
    console.log = consoleLogMock;

    // Call the logMessage function with verbose set to false
    logMessage("Hello, world!", false);

    // Expect console.log not to have been called
    expect(consoleLogMock).not.toHaveBeenCalled();
  });
});
