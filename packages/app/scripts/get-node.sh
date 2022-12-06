#!/bin/bash
#
# This script provides a copy of node from nodejs.org and verifies its
# integrity against known hashes.
# The hashes are checked in, but the desired version changes, this script will
# obtain the new one and verify its signature.
# This script will do nothing if the archive of node has already been
# downloaded and extracted.

set -ueo  pipefail
DIR=$(dirname -- "${BASH_SOURCE[0]}")
cd -- "$DIR/.."

VERSION=v$(jq -r .version node.json)

SHASUMS=node-$VERSION-sha256sums.txt.asc
if [ ! -f "$SHASUMS" ]; then

  if ! curl -f "https://nodejs.org/dist/$VERSION/SHASUMS256.txt.asc" > "$SHASUMS"; then
    cat "$SHASUMS" >&2
    rm "$SHASUMS"
    exit 1
  fi
  if ! gpg --verify "$SHASUMS"; then
    echo "Signature check for new Node version failed."
    echo "You may need to get the GPG keys for Node.js releasers."
    echo "https://github.com/nodejs/node#verifying-binaries"
    exit 1
  fi
fi

for ARCH_EXT in darwin-x64.tar.gz linux-x64.tar.gz win-x64.zip ; do

  UNPACKED=node-$VERSION-$ARCH_EXT
  if [ ! -d "$UNPACKED" ]; then

    ARCHIVE=node-$VERSION-$ARCH_EXT
    if [ ! -f "$ARCHIVE" ]; then
      curl -f "https://nodejs.org/dist/$VERSION/$ARCHIVE" > "$ARCHIVE"
    fi
    if ! grep -F "$(sha256sum "$ARCHIVE")" "$SHASUMS" > /dev/null; then
      echo "Hash integrity check failed for: $ARCHIVE"
      echo "Expected:"
      grep -F "$ARCHIVE" "$SHASUMS"
      echo "Actual:"
      sha256sum "$ARCHIVE"
      exit 1
    fi

  fi

done

[ -d "node-$VERSION-darwin-x64" ] || tar xvf "node-$VERSION-darwin-x64.tar.gz"
[ -d "node-$VERSION-linux-x64" ] || tar xvf "node-$VERSION-linux-x64.tar.gz"
[ -d "node-$VERSION-win-x64" ] || unzip "node-$VERSION-win-x64.zip"
