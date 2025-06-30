import fs from "fs";
import klawSync from "klaw-sync";

import {
  CardsheetCardType,
  CreateCardsheet,
  CreateCardsheetParams,
} from "../../../../ttpg-darrell/src/index-ext";

export class CreateDeck {
  private readonly _cardType: string;
  private _portrait: boolean = true;
  private _wPx: number = 500; // 340;
  private _hPx: number = 750; // 510;
  private _wWorld: number = 4.2;
  private _hWorld: number = 6.3;

  constructor(cardType: string) {
    this._cardType = cardType;
  }

  setIsPortrait(portrait: boolean): this {
    this._portrait = portrait;
    return this;
  }

  setSizePx(w: number, h: number): this {
    this._wPx = w;
    this._hPx = h;
    return this;
  }

  setSizeWorld(w: number, h: number): this {
    this._wWorld = w;
    this._hWorld = h;
    return this;
  }

  getCardJsonFiles(): Array<string> {
    return klawSync("prebuild/card/" + this._cardType, {
      nodir: true,
      traverseAll: true,
      filter: (item) => {
        return item.path.endsWith(".json");
      },
    }).map((item) => item.path);
  }

  getSourceToCards(
    jsonFiles: Array<string>
  ): Map<string, Array<CardsheetCardType>> {
    const result: Map<string, Array<CardsheetCardType>> = new Map<
      string,
      Array<CardsheetCardType>
    >();
    for (const jsonFile of jsonFiles) {
      const data: string = fs.readFileSync(jsonFile, "utf8");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cardJson: any = JSON.parse(data);
      if (!cardJson) {
        throw new Error("error readong " + jsonFile);
      }

      // Remove " (PoK)" suffix from name.
      let name: string = cardJson.name;
      const stripSuffix: string = " (PoK)";
      if (name.endsWith(stripSuffix)) {
        name = name.substring(0, name.length - stripSuffix.length);
        cardJson.name = name;
      }

      const nsid: string = cardJson.nsid.replace(/_/g, "-");
      const parts: Array<string> = nsid.split(/[:/]/);
      let source: string | undefined = parts[1];
      if (!source) {
        throw new Error("missing source in nsid: " + nsid);
      }
      source = source.replace(/\./g, "-");
      let cards: Array<CardsheetCardType> | undefined = result.get(source);
      if (cards === undefined) {
        cards = [];
        result.set(source, cards);
      }

      // Get face (and if not a shared image, back).
      // Make a relative path starting with prebuild.
      let face: string = jsonFile.replace(".json", ".jpg");
      let back: string | undefined = undefined;
      if (!fs.existsSync(face)) {
        face = jsonFile.replace(".json", ".face.jpg");
        back = jsonFile.replace(".json", ".back.jpg");
      }
      const faceParts: Array<string> = face.split("/");
      while (faceParts[0] !== "prebuild") {
        faceParts.shift();
      }
      face = faceParts.join("/");
      if (back) {
        const backParts: Array<string> = back.split("/");
        while (backParts[0] !== "prebuild") {
          backParts.shift();
        }
        back = backParts.join("/");
      }

      let card: CardsheetCardType | undefined = undefined;
      if (back === undefined) {
        card = {
          metadata: nsid,
          name: cardJson.name,
          face,
        };
      } else {
        card = {
          metadata: nsid,
          name: cardJson.name,
          face,
          back,
        };
      }
      cards.push(card);
    }
    return result;
  }

  getParams(
    cardType: string,
    source: string,
    cards: Array<CardsheetCardType>
  ): CreateCardsheetParams {
    const first: CardsheetCardType | undefined = cards[0];
    if (!first) {
      throw new Error("no cards for source: " + source);
    }
    const hasBack: boolean = first.back === undefined;

    const assetFilename: string = `card/${cardType}/${source}`;
    const templateName: string = cardType;

    let applyAllTags: Array<string> = [
      `card-${this._cardType.replace(/\//g, "-")}`,
    ];
    if (this._cardType.startsWith("technology")) {
      applyAllTags.push("card-technology");
    }
    applyAllTags = applyAllTags.map((tag) => tag.replace("-public-", "-"));

    const cardSizePixel: { width: number; height: number } = {
      width: this._portrait ? this._wPx : this._hPx,
      height: this._portrait ? this._hPx : this._wPx,
    };
    const cardSizeWorld: { width: number; height: number } = {
      width: this._portrait ? this._wWorld : this._hWorld,
      height: this._portrait ? this._hWorld : this._wWorld,
    };

    let result: CreateCardsheetParams | undefined = undefined;
    if (hasBack) {
      result = {
        assetFilename,
        templateName,
        applyAllTags,
        cardSizePixel,
        cardSizeWorld,
        back: `prebuild/card/shared-back/${cardType.replace(/\//g, "-")}.back.jpg`,
        cards,
      };
    } else {
      result = {
        assetFilename,
        templateName,
        applyAllTags,
        cardSizePixel,
        cardSizeWorld,
        cards,
      };
    }
    return result;
  }

  async createDeck(params: CreateCardsheetParams): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const create = new CreateCardsheet(params);
      create
        .clean()
        .then(() => {
          create.writeFiles().then(resolve).catch(reject);
        })
        .catch(reject);
    });
  }

  async go(): Promise<void[]> {
    const jsonFiles: Array<string> = this.getCardJsonFiles();
    const sourceToCards: Map<
      string,
      Array<CardsheetCardType>
    > = this.getSourceToCards(jsonFiles);
    const promises: Array<Promise<void>> = [];
    for (const [source, cards] of sourceToCards) {
      const params: CreateCardsheetParams = this.getParams(
        this._cardType,
        source,
        cards
      );
      promises.push(this.createDeck(params));
    }
    return Promise.all(promises);
  }
}
