/**
 * Create faction icon PNGs with transparency.
 *
 * Input: prebuild/icon/faction/*.png
 *
 * Output:
 * - assets/Textures/icon/faction/*.png
 */

import fs from "fs";
import path from "path";

import { outlineOnly } from "./lib/outline-mask";

async function processFaction(nsidName: string) {
  const src: string = `./prebuild/icon/faction/${nsidName}.png`;
  const dst: string = `./assets/Textures/icon/faction/${nsidName}.png`;

  if (!fs.existsSync(src)) {
    throw new Error(`File not found: "${src}"`);
  }

  const dstDir: string = path.dirname(dst);
  fs.mkdirSync(dstDir, { recursive: true });
  fs.cpSync(src, dst);

  // Version which is only the outline.
  await outlineOnly(dst);
}

function go() {
  processFaction("loxon");
}

go();
