#!env ts-node

/**
 * Create map from template metadata ("NSID") to template id.
 *
 * ARGS:
 * -i : path to assets/Templates dir
 * -o : path to src/out.json file
 * -f : overwrite any existing output file
 */

import * as fs from "fs-extra";
import klawSync from "klaw-sync"; // walk file system
import * as path from "path";

const args = {
  i: "assets/Templates",
  o: "src/nsid/nsid-to-template-id.ts",
};

async function main() {
  const root = path.resolve(args.i);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory) {
    throw new Error(`missing (-i) template directory "${root}"`);
  }

  // ------------------------------------
  console.log("\n----- LOCATING TEMPLATE JSON FILES -----\n");

  console.log(`scanning "${root}"`);
  const jsonFilenames = klawSync(root, {
    filter: (item) => path.extname(item.path) === ".json",
    nodir: true,
    traverseAll: true,
  }).map((item) => item.path);

  // Extract NSID -> templateId
  const nsidToTemplateId: { [key: string]: string } = {};

  // Restrict to templates.
  for (const jsonFilename of jsonFilenames) {
    const json = fs.readJSONSync(jsonFilename);
    const templateId = json.GUID;
    let nsid = json.Metadata;

    // Reject if missing a root level key (not a template file?).
    if (typeof templateId !== "string") {
      console.log(`rejecting no GUID: "${jsonFilename}"`);
      continue;
    }
    if (typeof nsid !== "string") {
      console.log(`rejecting no metadata: "${jsonFilename}"`);
      continue;
    }

    // Include decks as a "*" named NSID.
    if (json.Type === "Card" && typeof json.CardMetadata === "object") {
      // Require all cards share the same prefix.
      const cardNsids: Array<string> = Object.values(json.CardMetadata);
      if (cardNsids.length === 1 && (cardNsids[0]?.length ?? 0) > 0) {
        const newNsid = cardNsids[0];
        if (nsid !== newNsid) {
          console.log(
            `REPLACING SINGLETON "${nsid}" with "${newNsid}" (${jsonFilename})`
          );
          nsid = newNsid;
        }
      } else if (cardNsids.length > 1) {
        const getPrefix = (items: Array<string>): string => {
          const first: string = items[0] ?? "";
          const firstParts: Array<string> = first.split(".");

          // Get longest dot-delimited matching type.
          let matchingPartsCount = firstParts.length;
          for (const item of items) {
            const parts: Array<string> = item.split(".");
            for (let i = 0; i < parts.length; i++) {
              if (parts[i] !== firstParts[i]) {
                matchingPartsCount = Math.min(matchingPartsCount, i);
                break;
              }
            }
          }
          const result: string = firstParts
            .slice(0, matchingPartsCount)
            .join(".");
          if (result.startsWith("card.leader")) {
            return "card.leader";
          }
          return result;
        };

        // Use a common prefix (matching to a dot-delimited string).
        const types: Array<string> = cardNsids.map((cardNsid) => {
          const m = cardNsid.match("([^:]+):([^/]+)/.+");
          return m?.[1] ?? "";
        });
        const type = getPrefix(types);

        const sources: Array<string> = cardNsids.map((cardNsid): string => {
          const m = cardNsid.match("([^:]+):([^/]+)/.+");
          return m?.[2] ?? "";
        });
        const source = getPrefix(sources);

        for (let i = 0; i !== -1; i++) {
          const newNsid = `${type}:${source}/${i}`;
          if (!nsidToTemplateId[newNsid]) {
            console.log(
              `REPLACING DECK "${nsid}" with "${newNsid}" (${jsonFilename})`
            );
            nsid = newNsid;
            break;
          }
        }
      }
    }

    if (!nsid.match("[^:]+:[^/]+/.+")) {
      // Reject metadata does not look like NSID.
      console.log(`rejecting not nsid: "${jsonFilename}" ("${nsid}")`);
      continue;
    }

    // Strip off any "|extra" part.
    const parts: Array<string> = nsid.split("|");
    const nsidBase: string | undefined = parts[0];
    if (nsidBase) {
      nsid = nsidBase;
    }

    console.log(`accepting "${jsonFilename}: ${nsid}"`);
    if (nsidToTemplateId[nsid]) {
      throw new Error(`Duplicate NSID "${nsid}"`);
    }
    nsidToTemplateId[nsid] = templateId;
  }

  const json: string =
    JSON.stringify(nsidToTemplateId, Object.keys(nsidToTemplateId).sort(), 4) +
    "\n";
  const ts: string = `export const NSID_TO_TEMPLATE_ID: { [key: string]: string } = ${json};\n`;
  fs.writeFileSync(args.o, ts);
}

main();
