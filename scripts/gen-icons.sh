set -ueo pipefail

# The icon files are checked-in.
# This script will regenerate them, has system dependencies, and as yet has
# only been attempted on a Mac.

# ImageMagic can be obtained from most package managers.
# For example, `brew install imagaemagick`.

# `sips` and `iconutil` come with Macs or the Mac developer tools.
# `sips` could certainly be substituted for `convert`, but `sips` does not
# support `ico` files (Windows).

# When this project matures, it might make sense to design each resolution
# manually to optimize for scale.

mkdir -p art/gen

convert art/endo.png -bordercolor white -border 0 \
  \( -clone 0 -resize 16x16 \) \
  \( -clone 0 -resize 32x32 \) \
  \( -clone 0 -resize 48x48 \) \
  \( -clone 0 -resize 64x64 \) \
  -delete 0 -alpha off -colors 256 art/gen/icon.ico

sips -z 16   16   art/endo-mac.png --out art/gen/endo-mac-16.png
sips -z 32   32   art/endo-mac.png --out art/gen/endo-mac-32.png
sips -z 48   48   art/endo-mac.png --out art/gen/endo-mac-48.png
sips -z 64   64   art/endo-mac.png --out art/gen/endo-mac-64.png
sips -z 128  128  art/endo-mac.png --out art/gen/endo-mac-128.png
sips -z 256  256  art/endo-mac.png --out art/gen/endo-mac-256.png
sips -z 512  512  art/endo-mac.png --out art/gen/endo-mac-512.png
sips -z 1024 1024 art/endo-mac.png --out art/gen/endo-mac-1024.png

mkdir -p art/gen/icon.iconset
cp art/gen/endo-mac-16.png   art/gen/icon.iconset/icon_16x16.png
cp art/gen/endo-mac-32.png   art/gen/icon.iconset/icon_16x16@2x.png
cp art/gen/endo-mac-32.png   art/gen/icon.iconset/icon_32x32.png
cp art/gen/endo-mac-64.png   art/gen/icon.iconset/icon_32x32@2x.png
cp art/gen/endo-mac-64.png   art/gen/icon.iconset/icon_64x64.png
cp art/gen/endo-mac-128.png  art/gen/icon.iconset/icon_64x64@2x.png
cp art/gen/endo-mac-128.png  art/gen/icon.iconset/icon_128x128.png
cp art/gen/endo-mac-256.png  art/gen/icon.iconset/icon_128x128@2x.png
cp art/gen/endo-mac-256.png  art/gen/icon.iconset/icon_256x256.png
cp art/gen/endo-mac-512.png  art/gen/icon.iconset/icon_256x256@2x.png
cp art/gen/endo-mac-512.png  art/gen/icon.iconset/icon_512x512.png
cp art/gen/endo-mac-1024.png art/gen/icon.iconset/icon_512x512@2x.png

iconutil -c icns art/gen/icon.iconset

cp art/endo.png art/gen/icon.png
