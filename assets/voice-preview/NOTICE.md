# Free Hebrew voice audition credits

Generated locally using BlueTTS 2.5. No cloud TTS, account, API key or paid requests
were used. The recorded texts and IPA pronunciations come from our existing games.

- Engine: https://github.com/maxmelichov/BlueTTS (MIT, reproduced below).
- Model bundle: https://huggingface.co/notmax123/BlueTTS2.5-onnx.
- Voice reference styles: `libri_female_6147` (Liberty Stump) and `libri_male_6209`
  (deckerteach), from LibriTTS-R train-clean-100; Google LLC, CC BY 4.0:
  https://creativecommons.org/licenses/by/4.0/.
- Transformations: synthesis of new Hebrew text with the supplied voice styles,
  16 inference steps, classifier-free guidance 4.0, playback pace 0.8, peak limiting
  and MP3 encoding. This does not imply endorsement by the referenced speakers.
- Exact engine/model revisions and synthesis inputs: `preview.json`.
- Reproduce with `scripts/generate-free-hebrew-preview.py`; dependencies and
  CLI arguments are documented in the script. Large model files are build-only.

These are audition assets. They do not replace the apps' live narration.

## BlueTTS license

MIT License

Copyright (c) 2025 Blue

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
