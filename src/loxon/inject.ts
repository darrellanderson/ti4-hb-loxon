import { refPackageId } from "@tabletop-playground/api";
import {
  FactionSchemaType,
  PlanetAttachmentSchemaType,
  SourceAndPackageIdSchemaType,
  SystemSchemaType,
  TechSchemaType,
  UnitAttrsSchemaType,
} from "ti4-ttpg-ts-types"; // declares global TI4
import { NSID_TO_TEMPLATE_ID as nsidToTemplateId } from "nsid/nsid-to-template-id";

const packageId: string = refPackageId;
console.log(`Loading Loxon homebrew from package ${packageId}`);

const sourceAndPackageId: SourceAndPackageIdSchemaType = {
  source: "homebrew.loxon",
  packageId: packageId,
};

const factions: Array<FactionSchemaType> = [
  {
    name: "Loxon Herd",
    nsidName: "loxon",
    abbr: "Loxon",
    abilities: ["vigilant", "trampling", "imposing-stature"],
    commodities: 3,
    factionTechs: ["resolute-2", "universal-docking-protocols"],
    home: 3001,
    leaders: {
      agents: ["shahm-kewr"],
      commanders: ["daahzi-pohip"],
      heroes: ["fractured-spyglass"],
      mechs: ["surveyor"],
    },
    promissories: ["exotic-locale"],
    startingTechs: ["duranium-arbor"],
    startingUnits: { flagship: 1, destroyer: 2, infantry: 4, spaceDock: 1 },
    unitOverrides: ["arill-queen", "resolute", "resolute-2"],
    extras: [{ nsid: "token.attachment.planet:homebrew.loxon/loxon-a" }],
  },
];

const systems: Array<SystemSchemaType> = [
  {
    tile: 3001,
    planets: [
      {
        name: "Pachydra",
        nsidName: "pachydra",
        resources: 3,
        influence: 3,
      },
      {
        name: "Gomphyr",
        nsidName: "gomphyr",
        resources: 1,
        influence: 1,
      },
    ],
  },
];

const planetAttachments: Array<PlanetAttachmentSchemaType> = [
  { name: "Loxon A", nsidName: "loxon-a", traits: ["cultural"] },
];

const unitAttrs: Array<UnitAttrsSchemaType> = [
  {
    unit: "flagship",
    name: "Arill Queen",
    nsidName: "arill-queen",
    spaceCombat: { hit: 9, dice: 2 },
  },
  {
    unit: "destroyer",
    name: "Resolute",
    nsidName: "resolute",
    hasSustainDamage: true,
  },
  {
    unit: "destroyer",
    name: "Resolute 2",
    nsidName: "resolute-2",
    hasSustainDamage: true,
  },
];

const technologies: Array<TechSchemaType> = [
  {
    name: "Universal Docking Protocols",
    nsidName: "universal-docking-protocols",
    color: "yellow",
    prerequisites: { yellow: 1 },
    isFactionTech: true,
  },
  {
    name: "Resolute 2",
    nsidName: "resolute-2",
    replacesNsidName: "resolute",
    color: "unit-upgrade",
    prerequisites: { red: 2 },
    isFactionTech: true,
  },
];

TI4.homebrewRegistry.load({
  sourceAndPackageId,
  factions,
  systems,
  planetAttachments,
  unitAttrs,
  technologies,
  nsidToTemplateId,
});
