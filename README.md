# Agoric's Pledger - Pluggable, Personal, Promise-based Ledger

**NOTE: Experimental and certainly not ready for production!**

This is a graphical desktop app that manages the [Agoric](https://agoric.com) client, on Linux, MacOS, or Windows.

Documentation for the Electron Forge system that Pledger currently uses is at https://electronforge.io

## Running on your platform

You can try out the current UI by running:

```sh
yarn install
yarn build
cd packages/app-electron
yarn start
```

## Packaging the application for your platform

```sh
yarn package
```

## Creating installers for your platform

Note that the installers for MacOS and Windows currently depend on application
signing keys that only exist on my (@michaelfig) build machine.  Changing this
dependencies is possible in the `packages/app-electron/package.json`.

To create the installers from the previous packaging, run:

```sh
export SNAPCRAFT_BUILD_ENVIRONMENT=host # Needed under Linux VMs that can't nest VMs
yarn make --skip-package
```

Omit `--skip-package` if you want to package and create the installers in the
same step.

## Publishing installers for this platform

In order to do a release, you should bump the
`packages/app-electron/package.json` version.  Then do the following and test
the installers in the `packages/app-electron/out/` directory.

```sh
# Create a publishing bundle
yarn publish:electron --dry-run
```

After you're content with the installers for each platform, you should publish
to Github.  The next step currently needs the `$GITHUB_TOKEN` for
https://github.com/agoric-labs/Pledger in order to create release artifacts.


```sh
# Push the bundle to the publishers
yarn publish:electron --from-dry-run
```

### Publishing Snaps

NOTE: For now, you will have to manually do:

```sh
snapcraft upload --release=beta out/make/pledger-*.snap
```

We'd like to use the following:

```json
{
  "name": "@electron-forge/publisher-snapcraft",
  "config": {
    "release": "beta"
  }
}
```

but first we need a solution to:
https://github.com/davidwinter/electron-forge-maker-snap/issues/38
