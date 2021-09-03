# 11. Migration: Updating A Network To a New Set of Rules

!!! note
    This page describes an unimplemented feature.

<div class="coreconcepts-intro" markdown=1>
Holochain lets users **migrate** from one DNA to a new one without central coordination, permitting seamless application updates in peer-to-peer networks.
</div>

<div class="coreconcepts-orientation" markdown=1>
### What you'll learn

1. [How upgrades are handled in cloud and blockchain](#the-migration-landscape-cloud-and-blockchain)
2. [How they're handled in Holochain](#migration-in-holochain)

### Why it matters

Software is always changing. Stakeholders request new features, and bugs are a fact of life. While cloud-based deployments offer clean, global software upgrades supported by migration routines in popular software frameworks, distributed ledger frameworks are more brittle, sometimes forcing developers to choose between a ['hard fork'](https://www.investopedia.com/terms/h/hard-fork.asp) of the underlying network or compromising user autonomy by retiring existing code for all users. Holochain strives for a balance, offering the simplicity of built-in migration routines while leaving users free to make their own choices.
</div>

## The migration landscape: cloud and blockchain

It's fair to assume that you won't get it right the first time. Even with the best development practices, bugs sometimes get deployed. It's not enough to talk about prevention; you also need to think about how to recover from a bug.

### Cloud

Cloud software has been around forever, and because of this it has some well-established practices around migration. In one sense you have it easy: there's only one copy of the software to upgrade (although that copy may need to be ugprade on multiple identical servers), and popular software frameworks have built-in tools to help you upgrade your database and its data in-place. If you're really skilled, you can deploy gradually, testing with a small subset of users before rolling out a full update.

What cloud doesn't offer is the ability to let users choose their own path. Everybody gets the updates, like it or not. This creates anger, frustration, and even lost users. You can commit to hosting multiple versions, but that can get complicated and expensive.

### Blockchain

Ethereum, the first properly programmable blockchain, has a reputation when it comes to software bugs. Early in its history, the famous [DAO attack](https://vessenes.com/deconstructing-thedao-attack-a-brief-code-tour/), which exploited bugs in a [smart contract](https://en.wikipedia.org/wiki/Smart_contract) to steal almost $50 million USD, exposed the consequences of immutable code in an immutable ledger. The maintainers of Ethereum and theDAO were faced with a difficult decision: honor the spirit of code-as-law and let things remain as they were, or fork the Ethereum blockchain to recover the funds.

Eventually they decided to fork, creating two alternate versions of Ethereum, one of which returned the stolen funds to the original owners. The majority of Ethereum participants supported the forked version. This exposed the desire for human governance, calling into question the philosophy that code should be treated as law.

Since then, smart contract developers have been careful to write their code to allow their contract to be terminated and replaced by a new one. However, this infringes on user choice, as it gives developers the power to force upgrades just as with cloud software.

## Migration in Holochain

Recognising that software will need to be upgraded, but wanting to leave users free to choose which upgrades they adopt, Holochain attempts to make upgrades safe and easy. And because each application lives in its own isolated network and each user controls their own source chain, people can choose to remain or upgrade with a minimum of disruption to unrelated data.

### Closing down the old cell

As a developer, you can create a zome function that allows an agent to write a **close chain** action to their source chain. This lets them signal to others that they've migrated to another DNA. Once this action has been written, the cell can keep running if it likes (perhaps in order to provide historical data to the new cell), but any attempts to commit a new entry will result in a [validation](../7_validation/) failure.

### Starting up the new cell

On the other side of the migration, the conductor will add an **open chain** action to the agent's new source chain. The **init callback** in particular will then be run when the new cell is started, and can test for the presence of this element and try to connect so it has the opportunity to check for the open chain action and take steps to create a connection to the old cell. The application can choose to let the old cell continue to run in order to access its data, or import the old data into the new cell's source chain and shut the old cell down.

## How to migrate well

Because close chain and open chain actions are just source chain elements, you can write validation callbacks for them to permit or deny upgrades. This lets you create your own governance strategies appropriate to your app. We'd love to see governance strategies that follow the spirit of Holochain, allowing people to make their own choices, but we understand that some situations call for tighter control. And note that these governance choices must be baked into the first DNA, so it's important to design these migration routines and validation functions with as much flexibility as possible.

Keep in mind, too, that not everybody will migrate at once. Highly connected data --- data with a lot of dependencies on DHT data from other agents' source chains --- might not be easy to migrate to a new source chain. In cases like these, an agent might be waiting for a long time to have the freshly imported elements on their new source chain validated, which might prevent them from using the app. Therefore it might be better to leave the old cell running in order to access its legacy data, rather than trying to import it.

## Key takeaways

* DNA migrations are marked on agents' source chains with close chain and open chain actions.
* The close chain action is written to an agent's chain in a zome function and signifies that an agent has stopped using the DNA and points peers to the new DNA they're using.
* The open chain action is written to an agent's chain by the conductor and signifies that an agent has migrated from another DNA to this one.
* The init callback lets an agent make a connection to the previous cell to access its information.
* Not all agents will migrate at the same time.
* The application can leave the agent's old cell running, especially if its source chain contains highly connected data that's difficult to migrate without breaking connections to data on other agents' source chains that doesn't exist yet on the new DHT.
* Migration can be controlled by governance rules (zome functions and validation callbacks), which need to be baked in at the beginning and ought to be flexible enough to anticipate developers' and users' future desires.