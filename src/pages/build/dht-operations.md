---
title: "DHT operations"
---

::: intro
An agent receives **DHT operations**, which are requests for them to transform [their slice of the DHT](/concepts/4_dht/#finding-peers-and-data-in-a-distributed-database) in some way. A DHT operation must be validated before it's applied. For this reason it's the input parameter to the [`validate` callback](/build/validate-callback/).

:::

!!! info Validating actions instead of DHT operations
**This is an advanced topic.** Writing validation rules that checks DHT operations requires understanding Holochain's data model. Until you have a reason to write validation rules at this level of granularity, we recommend letting the [scaffolding tool](/get-started/3-forum-app-tutorial/) generate a `validate` callback for you, which calls out to [stub functions](/build/validate-callback/#create-boilerplate-code-with-the-scaffolding-tool) that validate the _actions_ that create, update, or delete your application's entry and link types, and makes opinionated but sensible choices about which groups of authorities should validate what portions of the op data. The following information is presented for people who have a specific need to further reduce overall validation overhead across the network.
!!!

## What is a DHT operation?

When an agent writes an action, its data gets added to the shared database by being transformed into DHT operations which are sent to various peers in the network. Each operation represents a request to add the action data in a

## Choosing who should validate what

In practice, it's usually okay to have all groups of authorities validate all the data in an action. Every DHT operation contains, or at least points to, all of the data in an action. However, if your validation logic is computationally costly, you may want to choose different validation tasks for different operations, because _DHT agents don't choose what types of operation they validate_. They simply assume authority for a range of basis addresses, and are expected to process whatever operations they receive for addresses in that range, so it's good to be respectful of their compute resources.

As an example, you may choose to split up validation between `StoreRecord` and `StoreEntry` operations for a given entry creation action; the former could check the agent's write privileges while the latter could check the structure of the entry data or the existence of the data it references.

## How actions translate to DHT operations

An [action](/build/working-with-data/#entries-actions-and-records-primary-data) on an agent's [source chain](/concepts/3_source_chain/) yields multiple DHT operations, each of which goes to an [**authority**](/resources/glossary/#validation-authority) for that operation's [**basis address**](/resources/glossary/#basis-address) (a DHT address that the authority is responsible for).

Here are all the DHT operations produced for all the actions, along with their contents and the effect of applying them after validation.

* All actions
    * [`RegisterAgentActivity`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.RegisterAgentActivity)
        * Basis address: author's public key
        * Contents: action
        * System validation: Check for non-monotonic sequence indices and timestamps in adjacent actions, and detect [source chain forks](/resources/glossary/#fork-source-chain).
        * Effect: Append the action to a replica of the author's source chain.
    * [`StoreRecord`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.StoreRecord)
        * Basis address: action hash
        * Contents: action (and optionally entry, if applicable) <!--TODO: system validation? -->
        * Effect: Store the action, along with any entry data.
* [`Create`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.Create)
    * [`StoreEntry`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.StoreEntry)
        * Basis address: entry hash
        * Contents: entry, and the action that wrote it
        * System validation: Check that the action's entry hash matches the entry hash.
        * Effect: Store the entry, if an identical entry hasn't been created yet, and add the action to the the list of actions associated with its creation. An entry can be created by multiple authors, and each creation action paired with its entry [can be treated as an independent piece of data](/build/entries/#entries-and-actions). **This operation isn't produced for private entries.**
* [`Update`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.Update)
    * `StoreEntry` (see above)
    * [`RegisterUpdate`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.RegisterUpdate)
        * Basis addresses: entry and action hashes of the _old_ entry being updated
        * Contents: action and entry <!--TODO: system validation? -->
        * Effect: Mark an entry creation action as being replaced by a new one, pointing the the entry and action that replace it. **An entry and its creation action can have multiple actions updating them.**
* [`Delete`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.Delete)
    * [`RegisterDelete`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.RegisterDelete)
        * Basis addresses: entry and action hashes of the entry being deleted
        * Contents: action <!--TODO: system validation? -->
        * Effect: Mark an entry creation action as deleted, without removing the actual data. Because an entry can be created by multiple creation actions, the entry itself isn't marked as deleted until a `RegisterDelete` has been integrated for _all_ of its creation actions.
* [`CreateLink`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.CreateLink)
    * [`RegisterCreateLink`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.RegisterCreateLink)
        * Basis address: link's [base address](/build/links-paths-and-anchors/#define-a-link-type)
        * Contents: action <!--TODO: system validation? -->
        * Effect: Add a link to the list of links pointing from the base to other locations
* [`DeleteLink`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.DeleteLink)
    * [`RegisterDeleteLink`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html#variant.RegisterCreateLink)
        * Basis addresses: old link's [base address](/build/links-paths-and-anchors/#define-a-link-type) and action hash
        * Contents: action <!--TODO: system validation? -->
        * Effect: Mark a link as deleted, without removing the actual data.