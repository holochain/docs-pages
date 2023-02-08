---
title: Get Building
---

In Quick Start you installed Holochain and built a templated forum application. Here you will use the Scaffold tool to build your own application and learn the basic commands for using the scaffold.

### Pre-requisite
- Holochain installed as per [Quick Start](../quick-start/index)

## Scaffold a Custom Holochain Application

Type the following into your terminal window:

```bash
nix-shell https://holochain.love --run "hc scaffold web-app"
```
You'll be asked for a hApp name. Type in a name using snake_casing, e. g. my_example_happ. 

Select the front-end option you prefer.

Set up the Holonix development environment. You will be left with a set of instructions.
