---
title: Getting Set Up For a Local Event
---

## Prepare your development environment

If you have not already done so, please follow the [Quick Start](/quick-start/) guide. The rest of this guide assumes you have either done this or created an equivalent environment manually.

## Configure Nix to use a local cache

!!! note Pre-requisite
Please check with the event hosts whether a local cache is being provided. If not, this section can be skipped.
!!!

The quick start `setup.sh` script configures Nix to use `https://holochain-ci.cachix.org` as a cache. This significantly speeds up launching the Holonix development environment. It works well in general, but at live events it requires a lot of bandwidth with multiple people downloading large files at the same time. To improve the experience for everyone, a cache can be provided locally. This section shows you how to connect to the local cache.

The event hosts will provide you with a cache name. This will be unique per event! Replace `<event-cache-name>` with the provided name in the command below.

At a command line:

```bash
bash <(curl https://holochain.github.io/holochain/configure-cache.sh) use <event-cache-name>
```

The script will tell you what it's changing and may ask for confirmation for some changes. It may also prompt for your password if it needs to make changes to files owned by the root user.

At the end of the event, you shouldn't keep these configuration changes. You can run another command to remove all the configuration that the first command added.

At a command line:

```bash
bash <(curl https://holochain.github.io/holochain/configure-cache.sh) cleanup
```
