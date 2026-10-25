# Everyday pictures and crying Bar

Generated with the built-in imagegen tool on 2026-10-25. Reference: the existing generated Bar icon `icons/bar-512.png`. The original family photograph is not included.

Final project assets:

- `assets/bar/crying-v1.png`: two frames, animated for the three-second mistake pause.
- `assets/objects/daily-people.png`: 16 picture words.
- `assets/objects/daily-actions.png`: 16 picture words.
- `assets/objects/daily-opposites.png`: 16 picture words.

Source PNGs are copied unchanged. SVG viewports in `src/core/daily-crops.js` follow transparent separators so irregular cell heights cannot clip a person's face or feet.

## Crying sprite prompt

Use case: illustration-story. Asset type: two-frame horizontal sprite sheet for a children's learning game. Input image is a reference for Bar's established character identity and illustration style, not an edit target. Bar is the same friendly little boy with tousled chestnut-brown hair, enormous gray-green eyes, white short-sleeve T-shirt, blue shorts, blue sneakers. Generate EXACTLY TWO equal square cells side by side, one row, on genuinely transparent background. Full body, same scale and same foot baseline in both frames. No text, no border, no grid, no scenery, generous transparent padding. In frame 1 Bar is crying with a clearly sad frown, watery eyes and large cartoon tears running down his cheeks, hands near his cheeks. In frame 2 his eyes gently close and he rubs one eye while crying, fresh tears on cheeks and mouth still sad. Ordinary childlike cartoon crying, no injury, no violence, no fear. Keep body/feet in the same place to permit a gentle two-frame animation. The sheet should be 2:1 landscape, ideally 2048x1024, sharp pixel-edged colorful storybook game illustration matching the reference. Clear expressive face readable at small size.

## Daily atlas prompt template

Use case: scientific-educational. Asset type: preschool vocabulary picture sprite atlas, {sheet}. Generate exactly 16 separate illustrations in a precise 4-column, 4-row square grid. Each subject stays fully inside its equal square cell, centered with generous transparent padding. Genuinely transparent background, no grid lines, no text or labels, no decorative scenery spanning cells. Cute chunky pixel-edged storybook game art, saturated gentle colors, thick clear outlines, readable at 100 pixels. When Bar is mentioned, preserve the supplied reference boy's identity: tousled chestnut hair, large gray-green eyes, white T-shirt, blue shorts. Other people have distinct friendly appearances, all age-appropriate. Exact cell meanings in row-major order: {items} Do not include any writing or letters in the artwork. Square atlas ideally 2048x2048.

### daily-people — items

Row 1: a gender-neutral CHILD (young child in yellow overalls); a BOY in blue; a GIRL in a red dress; a BABY sitting in a diaper. Row 2: a MOTHER adult woman; a FATHER adult man; two FRIENDS smiling side by side; a TEACHER adult woman holding a book. Row 3: a child's HEAD only; an open HAND only; a large friendly EYE only; an EAR only. Row 4: a smiling MOUTH only; a NOSE only; a bare FOOT only; a glass of clear WATER.

### daily-actions — items

Row 1: a closed wooden DOOR; a simple TABLE; a bar of SOAP with bubbles; a school BAG. Row 2: a clean TOILET; a PHONE; a folded TOWEL; Bar EATING with a spoon and bowl. Row 3: Bar DRINKING from a glass; Bar SLEEPING in bed; Bar WALKING with one foot forward; Bar RUNNING with both arms pumping and motion marks. Row 4: Bar SITTING on a chair; Bar STANDING upright; Bar WASHING hands with soap; a HAPPY laughing face.

### daily-opposites — items

Row 1: a SAD frowning face; Bar HUNGRY holding his tummy near an empty plate; Bar TIRED yawning; BIG: a large highlighted teddy bear next to a tiny faded bear. Row 2: SMALL: a tiny highlighted teddy bear next to a large faded bear; HOT: a red steaming teacup with heat waves; COLD: a frosty blue glass with ice cubes; CLEAN: sparkling white clean shirt. Row 3: DIRTY: muddy stained shirt; OPEN: open treasure chest with lid raised; CLOSED: same chest with lid shut; FAST: bunny running with speed lines. Row 4: SLOW: turtle walking slowly; RED color: vivid red crayon and red color puddle; BLUE color: vivid blue crayon and blue puddle; GREEN color: vivid green crayon and green puddle.
