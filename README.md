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
