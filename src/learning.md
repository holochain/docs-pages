---
hide:
  - toc
---
## The content on this page is not maintained and the resources have not been updated work with the latest Holochain releases.

## Holochain Learning Resources

There's a Playground available to visually explore Holochain's inner workings. Further there's a series of hands-on tutorials to understand and practice core concepts of Holochain, called the Holochain Gym.

### Playground

The playground provides a visual representation of Holochain's data structures. All kinds of entries and their relationships can be inspected. It comes in two flavors:

#### Simulated

At <https://holochain-playground.github.io> you can access a simulation of a Holochain application,
investigate all aspects of stored data and propagation, and configure the views of the simulation according to your interest.

![](../img/playground-simulator.jpg)

#### Connected

With this version, you can connect a playground application to your Holochain app. Running your hApp and then executing the playground at the same time will give you insight into every piece of data of your hApp.

Every hApp that was created with the [scaffolding tool](../happ-setup/#scaffolding-a-new-happ) comes with a preconfigured playground. When starting the hApp, the playground will automatically connect to the hApp's instance of Holochain.

Adding a playground to other hApps is a breeze too. Just install the NPM package `@holochain-playground/cli` and follow the instructions on the [package's homepage](https://www.npmjs.com/package/@holochain-playground/cli/v/0.0.4).

### Holochain Gym

The Holochain Gym is a practical approach to learning Holochain's concepts. In a series of tutorials, those concepts are briefly explained and then you're encouraged to solve an exercise to practice them. The Gym makes massive usage of the Playground to illustrate concepts and see how the examples play out. A repository with source code templates as well as solutions accompanies the tutorial.

Check it out at <https://holochain-gym.github.io>.

![](../img/holochain-gym.jpg)
