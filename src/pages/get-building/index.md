---
title: Get Building
---

## Scaffold Your Custom hApp

In the Quick Start we had you use ther scaffolding tool by using commands that would build a completely templated hApp. This walk through helps you think through and begin using it to create a custom Holochain application of your choosing. In the example here we're building a simple questionnaire and results page so that you come to understand what things can be done in the scaffolding tool and what sorts of things you will need to do in your dev environment.

Let's get started. Type the following into your terminal window:

```bash
nix-shell https://holochain.love --run "hc scaffold web-app"
```
You'll be asked for a hApp name. Type in a name. 

Then you will need to pick the front end you prefer - we're just opting for vanilla js in the screenshots you will see during the tutorial here. 

Following that it will ask if you want to setup a Holonix development environment and you should say yes to that and continue. It will then install and initialise everything and leave you with a set of instructions.


