import { CreateDeck } from "./lib/create-deck";

async function go() {
  await new CreateDeck("action").go();
  await new CreateDeck("agenda").go();
  await new CreateDeck("alliance").setIsPortrait(false).go();
  await new CreateDeck("event")
    .setSizePx(1417, 826)
    .setSizeWorld(12.9, 7.5)
    .go();
  await new CreateDeck("exploration/cultural").go();
  await new CreateDeck("exploration/industrial").go();
  await new CreateDeck("exploration/hazardous").go();
  await new CreateDeck("exploration/frontier").go();
  await new CreateDeck("faction-reference")
    .setSizePx(969, 682)
    .setSizeWorld(8.8, 6.3)
    .go();
  await new CreateDeck("faction-token").go();
  await new CreateDeck("leader").setIsPortrait(false).go();
  await new CreateDeck("legendary-planet").setIsPortrait(false).go();
  await new CreateDeck("objective/public-1").go();
  await new CreateDeck("objective/public-2").go();
  await new CreateDeck("objective/secret").go();
  await new CreateDeck("other").go();
  await new CreateDeck("planet").go();
  await new CreateDeck("promissory").go();
  await new CreateDeck("relic").go();
  await new CreateDeck("technology/blue").setIsPortrait(false).go();
  await new CreateDeck("technology/green").setIsPortrait(false).go();
  await new CreateDeck("technology/red").setIsPortrait(false).go();
  await new CreateDeck("technology/yellow").setIsPortrait(false).go();
  await new CreateDeck("technology/unit-upgrade").setIsPortrait(false).go();
  await new CreateDeck("technology/none").setIsPortrait(false).go();
  await new CreateDeck("unknown").go();
}
go();
