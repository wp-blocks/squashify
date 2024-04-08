import { OutputData } from "./types.js";
import sharp from "sharp";

export function encodeAnimation(
  src: string,
  dist: string,
): Promise<OutputData> {
  /** @var {any} image Load the image with sharp */
  return sharp(src, { animated: true }).toFile(dist);
}
