---
title: "DHT operations"
---

::: intro
A DHT operation is what an agent receives when they're being asked to store and serve a piece of data. It's a request for an agent to transform [their slice of the DHT](/concepts/4_dht/#finding-peers-and-data-in-a-distributed-database) into a new state. For this reason it's the input parameter to the [`validate` callback](/build/validate-callback/): if an agent is going to change their state at someone else's request, they need to know that the new state is correct.

:::

!!! info Validating actions instead of DHT operations
In general, it's quite complex to validate your data using DHT operations, so we recommend letting the [scaffolding tool](/get-started/3-forum-app-tutorial/) generate a `validate` callback for you, which calls out to [stub functions](/build/validate-callback/#create-boilerplate-code-with-the-scaffolding-tool) that validate the _actions_ that create, update, or delete your application's entry and link types rather than the _operations_ that communicate those actions, and makes opinionated but sensible choices about which groups of authorities should validate what portion of the op data. The following information is presented for people who have a specific need to further reduce overall validation overhead across the network.
!!!

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

In practice, it's usually okay to have all groups of authorities validate all the data in an action. However, if your validation logic is highly complex and computationally costly, it can sometimes be useful to choose different validation tasks for the different DHT operations. For instance, a `RegisterAgentActivity` authority may not need to validate entry data; it could just focus on the action in the context of the entire source chain. Or a `StoreEntry` authority could focus on entry contents and leave checking of create or update privileges to `StoreRecord` authorities.