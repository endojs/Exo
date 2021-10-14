set -ueo pipefail

# The icon files are checked-in.
# This script will regenerate them, has system dependencies, and as yet has
# only been attempted on a Mac.

# ImageMagic can be obtained from most package managers.
# For example, `brew install imagaemagick`.

# `sips` and `iconutil` come with Macs or the Mac developer tools.
# `sips` could certainly be substituted for `convert`, but `convert` does not
# support `ico` files (Windows).

# When this project matures, it might make sense to generate each resolution
# manually to optimize for scale.

convert art/exo.png -bordercolor white -border 0 \
  \( -clone 0 -resize 16x16 \) \
  \( -clone 0 -resize 32x32 \) \
  \( -clone 0 -resize 48x48 \) \
  \( -clone 0 -resize 64x64 \) \
  -delete 0 -alpha off -colors 256 asset/exo.ico

sips -z 16 16 art/exo.png --out asset/exo.iconset/icon_16x16.png
sips -z 32 32 art/exo.png --out asset/exo.iconset/icon_16x16@2x.png
sips -z 32 32 art/exo.png --out asset/exo.iconset/icon_32x32.png
sips -z 64 64 art/exo.png --out asset/exo.iconset/icon_32x32@2x.png
sips -z 128 128 art/exo.png --out asset/exo.iconset/icon_128x128.png
sips -z 256 256 art/exo.png --out asset/exo.iconset/icon_128x128@2x.png
sips -z 256 256 art/exo.png --out asset/exo.iconset/icon_256x256.png
sips -z 512 512 art/exo.png --out asset/exo.iconset/icon_256x256@2x.png
sips -z 512 512 art/exo.png --out asset/exo.iconset/icon_512x512.png
sips -z 1024 1024 art/exo.png --out asset/exo.iconset/icon_512x512@2x.png

iconutil -c icns asset/exo.iconset
