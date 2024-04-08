import { describe, expect, it } from "vitest";
import { getCliOptions } from "../../src/parseArgs.js";
import { defaultConfigFile } from "../../src/constants.js";
import yargs from "yargs";

describe("getCliOptions", () => {
  it("Should return the correct settings", () => {
    const args =
      "--in ./source --out ./destination --config ./config.json --verbose --interactive";
    const options = getCliOptions(yargs(args.split(" ")));

    expect(options.srcDir).toBe("./source");
    expect(options.distDir).toBe("./destination");
    expect(options.configFile).toBe("./config.json");
    expect(options.verbose).toBe(true);
    expect(options.interactive).toBe(true);
  });

  it("Should return the default settings if no arguments are passed", () => {
    const options = getCliOptions(yargs([""]));
    expect(options.srcDir).toBe(undefined);
    expect(options.distDir).toBe(undefined);
    expect(options.configFile).toBe(defaultConfigFile);
    expect(options.verbose).toBe(false);
    expect(options.interactive).toBe(false);
  });
});
