#!/usr/bin/env bash
# Rebuilds the landing page images from the app repo's raw store captures.
#
#   tools/build-assets.sh [path-to-wordker_app]   (default: ../wordker_app)
#
# Needs cwebp (brew install webp) and Python with Pillow. Screens are resized
# to twice their largest on-page width, so they stay sharp on retina displays.
set -euo pipefail

SITE="$(cd "$(dirname "$0")/.." && pwd)"
APP="${1:-$SITE/../wordker_app}"
SHOTS="$APP/store/screenshots"

# screen name -> platform whose frame it is shown in
IOS_SCREENS=(03-home 04-game-selecting 05-game-words 06-results)
ANDROID_SCREENS=(07-leaderboard 08-settings 09-account)

for lang in en pl; do
  out="$SITE/assets/screens/$lang"
  mkdir -p "$out"
  for name in "${IOS_SCREENS[@]}"; do
    cwebp -quiet -q 84 -resize 660 0 "$SHOTS/ios/$lang/$name.png" -o "$out/$name.webp"
  done
  for name in "${ANDROID_SCREENS[@]}"; do
    cwebp -quiet -q 84 -resize 600 0 "$SHOTS/android/$lang/$name.png" -o "$out/$name.webp"
  done
done

python3 - "$APP" "$SITE" <<'PY'
import sys
from pathlib import Path
from PIL import Image, ImageDraw

app, site = Path(sys.argv[1]), Path(sys.argv[2])
icons = site / "assets" / "icons"
icons.mkdir(parents=True, exist_ok=True)
icon = Image.open(app / "store" / "google-play" / "icon-512.png").convert("RGBA")

# Browsers show favicons as-is, so round the corners here; iOS masks the
# touch icon itself and wants it full-bleed.
def rounded(img, size):
    big = img.resize((size * 4, size * 4), Image.LANCZOS)
    mask = Image.new("L", big.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *big.size), radius=int(size * 4 * 0.23), fill=255)
    big.putalpha(mask)
    return big.resize((size, size), Image.LANCZOS)

rounded(icon, 32).save(icons / "favicon-32.png")
rounded(icon, 192).save(icons / "icon-192.png")
icon.convert("RGB").resize((180, 180), Image.LANCZOS).save(icons / "apple-touch-icon.png")

for lang in ("en", "pl"):
    og = Image.open(app / "store" / "google-play" / f"feature-graphic-{lang}.png").convert("RGB")
    og.save(site / "assets" / f"og-{lang}.jpg", quality=88, optimize=True)
PY
echo "done"
