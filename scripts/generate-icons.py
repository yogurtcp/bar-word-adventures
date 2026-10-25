"""Create the original letter-tile SVG and install PNGs. Dev dependencies: fonttools, cairosvg.
Uses Debian's Noto and DejaVu fonts; the saved SVG contains paths, not font dependencies.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
import cairosvg

ROOT = Path(__file__).resolve().parents[1]
FONTS = Path('/usr/share/fonts')
latin = FONTS / 'truetype/dejavu/DejaVuSans-Bold.ttf'
hebrew = FONTS / 'truetype/noto/NotoSansHebrew-Bold.ttf'
arabic = FONTS / 'truetype/noto/NotoSansArabic-Bold.ttf'
cjk = FONTS / 'opentype/noto/NotoSansCJK-Bold.ttc'
# Each learning language has a tile: Spanish, Russian, Hebrew, English, Chinese,
# Japanese, Arabic, Turkish and Filipino (whose alphabet includes NG).
tiles = [
    ('es', 'Ñ', latin, -108, -108, -9, '#ffc9a1'),
    ('ru', 'Б', latin, 0, -113, 3, '#b7dcff'),
    ('he', 'א', hebrew, 108, -108, 10, '#d9c4ff'),
    ('en', 'A', latin, -113, 0, -4, '#c5ebce'),
    ('zh', '中', cjk, 0, 0, -3, '#ffe282'),
    ('ja', 'あ', cjk, 113, 0, 5, '#ffc2cc'),
    ('ar', 'ب', arabic, -108, 108, -9, '#e4d0ff'),
    ('tr', 'Ğ', latin, 0, 113, 4, '#ffce9c'),
    ('fil', 'Ng', latin, 108, 108, 10, '#bce9e9'),
]

def letter_paths(text, path, size):
    font = TTFont(path, fontNumber=0) if path.suffix == '.ttc' else TTFont(path)
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    paths, bounds, x = [], [], 0
    for char in text:
        name = cmap[ord(char)]
        glyph = glyphs[name]
        pen, box = SVGPathPen(glyphs), BoundsPen(glyphs)
        glyph.draw(pen); glyph.draw(box)
        a, b, c, d = box.bounds
        bounds.append((a + x, b, c + x, d))
        paths.append(f'<path transform="translate({x} 0)" d="{pen.getCommands()}"/>')
        x += font['hmtx'][name][0]
    left, bottom = min(b[0] for b in bounds), min(b[1] for b in bounds)
    right, top = max(b[2] for b in bounds), max(b[3] for b in bounds)
    scale = min(size / (top - bottom), 75 / (right - left))
    return f'<g transform="scale({scale} {-scale}) translate({-(left+right)/2} {-(bottom+top)/2})">{"".join(paths)}</g>'

svg = ['''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
<title id="title">Bar Words — letters from nine languages</title>
<desc id="desc">Colorful letter tiles: Ñ, Б, א, A, 中, あ, ب, Ğ and Ng.</desc>
<defs><radialGradient id="bg" cx="32%" cy="15%" r="110%"><stop stop-color="#237e80"/><stop offset="1" stop-color="#123c50"/></radialGradient></defs>
<path fill="url(#bg)" d="M0 0h512v512H0z"/>
<circle cx="260" cy="255" r="208" fill="none" stroke="#9ce3da" stroke-opacity=".15" stroke-width="2"/>
<circle cx="57" cy="152" r="5" fill="#b0e8e0" opacity=".55"/>
<circle cx="451" cy="354" r="6" fill="#b0e8e0" opacity=".45"/>
<path d="M410 63l4 12 12 4-12 4-4 12-4-12-12-4 12-4zM81 411l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#ffdf89"/>
''']
for language, text, font, x, y, angle, color in tiles:
    side = 106 if language == 'zh' else 98
    half = side / 2
    svg.append(f'<g data-language="{language}" transform="translate({256+x} {256+y}) rotate({angle})">')
    svg.append(f'<rect x="{-half}" y="{-half+7}" width="{side}" height="{side}" rx="23" fill="#082c3c" opacity=".45"/>')
    svg.append(f'<rect x="{-half}" y="{-half}" width="{side}" height="{side}" rx="23" fill="{color}" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>')
    svg.append('<g fill="#173f50">' + letter_paths(text, font, 62 if language == 'zh' else 57) + '</g></g>')
svg.append('</svg>')
source = '\n'.join(svg)
(ROOT / 'icons/letters-v1.svg').write_text(source)
for size in (180, 192, 512):
    cairosvg.svg2png(bytestring=source.encode(), write_to=str(ROOT / f'icons/letters-v1-{size}.png'), output_width=size, output_height=size)
