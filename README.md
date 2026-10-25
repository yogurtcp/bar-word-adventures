# Bar’s Word Adventures

**[Play and install](https://yogurtcp.github.io/bar-word-adventures/)** · [Source](https://github.com/yogurtcp/bar-word-adventures)

A separate, child-friendly language-learning app starring Bar. Learn everyday words,
expressions, gestures and letters with pictures, recorded voices and gentle rewards.
There are no math activities, accounts, ads, microphone recordings or pronunciation scores.

Language order: **Spanish, Russian, Hebrew, English, Mandarin Chinese, Japanese, Arabic, Turkish, Filipino**.
Choose a learning language on launch. **Instructions and menus default to Hebrew**, with English
as the other option. **Narrator language** is a separate Hebrew/English setting and also defaults
to Hebrew. Both controls are available on the launch screen, home screen and in the adult menu. The globe button switches languages during play and starts a fresh question.

For example, learn Spanish with Hebrew text instructions and English spoken guidance.
Each instruction plays in the narrator language, followed by any example word or letter sound
in its own learning-language voice. Tapping a Spanish word always plays Spanish, regardless
of the instruction and narrator settings. Selections persist independently across launches
and language switches; existing stars, volume and progress are retained.

## Explore, then practise

- **Picture words:** 134 illustrated words in 13 themes. Tap to hear a word; its spelling,
  translation in the instruction language and Mandarin pinyin are visible. No stars or tests in the dictionary.
- **Talk with Bar:** 27 everyday expressions, including hello, goodbye, yes, no, please
  and thank you. Eight two-frame Bar gesture loops invite imitation. These are ordinary
  expressive gestures, not formal sign language. Speaking practice is self-reported.
- **Letter garden:** tap a native letter, pinyin unit or kana to hear it and see matching words.
  Turkish dotted/dotless I, Spanish Ñ, Hebrew vowel marks and Arabic writing direction are retained.
- **Practice:** picture naming, listen-and-choose, picture-to-word matching, word/picture memory,
  first letters, shared starting letters, building words, letter order, clue cards and gesture matching.
  Choose a specific activity on the home screen or play a shuffled mix of all ten.
  Letter-order prompts say the letters in order in the learning language; replay repeats them,
  and every letter tap says that letter’s name, including mistakes. First-letter choices and
  word-building tiles also pronounce their letters/characters; a correct final tile says its
  name before the complete word, without interrupting either clip. The starting-sound cue
  is tappable to hear it again. Accents, Hebrew final forms, Arabic variants, small kana,
  Mandarin characters and spaces have explicit pronunciation support.

Word building uses whole grapheme clusters, keeping combining marks attached, and shapes
completed Arabic/Hebrew words in their native direction. Beginner tasks show the target spelling;
harder tasks offer a hint. Mistakes invite another try and never remove stars. Five completions
earn a star. Difficulty advances independently per language and skill after unassisted success.

## Immediate mistake feedback

In every activity, each wrong answer (including a mismatched memory pair) immediately shows a large
crying Bar animation with a quiet sad melody. The whole game screen is locked for exactly
three seconds, then the same question resumes. Rapid extra taps cannot add penalties or
advance the answer during that pause. There are no hearts, streak penalties or lost stars.
Mute/volume and reduced-motion preferences remain respected.

## Everyday vocabulary and Filipino

The new topics include people and family (child, boy, girl, baby, mother, father), body parts,
everyday objects (water, door, soap, toilet, phone), actions, feelings, opposites (big/little,
hot/cold, clean/dirty) and colours. The phrase book adds greetings, good morning/night,
apologies, asking for help or water, introducing yourself and other everyday expressions.
People, actions and adjective pictures that can overlap in meaning are taught in naming,
spelling and first-letter listening; they are excluded from picture-only distractor pools.

Filipino has all 134 words and 27 expressions, its own recorded voice, and the 28-letter
alphabet. `Ñ` and `NG` stay distinct, including `NG` tiles inside words. Sources:
[KWF orthography](https://www.kwf.gov.ph/wp-content/uploads/Ortograpiyang_Pambansa_1.pdf),
[NCCA alphabet](https://ncca.gov.ph/about-ncca-3/subcommissions/subcommission-on-cultural-disseminationscd/language-and-translation/orthography-evolution/),
[Microsoft voice support](https://learn.microsoft.com/en-us/azure/ai-services/Speech-Service/language-support).

## Install, audio and offline use

Open the public HTTPS app, choose a language and tap **Install app** on the home screen.
On Android Chrome, confirm the native install prompt. On iPhone/iPad, use Safari’s
**Share → Add to Home Screen**. The installed app has its own **Bar Words** letter-tile icon and standalone window.
The icon includes Spanish Ñ, Russian Б, Hebrew א, English A, Chinese 中, Japanese あ,
Arabic ب, Turkish Ğ and Filipino Ng. Its original vector source is [letters-v1.svg](icons/letters-v1.svg);
[generate-icons.py](scripts/generate-icons.py) creates the Android, desktop and iOS PNGs.
Installation availability depends on the browser and OS.

The entire app shell, all picture atlases, Bar animations and icons cache for offline launches.
Narration is downloaded as used. To prepare a learning language for fully offline use, open
**Menu**, answer the adult check, then choose **Download learning words and narration for offline play** and wait for completion. This includes both the learning language and the selected narrator.
All 2,717 active narration clips are bundled with the app; there is no online speech service at runtime.

Settings include volume, three difficulty levels, a gentle-motion switch, optional portrait reactions,
voice testing, a reproducible Game Lab and progress reset. OS reduced-motion preferences are respected.
The adult arithmetic check protects settings only; it is not a learning activity.

Online startups check once for new releases. There is no periodic polling or foreground/reconnection
check. Updates wait until a safe navigation boundary, preserving an active question, and resume the
selected language/activity after applying. Stars, settings and saved audio remain. An app cannot fetch
updates while closed. An independent [update page](https://yogurtcp.github.io/bar-word-adventures/update.html)
is available for recovering a damaged installation without clearing saves.

## Separate from the existing games

This app has its own repository, URL, manifest identity, service-worker scope, audio cache,
progress, content decks and settings. It never migrates, resets or rewrites saves from
[Little Language Quest](https://yogurtcp.github.io/little-language-quest/) or
[Bar’s Adventures](https://yogurtcp.github.io/bar-adventures/).

Reused assets: 86 pixel-art objects, recorded vocabulary/instructions and six generated Bar portrait
reactions from Little Language Quest. The installation icon is an original letter-tile design
using Noto and DejaVu glyphs saved as vector paths. The original family
photograph is not included. New Bar gesture art was created with built-in imagegen. The gesture atlas and prompt are documented in [BAR_GESTURES.md](art-source/BAR_GESTURES.md). New crying art and 48 additional vocabulary pictures, with their exact prompts, are documented in [DAILY_AND_CRYING.md](art-source/DAILY_AND_CRYING.md).

New narration reuses the established voices: Elvira, Svetlana, Hila, Aria, Xiaoxiao, Nanami,
Zariyah, Emel and Filipino Blessica. A native-speaker review of new phrase and letter recordings is still recommended.

## Run, test and publish

Node 18+ and npm are needed for development only; the browser has no runtime dependencies.

```sh
npm ci
npm test         # Builds the package, then runs gameplay, navigation, audio and PWA checks
npm start        # http://127.0.0.1:4178
npm run deploy   # Tests/builds and publishes dist to the separate gh-pages branch
```

The build fingerprints the complete shell to produce its update version and ships only active audio.
Source lives on `main`; GitHub Pages publishes `gh-pages`. Native browser automation was unavailable
during initial development; automated DOM and service-worker tests cover the application flows.

To generate changed narration at development time, install `edge-tts==7.3.1` and run
`python scripts/generate-audio.py`. Only authored game text goes to the speech service.
`scripts/check-audio.py` verifies decodability, duration and audible signal with build-only
`soundfile` and `numpy` dependencies.

## Selected Hebrew voice upgrade

Kore is the selected replacement for Hebrew narration. The build-time migration
and credential setup are documented in [HEBREW_KORE.md](scripts/HEBREW_KORE.md).
The published voice changes only when the replacement audio is generated and released.
