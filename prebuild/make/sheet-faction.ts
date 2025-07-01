/**
 * Create faction icon PNGs with transparency.
 *
 * Assumes:
 * - assets/Textures/faction-sheet/*.face.jpg
 * - assets/Textures/faction-sheet/*.back.jpg
 *
 * Input: N/A
 *
 * Output:
 * - assets/Templates/faction-sheet/*.json
 */

import fs from "fs";
import path from "path";

import { FACTION_SHEET_TEMPLATE_DATA } from "./data/faction-sheet.template-data";
import { getGuid } from "./lib/guid";

const source: string = "homebrew.loxon";
const nsidName = "loxon";
const abbr: string = "Loxon";

// Token spawns face-down, swap face/back so no need to flip.
const face: string = `faction-sheet/${nsidName}.back.jpg`;
const back: string = `faction-sheet/${nsidName}.face.jpg`;
if (!fs.existsSync(`./assets/Textures/${face}`)) {
  throw new Error(`Missing faction sheet: ${face}`);
}
if (!fs.existsSync(`./assets/Textures/${back}`)) {
  throw new Error(`Missing faction sheet: ${back}`);
}

const template = JSON.parse(JSON.stringify(FACTION_SHEET_TEMPLATE_DATA));

let templateFile: string = `faction-sheet/${nsidName}.json`;

const guid: string = getGuid(templateFile);

template.GUID = guid;
template.Name = `${abbr}`;
template.Metadata = `sheet.faction:${source}/${nsidName}`;
template.FrontTexture = face;
template.BackTexture = back;
template.CardNames["0"] = template.Name;
template.CardMetadata["0"] = template.Metadata;

templateFile = "./assets/Templates/" + templateFile;
const templateDir = path.dirname(templateFile);
const templateData = Buffer.from(JSON.stringify(template, null, 2));
fs.mkdirSync(templateDir, { recursive: true });
fs.writeFileSync(templateFile, templateData);
