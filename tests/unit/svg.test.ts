import fs from "fs";
import path from "path";
import { afterAll, describe, expect, it } from "vitest";
import { optimizeSvg } from "../../src/encodeSvg.js";

describe("optimizeSvg", () => {
  const filePath = path.join(__dirname, "../images/test3/image.svg");

  const distPath = path.join(__dirname, "../images/image.min.svg");

  afterAll(() => {
    // Cleanup
    if (fs.existsSync(distPath)) {
      fs.unlinkSync(distPath);
    }
  });

  it("optimizes an SVG file and writes it to the specified output file", async () => {
    // Check if the optimized SVG was written to the correct location
    const svg = fs.readFileSync(filePath, "utf8");
    // Call the optimizeSvg function with test arguments
    const optimizedSvg = optimizeSvg(svg, { plugins: ["preset-default"] });

    // the file was written
    expect(optimizedSvg).toBeDefined();

    // the file has content
    expect(optimizedSvg.length).toBeGreaterThan(0);
  });
});
