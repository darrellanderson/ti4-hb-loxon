import { CreateDeck } from "./lib/create-deck";

async function go() {
  await new CreateDeck("alliance").setIsPortrait(false).go();
  await new CreateDeck("faction-reference")
    .setSizePx(969, 682)
    .setSizeWorld(8.8, 6.3)
    .go();
  await new CreateDeck("leader").setIsPortrait(false).go();
  await new CreateDeck("planet").go();
  await new CreateDeck("promissory").go();
  await new CreateDeck("technology/yellow").setIsPortrait(false).go();
  await new CreateDeck("technology/unit-upgrade").setIsPortrait(false).go();
}
go();
