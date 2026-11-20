[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ramabram46-png/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ramabram46-png/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# The Leonida Trophy Guide — GTA 6, all 55 trophies

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5, built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden — with the exact official names, descriptions and grades.
- **A method for every trophy, written in our own words and cited beside it.** The main source is [PowerPyx's trophy guide](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) (checked 20 November 2026), cross-checked against [GTA Zone](https://gta-zone.com/news/gta-6-trophies-achievements/), Exophase and PSNProfiles.
- **An honest audit, not a guess.** 52 trophies are confirmed, 2 are disputed (Positive Mental Attitude: is the Chapter 1 meditation required? Fair Game: which animal?), and 1 is still unconfirmed (Bad Luck, I Guess). The guide says so on the card instead of inventing a method — and it names the four trophies GTA Zone's 18 November list called unconfirmed that PowerPyx's 20 November guide now pins down.
- **A tracker that lives in the browser:** tick trophies off, filter by kind (story / missable / collectibles / activities / crime / quests / money) and grade, search, sort, hide story spoilers until a trophy is earned, export and import progress, and watch the progress ring fill.
- **A platinum roadmap:** about 200 hours, difficulty 4/10, one playthrough, 0 online trophies, potentially 1 missable — three stages (story 60–80h, 100% checklist ~100h, cleanup ~10h), plus steppers for every line of the 100% checklist (200 of 277 vehicles, 100 of 255 animals, 70 of 80 challenges…).

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network at runtime: static files under `app/` (HTML, CSS, ES modules, JSON, two SIL OFL fonts). Your ticks and checklist counts are stored in `localStorage` only.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Sources

- PowerPyx — [GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/)
- GTA Zone — [GTA 6 Trophy List](https://gta-zone.com/news/gta-6-trophies-achievements/)
- Exophase — [Grand Theft Auto VI trophies](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- PSNProfiles — [Grand Theft Auto VI](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)

Fan-made guide. Not affiliated with Rockstar Games or Sony. Trophy names and descriptions are the game's own; every method is written in our own words and cited. Fonts: Archivo and Inter, SIL Open Font License 1.1.
