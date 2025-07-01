/**
 * Create system tile objects.
 *
 * Input: prebuild/tile/system/tile-{tile}.jpg
 * Output:
 * - assets/Templates/tile/system/tile-{tile}.json
 * - assets/Textures/tile/system/tile-{tile}.jpg
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

import { TILE_SYSTEM_TEMPLATE } from "./data/tile-system.template-data";
import { getGuid } from "./lib/guid";

type TileInfo = {
  guid: string;
  name: string;
  nsid: string;
  imgFileFace: string; // paths are relative to prebuild or assets/Textures
  imgFileBack: string;
  modelFileFace: string;
  modelFileBack: string;
  templateFile: string;
};

// Assemble tile info records.
const infos: Array<TileInfo> = [];

const tile: number = 3001;
const source: string = "homebrew.loxon";

const tileStr: string = tile.toString().padStart(3, "0");
const name: string = `Tile ${tileStr}`;
const nsid: string = `tile.system:${source}/${tile}`;
const imgFileFace: string = `tile/system/tile-${tileStr}.jpg`;
const modelFileFace: string = "tile/system/system-tile.obj";
const modelFileBack: string = "tile/system/system-tile.obj";

const templateFile: string = `tile/system/tile-${tileStr}.json`;

const guid: string = getGuid(templateFile);

// Back will vary.
const imgFileBack: string = "tile/system/green.back.jpg";

infos.push({
  guid,
  name,
  nsid,
  imgFileFace,
  imgFileBack,
  modelFileFace,
  modelFileBack,
  templateFile,
});

// Validate the input files.
const errors: Array<string> = [];
for (const info of infos) {
  if (!fs.existsSync("./prebuild/" + info.imgFileFace)) {
    errors.push(`File face not found: "${info.imgFileFace}"`);
  }
  if (!fs.existsSync("./prebuild/" + info.imgFileBack)) {
    errors.push(`File back not found: "${info.imgFileBack}"`);
  }
}
if (errors.length > 0) {
  throw new Error(errors.join("\n"));
}

const transformFiles: Array<string> = [];
for (const info of infos) {
  console.log(`Building tile: ${info.name}`);

  const json = JSON.parse(JSON.stringify(TILE_SYSTEM_TEMPLATE));
  json.GUID = info.guid;
  json.Name = info.name;
  json.Metadata = info.nsid;
  json.Models[0].Texture = info.imgFileFace;
  json.Models[1].Texture = info.imgFileBack;
  json.Models[0].Model = info.modelFileFace;
  json.Models[1].Model = info.modelFileBack;
  json.Tags = ["system"];

  const templateFile: string = "./assets/Templates/" + info.templateFile;
  const templateDir: string = path.dirname(templateFile);
  const templateData: Buffer = Buffer.from(JSON.stringify(json, null, 2));

  fs.mkdirSync(templateDir, { recursive: true });
  fs.writeFileSync(templateFile, templateData);

  fs.cpSync(
    "./prebuild/" + info.imgFileFace,
    "./assets/Textures/" + info.imgFileFace
  );
  fs.cpSync(
    "./prebuild/" + info.imgFileBack,
    "./assets/Textures/" + info.imgFileBack
  );

  transformFiles.push("./assets/Textures/" + info.imgFileFace);
  if (info.imgFileBack.startsWith("tile/system/tile-")) {
    transformFiles.push("./assets/Textures/" + info.imgFileBack);
  }
}

/**
 * Input images are "clean", but we want to apply some image adjustments to
 * make it easier to see units and such on them.
 *
 * @param filename
 */
async function transformImage(filename: string) {
  console.log(`Transforming image: ${filename}`);

  let img = sharp(filename);
  const buffer: Buffer = await img.toBuffer();

  // Now write a PNG version for UI.
  const mask = await sharp("prebuild/tile/system/blank.png")
    .resize(512, 512, { fit: "fill" })
    .extractChannel("alpha")
    .toBuffer();
  const pngFile: string = filename.replace(/.jpg$/, ".png");
  await sharp(buffer)
    .extract({
      left: 70,
      top: 70,
      width: 884,
      height: 884,
    })
    .resize(512, 512, { fit: "fill" })
    .joinChannel(mask)
    .toFile(pngFile);
}

async function transformImages() {
  for (const filename of transformFiles) {
    await transformImage(filename);
  }
}
transformImages();
