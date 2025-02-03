---
title: "Validation"
---

::: topic-list
### In this section {data-no-toc}

* Validation (this page)
    * [`genesis_self_check` Callback](/build/genesis-self-check-callback/) --- writing a function to control access to a network
    * [`validate` Callback](/build/validate-callback/) --- basic callback, examples using stub functions
    * [DHT operations](/build/dht-operations/) --- further details on the underlying data structure used in DHT replication and validation
:::

::: intro
Validation gives shape to your [DNA](/build/dnas/)'s data model. It defines the 'rules of the game' for a network --- who can create, modify, or delete data, and what that data should and shouldn't look like. It's also the basis for Holochain's peer-auditing security model.
:::

You implement your validation logic in your application's [integrity zomes](/build/zomes/#integrity). While [entry and link types](/build/working-with-data/) enumerate the kinds of data the integrity zome defines, the data is just bytes until your validation logic gives it some shape and purpose.

A DNA uses validation logic in two ways:

1. By an author of data, to protect them from publishing invalid data, and
2. By an agent that's received data to store and serve, to equip them to detect invalid data and take action against the author.

Because every peer has the DNA's validation logic on their own machine and is expected to check the data they author before they publish it, it can be assumed that invalid data is (almost) always an intentionally malicious act.

!!! info
Currently Holochain can inform agents about invalid data when asked. In the future it'll also take automatic defensive action by putting a malicious author into an agent's network block list when they see evidence of invalid data.
!!!

There are two callbacks that implement validation logic:

* `validate` is the core of the zome's validation logic. It receives a **DHT operation** and returns a success/failure/indeterminate result.
* [`genesis_self_check`](/build/genesis-self-check-callback/) 'prevalidates' an agent's [**membrane proof**](/concepts/3_source_chain/#source-chain-your-own-data-store) before trying to connect to peers in the network.

## DHT operations

A DHT operation is what an agent receives when they're being asked to store and serve a piece of data. It's a request for an agent to transform [their slice of the DHT](/concepts/4_dht/#finding-peers-and-data-in-a-distributed-database) into a new state. That's why it's used in the `validate` callback: if an agent is going to change their state at someone else's request, they need to know that the new state is correct.

An [action](/build/working-with-data/#entries-actions-and-records-primary-data) on an agent's [source chain](/concepts/3_source_chain/) yields multiple DHT operations, each of which goes to an [**authority**](/resources/glossary/#validation-authority) for that operation's [**basis address**](/resources/glossary/#basis-address) (a DHT address that the authority is responsible for).

Here are all the DHT operations produced for all the actions:

* All actions
    * [`RegisterAgentActivity`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.RegisterAgentActivity)
        * Basis address: author's public key
        * Contents: action (and optionally entry, if applicable)
        * Effect: Store the action. Because one agent's actions will all go to the same set of authorities, their job is to check for [source chain forks](/resources/glossary/#fork-source-chain), which is a system-level rule that you don't have to implement.
    * [`StoreRecord`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.StoreRecord)
        * Basis address: action hash
        * Contents: action (and optionally entry, if applicable)
        * Effect: Store the action, along with any entry data.
* [`Create`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.Create)
    * [`StoreEntry`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.StoreEntry)
        * Basis address: entry hash
        * Contents: entry and action that wrote it
        * Effect: Store the entry, if an identical entry hasn't been created yet, and add the action to the the list of actions associated with its creation. An entry can be created by multiple authors, and each creation action paired with its entry [can be treated as an independent piece of data](/build/entries/#entries-and-actions). **This operation isn't produced for private entries.**
* [`Update`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.Update)
    * `StoreEntry` (see above)
    * [`RegisterUpdate`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.RegisterUpdate)
        * Basis addresses: entry and action hashes of the _old_ entry being updated
        * Contents: action and entry
        * Effect: Mark an entry creation action as being replaced by a new one, pointing the the entry and action that replace it. **An entry and its creation action can have multiple actions updating them.**
* [`Delete`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.Delete)
    * [`RegisterDelete`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.RegisterDelete)
        * Basis addresses: entry and action hashes of the entry being deleted
        * Contents: action
        * Effect: Mark an entry creation action as deleted, without removing the actual data. Because an entry can be created by multiple creation actions, the entry itself isn't marked as deleted until a `RegisterDelete` has been integrated for _all_ of its creation actions.
* [`CreateLink`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.CreateLink)
    * [`RegisterCreateLink`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.RegisterCreateLink)
        * Basis address: link's [base address](/build/links-paths-and-anchors/#define-a-link-type)
        * Contents: action
        * Effect: Add a link to the list of links pointing from the base to other locations
* [`DeleteLink`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.DeleteLink)
    * [`RegisterDeleteLink`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.RegisterCreateLink)
        * Basis addresses: old link's [base address](/build/links-paths-and-anchors/#define-a-link-type) and action hash
        * Contents: action
        * Effect: Mark a link as deleted, without removing the actual data.

### Choosing who should validate what

In practice, it's usually okay to access the action and entry data from an operation, and have all authorities validate that data. However, if your validation logic is highly complex and computationally costly, it can sometimes be useful to choose different validation tasks for the different DHT operations produced by an action. For instance, a `RegisterAgentActivity` authority may not need to validate entry data; it could just focus on the action in the context of the entire source chain.