---
title: "Migration: Updating A Network To a New Set of Rules"
---

!!! note
    This page describes some incompletely implemented features. While all the text is currently correct, it doesn't represent our full plans for hApp migration.

::: coreconcepts-intro
Holochain offers several tools that help a developer create a **migration** path from one version of a hApp to a newer version. While the implementation details are up to the developer, Holochain itself can record source chain close and open events, update coordinator zomes in place, or bridge to an older version of a DNA.
:::

::: coreconcepts-orientation
### What you'll learn

1. [How upgrades are handled in cloud and blockchain](#the-migration-landscape-cloud-and-blockchain)
2. [How they're handled in Holochain](#migration-in-holochain)

### Why it matters

Software is always changing. Clients and users request new features, and bugs are a fact of life. While cloud-based deployments offer clean, global software upgrades supported by migration routines in popular software frameworks, distributed ledgers are more brittle, sometimes forcing developers to choose a ['hard fork'](https://www.investopedia.com/terms/h/hard-fork.asp) of the underlying network software. Holochain strives for a balance, offering the simplicity of built-in migration routines while leaving users free to make their own choices.
:::

## The migration landscape: cloud and blockchain

It's fair to assume that you won't get it right the first time. Even with the best development practices, bugs get deployed. It's not enough to talk about prevention; you also need to think about how to recover from a bug in the wild. And even when things are working fine, people will ask you for new features or changes to existing data structures. 

### Cloud

With a cloud-based web app, things are generally pretty simple. While it takes care to get right, there's a lot of existing practices and orchestration software out there to stage and test code and database schema changes before they're deployed on a live server. And when that does happen, everybody gets a software update and the system state is updated reasonably consistently across the entire userbase.

That said, not everybody is happy with an update and would rather stay on the old version of your app. In order to keep people happy, some developers choose to support legacy versions of their apps alongside new versions, but that comes with extra maintenance burdens.

### Blockchain

Ethereum, the first properly programmable blockchain, has a reputation when it comes to software bugs. Early in its history, the famous [DAO attack](https://vessenes.com/deconstructing-thedao-attack-a-brief-code-tour/), which exploited bugs in a [smart contract](https://en.wikipedia.org/wiki/Smart_contract) to steal almost $50 million USD, exposed the consequences of immutable code in an immutable ledger. The maintainers of Ethereum and theDAO were faced with a difficult decision: honor the spirit of code-as-law and let things remain as they were, or fork the Ethereum blockchain to recover the funds. Eventually they decided on the latter, creating two parallel histories.

Since then, smart contract developers have been careful to write their code to allow their contract to be terminated and replaced by a new one. However, this infringes on user choice, as it gives developers the power to force upgrades just as with cloud software.

## Migration in Holochain

Recognising that software will need to be upgraded, but wanting to leave users free to choose whether to adopt an upgrade, Holochain attempts to balance developer and user desires.

### Closing down the old cell

As a developer, you can create a zome function that allows an agent to write a **close chain** action to their source chain. This acts as a signpost, showing other participants that the agent has stopped using this cell and has resumed their activities on another cell. Once this action has been written, the cell can keep running if it likes (perhaps in order to provide historical data to the new cell), but any attempts to commit a new entry will result in a [validation](../7_validation/) failure.

### Starting up the new cell

On the other side of the migration, you can add an **open chain** action to the agent's new source chain. This signpost points back to the previous cell to preserve the continuity of the participant's history through upgrades. The **init callback** is a good place to put this entry. It can then be used to find the old cell, either for immediate import into the new source chain or as an archive of historical data.

## How to migrate well

Because a hApp lives on the device of every participant, and because everyone is free to choose to update their copy of the hApp or not, there's no way to enforce a clean, atomic upgrade across the whole network. This requires you to think cleverly about migration strategies.

As described above, migration events are parts of a participant's history, written as open and close chain actions on the old and new source chain. So within one participant's history, there is clear end point and starting point, and these things can be handled atomically. This means those actions can be validated, and source chains can be queried for the presence of those actions.

Armed with this basic tool, you can use a strategy that works best for the nature of the data. Here are a few design choices to think about.

* **Graph data**: Are your DNA's source chains simple, isolated histories without much interaction between each other, or are there many relationships to data produced by other agents (such as countersigned entries)? When not all people migrate at the same time, it can be difficult, if not impossible, to import old data into a new source chain.
* **Access to historical data**: If you can't import an old source chain's data into a new chain, do you need to be able to keep the old cell alive in order to access all of its data, or will a simple 'rollup' of the source chain's final state be enough?
* **Garbage collection**: Do you even need to keep all the old data, or can a migration be considered an opportunity to clean things up?
* **Permitted migrations**: While we think it's more in the spirit of Holochain to allow someone to migrate however they like, even if it's not made by the same developer, we acknowledge that you can write a validation rule on the open/close chain actions that only permits migrations to or from a specific DNA hash. If you want to do something like this, you'll need to set up these rules in the very first iteration of your DNA.
* **Multiple forks and merges**: A group may want to splinter into separate new DHTs, each governed by its own DNA update, and possibly even merge later into yet another DHT. This can be seen as a desirable thing and even designed for, similar to repository forks on GitHub.


## Key takeaways

* DNA migrations are marked on agents' source chains with close chain and open chain actions.
* The close chain action is written to an agent's chain in a zome function and signifies that an agent has stopped using the DNA and points peers to the new DNA they're using.
* The open chain action is written to an agent's chain by the conductor and signifies that an agent has migrated from another DNA to this one.
* The init callback lets an agent make a connection to the previous cell to access its information.
* Not all agents will migrate at the same time.
* The application can leave the agent's old cell running, especially if its source chain contains highly connected data that's difficult to migrate without breaking connections to data on other agents' source chains that doesn't exist yet on the new DHT.
* Migration can be controlled by governance rules (zome functions and validation callbacks), which need to be baked in at the beginning and ought to be flexible enough to anticipate developers' and users' future desires.