---
title: "Entries"
---

::: intro
An **entry** is a blob of bytes that your application code gives meaning and structure to via serialization, deserialization, and validation.
:::

## Entries and actions

An entry is always paired with an **entry creation action** that tells you who authored it and when it was authored. Because of this, you don't usually need to include author and timestamp fields in your entries. There are two kinds of entry creation action:

* `Create`, which creates a new piece of data in either the user's private database or the application's shared database, and
* `Update`, which does the same as `Create` but also takes an existing piece of data and marks it as updated.

The pairing of an entry and the action that created it is called a **record**, which is the basic unit of data in a Holochain application.

## Define an entry type

Each entry has a **type**, which your application code uses to make sense of the entry's bytes. Our [HDI library](https://docs.rs/hdi/latest/hdi/) gives you macros to automatically define, serialize, and deserialize entry types to and from any Rust struct or enum that [`serde`](https://docs.rs/serde/latest/serde/) can handle.

Entry types are defined in an [**integrity zome**](/resources/glossary/#integrity-zome). To define an [`EntryType`](https://docs.rs/hdi/latest/hdi/prelude/enum.EntryType.html), use the [`hdi::prelude::hdk_entry_helper`](https://docs.rs/hdi/latest/hdi/prelude/attr.hdk_entry_helper.html) macro on your Rust type:

```rust
use hdi::prelude::*;

#[hdk_entry_helper]
pub struct Movie {
  title: String,
  director: String,
  imdb_id: Option<String>,
  release_date: Timestamp,
  box_office_revenue: u128,
}
```

This implements a host of [`TryFrom` conversions](https://docs.rs/hdi/latest/src/hdi/entry.rs.html#120-209) that your type is expected to implement, along with serialization and deserialization functions.

In order to dispatch validation to the proper integrity zome, Holochain needs to know about all the entry types that your integrity zome defines. This is done by implementing a callback in your zome called `entry_defs`, but it's easier to use the [`hdi::prelude::hdk_entry_defs`](https://docs.rs/hdi/latest/hdi/prelude/attr.hdk_entry_defs.html) macro on an enum of all the entry types:

```rust
use hdi::prelude::*;

#[hdk_entry_defs]
enum EntryTypes {
  Movie(Movie),
  // other types...
}
```

### Configuring an entry type

Each variant in the enum should hold the Rust type that corresponds to it, and is implicitly marked with an `entry_def` proc macro which, if you specify it explicitly, lets you configure the given entry type further:

* An entry type can be configured as **private**, which means that it's never published to the DHT, but exists only on the author's source chain. To do this, use the `visibility = "private"` argument.
* A public entry type can be configured to expect a certain number of **required validations**, which is the number of [validation receipts](/resources/glossary/#validation-receipt) that an author tries to collect from authorities before they consider their entry published on the DHT. To do this, use the `required_validations = <num>` argument.

```rust
use hdi::prelude::*;

#[hdk_entry_defs]
enum EntryTypes {
    #[entry_def(required_validations = 7, )]
    Movie(Movie),

    // You can reuse your Rust type in another entry type if you like. In this
    // example, `HomeMovie` also (de)serializes to/from the `Movie` struct, but
    // is actually a different entry type with different visibility, and can be
    // subjected to different validation rules.
    #[entry_def(visibility = "private", )]
    HomeMovie(Movie),
}
```

This also gives you an enum that you can use later when you're storing app data. This is important because, under the hood, an entry type consists of two bytes -- an integrity zome index and an entry def index. These are required whenever you want to write an entry. Instead of having to remember those values every time you store something, your coordinator zome can just import and use this enum, which already knows how to convert each entry type to the right IDs.

## Create an entry

Most of the time you'll want to define your create, read, update, and delete (CRUD) functions in a [**coordinator zome**](/resources/glossary/#coordinator-zome) rather than the integrity zome that defines it. This is because a coordinator zome is easier to update in the wild than an integrity zome.

Create an entry by calling [`hdk::prelude::create_entry`](https://docs.rs/hdk/latest/hdk/prelude/fn.create_entry.html). If you used `hdk_entry_helper` and `hdk_entry_defs` macro in your integrity zome (see [Define an entry type](#define-an-entry-type)), you can use the entry types enum you defined, and the entry will be serialized and have the correct integrity zome and entry type indexes added to it.

```rust
use hdk::prelude::*;
use chrono::Date;
// Import the entry types and the enum defined in the integrity zome.
use movie_integrity::*;

let movie = Movie {
  title: "The Good, the Bad, and the Ugly",
  director: "Sergio Leone"
  imdb_id: Some("tt0060196"),
  release_date: Timestamp::from(Date::Utc("1966-12-23")),
  box_office_revenue: 389_000_000,
};

let create_action_hash: ActionHash = create_entry(
    // The value you pass to `create_entry` needs a lot of traits to tell
    // Holochain which entry type from which integrity zome you're trying to
    // create. The `hdk_entry_defs` macro will have set this up for you, so all
    // you need to do is wrap your movie in the corresponding enum variant.
    &EntryTypes::Movie(movie.clone()),
)?;
```

### Create under the hood

When the client calls a zome function that calls `create_entry`, Holochain does the following:

1. Prepare a **scratch space** for making an atomic set of changes to the source chain for the agent's cell.
2. Build an entry creation action called [`Create`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.Create.html) that includes:
    * the author's public key,
    * a timestamp,
    * the action's sequence in the source chain and the previous action's hash,
    * the entry type (integrity zome index and entry type index), and
    * the hash of the serialized entry data.
    <!-- * a calculated weight value for rate limiting -->
3. Write the `Create` action and the serialized entry data to the scratch space.
4. Return the `ActionHash` of the `Create` action to the calling zome function. (At this point, the action hasn't been persisted to the source chain.)
5. Wait for the zome function to complete.
6. Convert the action to DHT operations.
7. Run the validation callback for all DHT operations.
    * If successful, continue.
    * If unsuccessful, return the validation error to the client instead of the zome function's return value.
8. Compare the scratch space against the actual state of the source chain.
    * If the source chain has diverged from the scratch space, and the write specified strict chain top ordering, the scratch space is discarded and a `HeadMoved` error is returned to the caller.
    * If the source chain has diverged and the write specified relaxed chain top ordering, the data in the scratch space is 'rebased' on top of the new source chain state as it's being written.
    * If the source chain has not diverged, the data in the scratch space is written to the source chain state.
9. Return the zome function's return value to the client.
10. In the background, publish all newly created DHT operations to their respective authority agents.

## Update an entry

Update an entry creation action by calling [`hdk::prelude::update_entry`](https://docs.rs/hdk/latest/hdk/prelude/fn.update_entry.html) with the old action hash and the new entry data:

```rust
use hdk::prelude::*;
use chrono::Date;
use movie_integrity::*;

let movie2 = Movie {
  title: "The Good, the Bad, and the Ugly",
  director: "Sergio Leone"
  imdb_id: Some("tt0060196"),
  release_date: Timestamp::from(Date::Utc("1966-12-23")),
  box_office_revenue: 400_000_000,
};

let update_action_hash: ActionHash = update_entry(
    create_action_hash,
    &EntryTypes::Movie(movie2.clone()),
)?;
```

An [`Update` action](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.Update.html) operates on an entry creation action (either a `Create` or an `Update`), not just an entry by itself. It also doesn't remove the original data from the DHT; instead, it gets attached to both the original entry and its entry creation action. As an entry creation action itself, it references the hash of the new entry so it can be retrieved from the DHT.

### Update under the hood

Calling `update_entry` does the following:

1. Prepare a **scratch space** for making an atomic set of changes to the source chain for the agent's cell.
2. Build an `Update` action that contains everything in a `Create` action, plus:
    * the hash of the original action and
    * the hash of the original action's serialized entry data.
    (Note that the entry type is automatically retrieved from the original action.)
3. Write an `Update` action to the scratch space.
4. Return the `ActionHash` of the `Update` action to the calling zome function. (At this point, the action hasn't been persisted to the source chain.)
5. Wait for the zome function to complete.
6. Convert the action to DHT operations.
7. Run the validation callback for all DHT operations.
    * If successful, continue.
    * If unsuccessful, return the validation error to the client instead of the zome function's return value.
8. Compare the scratch space against the actual state of the source chain.
    * If the source chain has diverged from the scratch space, and the write specified strict chain top ordering, the scratch space is discarded and a `HeadMoved` error is returned to the caller.
    * If the source chain has diverged and the write specified relaxed chain top ordering, the data in the scratch space is 'rebased' on top of the new source chain state as it's being written.
    * If the source chain has not diverged, the data in the scratch space is written to the source chain state.
9. Return the zome function's return value to the client.
10. In the background, publish all newly created DHT operations to their respective authority agents.

### Update patterns

Holochain gives you this `update_entry` function, but is somewhat unopinionated about how it's used. While in most cases you'll want to interpret it as applying to the original _record_ (action + entry), there are cases where you might want to interpret it as applying to the original _entry_, because the `Update` action is merely a piece of metadata attached to both, and can be retrieved along with the original data using [`hdk::prelude::get_details`](https://docs.rs/hdk/latest/hdk/prelude/fn.get_details.html) (see [below](#all-data-actions-and-links-at-an-address)).

You can also choose what record updates should be attached to. You can structure them as a 'list', where all updates refer to the `ActionHash` of the original `Create` action.

<!-- TODO: Replace the SVG with Mermaid once we've got build-time Mermaid rendering working.
https://mermaid.live/edit#pako:eNptz8tuwjAQBdBfse46RONH7OBFpQL9grabYhYWcQuCPOQmUmmUf6-JlFXZzcwZXc2MOLZVgMVX9N2JvW1cw9hm_95Vvg-MH9hq9cSe99sYUn-443ZB8QB3C8oH-LKg-ofIUIdY-3OVThnvyw79KdTBwaay8vHi4Jop7fmhb19vzRG2j0PIMMyZu7NPH9Swn_76naadb2BH_MAKWueapORGaDJKiAw3WG6KvBCGqKRCa0VaTBl-2zYlUG5kyUlxaUirtSzVHPcx4xw__QHCaVxb
-->
<svg aria-roledescription="flowchart-v2" role="graphics-document document" viewBox="-8 -8 485.5999755859375 144" style="max-width: 100%;" xmlns="http://www.w3.org/2000/svg" width="100%" class="mermaid-flowchart" height="100%"><g><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="6" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-pointEnd"><path style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 0 0 L 10 5 L 0 10 z"></path></marker><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="4.5" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-pointStart"><path style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 0 5 L 10 10 L 10 0 z"></path></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="11" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-circleEnd"><circle style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" r="5" cy="5" cx="5"></circle></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="-1" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-circleStart"><circle style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" r="5" cy="5" cx="5"></circle></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="12" viewBox="0 0 11 11" class="marker cross flowchart" id="graph-div_flowchart-crossEnd"><path style="stroke-width: 2px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"></path></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="-1" viewBox="0 0 11 11" class="marker cross flowchart" id="graph-div_flowchart-crossStart"><path style="stroke-width: 2px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"></path></marker><g class="root"><g class="clusters"></g><g class="edgePaths"><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-B LE-A" id="L-B-A-0" d="M39.95,39L39.95,43.167C39.95,47.333,39.95,55.667,66.314,65.854C92.678,76.042,145.405,88.084,171.769,94.105L198.133,100.126"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-C LE-A" id="L-C-A-0" d="M169.85,39L169.85,43.167C169.85,47.333,169.85,55.667,175.203,63.501C180.556,71.335,191.261,78.67,196.614,82.337L201.967,86.004"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-D LE-A" id="L-D-A-0" d="M299.75,39L299.75,43.167C299.75,47.333,299.75,55.667,294.397,63.501C289.044,71.335,278.339,78.67,272.986,82.337L267.633,86.004"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-E LE-A" id="L-E-A-0" d="M429.65,39L429.65,43.167C429.65,47.333,429.65,55.667,403.286,65.854C376.922,76.042,324.195,88.084,297.831,94.105L271.467,100.126"></path></g><g class="edgeLabels"><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g></g><g class="nodes"><g transform="translate(39.94999694824219, 19.5)" data-id="B" data-node="true" id="flowchart-B-112" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 1</span></div></foreignObject></g></g><g transform="translate(234.79998779296875, 108.5)" data-id="A" data-node="true" id="flowchart-A-113" class="node default default flowchart-label"><rect height="39" width="63" y="-19.5" x="-31.5" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-24, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="48"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Create</span></div></foreignObject></g></g><g transform="translate(169.84999084472656, 19.5)" data-id="C" data-node="true" id="flowchart-C-114" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 2</span></div></foreignObject></g></g><g transform="translate(299.74998474121094, 19.5)" data-id="D" data-node="true" id="flowchart-D-116" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 3</span></div></foreignObject></g></g><g transform="translate(429.6499786376953, 19.5)" data-id="E" data-node="true" id="flowchart-E-118" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 4</span></div></foreignObject></g></g></g></g></g></svg>

Or you can structure your updates as a 'chain', where each update refers to the `ActionHash` of the previous entry creation action (either an `Update` or the original `Create`).

<!-- TODO: This one too.
https://mermaid.live/edit#pako:eNpVkE1rwzAMhv-K0TkNiu3YqQ-Dfuy2XTZ2Wd2Dqd010HzgObAu5L_PSQhkN716HoSkHi6NdaDgy5v2Rt5edE3I_vTRWhMcyc5ks3kiu9PBu5jPIzwskM5wJY_4uEQ245U-4ucl8hmvdF1DApXzlSltXKgfdQ3h5iqnQcXSuqvp7kGDroeomi4074_6Air4ziXQTYOOpYmnVKCu5v4du62pP5vmXwbVww8oittUIGOZpAIlpzSBB6hM5mlOJWKBuRAcBR0S-J0mYCpZkSHPmETBt6zgCThbhsa_zj-cXjn8ARjZZWQ
-->
<svg aria-roledescription="flowchart-v2" role="graphics-document document" viewBox="-8 -8 598.5999755859375 55" style="max-width: 100%;" xmlns="http://www.w3.org/2000/svg" width="100%" class="mermaid-flowchart" height="100%"><g><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="6" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-pointEnd"><path style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 0 0 L 10 5 L 0 10 z"></path></marker><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="4.5" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-pointStart"><path style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 0 5 L 10 10 L 10 0 z"></path></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="11" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-circleEnd"><circle style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" r="5" cy="5" cx="5"></circle></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="-1" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-circleStart"><circle style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" r="5" cy="5" cx="5"></circle></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="12" viewBox="0 0 11 11" class="marker cross flowchart" id="graph-div_flowchart-crossEnd"><path style="stroke-width: 2px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"></path></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="-1" viewBox="0 0 11 11" class="marker cross flowchart" id="graph-div_flowchart-crossStart"><path style="stroke-width: 2px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"></path></marker><g class="root"><g class="clusters"></g><g class="edgePaths"><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-B LE-A" id="L-B-A-0" d="M113,19.5L108.833,19.5C104.667,19.5,96.333,19.5,88.883,19.5C81.433,19.5,74.867,19.5,71.583,19.5L68.3,19.5"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-C LE-B" id="L-C-B-0" d="M242.9,19.5L238.733,19.5C234.567,19.5,226.233,19.5,218.783,19.5C211.333,19.5,204.767,19.5,201.483,19.5L198.2,19.5"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-D LE-C" id="L-D-C-0" d="M372.8,19.5L368.633,19.5C364.467,19.5,356.133,19.5,348.683,19.5C341.233,19.5,334.667,19.5,331.383,19.5L328.1,19.5"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-E LE-D" id="L-E-D-0" d="M502.7,19.5L498.533,19.5C494.367,19.5,486.033,19.5,478.583,19.5C471.133,19.5,464.567,19.5,461.283,19.5L458,19.5"></path></g><g class="edgeLabels"><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g></g><g class="nodes"><g transform="translate(152.9499969482422, 19.5)" data-id="B" data-node="true" id="flowchart-B-352" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 1</span></div></foreignObject></g></g><g transform="translate(31.5, 19.5)" data-id="A" data-node="true" id="flowchart-A-353" class="node default default flowchart-label"><rect height="39" width="63" y="-19.5" x="-31.5" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-24, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="48"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Create</span></div></foreignObject></g></g><g transform="translate(282.84999084472656, 19.5)" data-id="C" data-node="true" id="flowchart-C-354" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 2</span></div></foreignObject></g></g><g transform="translate(412.74998474121094, 19.5)" data-id="D" data-node="true" id="flowchart-D-356" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 3</span></div></foreignObject></g></g><g transform="translate(542.6499786376953, 19.5)" data-id="E" data-node="true" id="flowchart-E-358" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 4</span></div></foreignObject></g></g></g></g></g></svg>

If you structure your updates as a chain, you may want to also create links from the `ActionHash` of the original `Create` to each update in the chain, making it a hybrid of a list and a chain. This trades additional storage space for reduced lookup time.

### Resolving update conflicts

It's up to you to decide whether two updates on the same entry or action are a conflict. If your use case allows branching edits similar to Git, then conflicts aren't an issue.

But if your use case needs a single canonical version of a resource, you'll need to decide on a conflict resolution strategy to use at retrieval time.

If only the original author is permitted to update the entry, choosing the latest update is simple. Just choose the `Update` action with the most recent timestamp, which is guaranteed to [advance monotonically](/resources/glossary/#monotonicity) for any honest agent's source chain. But if multiple agents are permitted to update an entry, it gets more complicated. Two agents could make an update at exactly the same time (or their action timestamps might be wrong or falsified). So, how do you decide which is the 'latest' update?

These are two common patterns:

* Use an opinionated, deterministic definition of 'latest' that can be calculated from the content of the update regardless of the writer.
* Model your updates with a data structure that can automatically merge simultaneous updates, such as a [conflict-free replicated data type (CRDT)](https://crdt.tech/).

## Delete an entry

Delete an entry creation action by calling [`hdk::prelude::delete_entry`](https://docs.rs/hdk/latest/hdk/prelude/fn.delete_entry.html).

```rust
use hdk::prelude::*;

let delete_action_hash: ActionHash = delete_entry(
    create_action_hash,
)?;
```

As with an update, this does _not_ actually remove data from the source chain or the DHT. Instead, a [`Delete` action](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.Delete.html) is authored, which attaches to the entry creation action and marks it as 'dead'. An entry itself is only considered dead when all entry creation actions that created it are marked dead, and it can become live again in the future if a _new_ entry creation action writes it. Dead data can still be retrieved with [`hdk::prelude::get_details`](https://docs.rs/hdk/latest/hdk/prelude/fn.get_details.html) (see below).

In the future we plan to include a 'purge' functionality. This will give agents permission to actually erase an entry from their DHT store, but not its associated entry creation action.

Remember that, even once purge is implemented, it is impossible to force another person to delete data once they have seen it. Be deliberate about choosing what data becomes public in your app.

### Delete under the hood

Calling `delete_entry` does the following:

1. Prepare a **scratch space** for making an atomic set of changes to the source chain for the agent's cell.
2. Write a `Delete` action to the scratch space.
3. Return the `ActionHash` of the `Delete` action to the calling zome function. (At this point, the action hasn't been persisted to the source chain.)
4. Wait for the zome function to complete.
5. Convert the action to DHT operations.
6. Run the validation callback for all DHT operations.
    * If successful, continue.
    * If unsuccessful, return the validation error to the client instead of the zome function's return value.
7. Compare the scratch space against the actual state of the source chain.
    * If the source chain has diverged from the scratch space, and the write specified strict chain top ordering, the scratch space is discarded and a `HeadMoved` error is returned to the caller.
    * If the source chain has diverged and the write specified relaxed chain top ordering, the data in the scratch space is 'rebased' on top of the new source chain state as it's being written.
    * If the source chain has not diverged, the data in the scratch space is written to the source chain state.
8. Return the zome function's return value to the client.
9. In the background, publish all newly created DHT operations to their respective authority agents.

## Identifiers on the DHT

Holochain uses the hash of a piece of content as its unique ID. In practice, different kinds of hashes have different meaning and suitability to use as an identifier:

* To identify the _contents_ of an entry, use the entry's `EntryHash`. Remember that, if two entry creation actions write identical entry contents, the entries will collide in the DHT. You may want this or you may not, depending on the nature of your entry type.
* A common pattern to identify an _instance_ of an entry (i.e., an entry authored by a specific agent at a specific time) is to use the `ActionHash` of its entry creation action instead. This gives you timestamp and authorship information for free, and can be a persistent way to identify the initial entry at the root of a tree of updates.
* You can reference an agent via their `AgentPubKey`. This is a special type of DHT entry whose identifier is identical to its content --- that is, the agent's public key. You can use it just like an `EntryHash` and `ActionHash`.
* Finally, you can also use **external identifiers** (that is, IDs of data that's not in the DHT) as long as they're 32 bytes, which is useful for hashes and public keys. It's up to you to determine how to handle these identifiers in your front end.

You can use any of these identifiers as a field in your entry types to model a many-to-one relationship, or you can use links between identifiers to model a one-to-many relationship.

## Retrieve an entry

### By record only

Get a record by calling [`hdk::prelude::get`](https://docs.rs/hdk/latest/hdk/prelude/fn.get.html) with the hash of its entry creation action. The return value is a <code>Result<[holochain_integrity_types::record::Record](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/record/struct.Record.html)></code>.

You can also pass an entry hash to `get`, and the record returned will contain the _oldest live_ entry creation action that wrote it.

```rust
use hdk::prelude::*;
use movie_integrity::*;

let maybe_record: Option<Record> = get(
    action_hash,
    // Get the data and metadata directly from the DHT. You can also specify
    // `GetOptions::content()`, which only accesses the DHT if the data at the
    // supplied hash doesn't already exist locally.
    GetOptions::latest()
)?;

match maybe_record {
    Some(record) => {
        // Not all types of action contain entry data, and if they do, it may
        // not be accessible, so `.entry()` may return nothing. It may also be
        // of an unexpected entry type, so it may not be deserializable to an
        // instance of the expected Rust type. You can find out how to check for
        // most of these edge cases by exploring the documentation for the
        // `Record` type, but in this simple example we'll skip that and assume
        // that the action hash does reference an action with entry data
        // attached to it.
        let maybe_movie: Option<Movie> = record.entry().to_app_option();

        match maybe_movie {
            Some(movie) => debug!(
                "Movie {}, released {}, record stored by {} on {}",
                movie.title,
                movie.release_date,
                record.action().author(),
                record.action().timestamp()
            ),
            None => debug!("Movie entry couldn't be retrieved"),
        }
    }
    None => debug!("Movie record not found"),
}
```

### All data, actions, and links at an address

#### Records

To get a record and all the updates, deletes, and outbound links associated with its action, as well as its current validation status, call [`hdk::prelude::get_details`](https://docs.rs/hdk/latest/hdk/prelude/fn.get_details.html) with an _action hash_. You'll receive a <code>Result<[holochain_zome_types::metadata::RecordDetails](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/metadata/struct.RecordDetails.html)></code>.

```rust
use hdk::prelude::*;
use movie_integrity::*;

let maybe_details: Option<Details> = get_details(
    action_hash,
    GetOptions::latest()
)?;

match maybe_details {
    Some(Details::Record(record_details)) => {
        let maybe_movie: Option<Movie> = record.entry().to_app_option();
        match maybe_movie {
            Some(movie) => debug!(
                "Movie record {}, created on {}, was updated by {} agents and deleted by {} agents",
                movie.title,
                record_details.record.action().timestamp(),
                record_details.updates.len(),
                record_details.deletes.len()
            ),
            None => debug!("Movie entry couldn't be retrieved"),
        }
    }
    _ => debug!("Movie record not found"),
}
```

#### Entries

To get an entry and all the deletes and updates that operated on it (or rather, that operated on the entry creation actions that produced it), _as well as_ all its entry creation actions and its current status on the DHT, pass an _entry hash_ to [`hdk::prelude::get_details`](https://docs.rs/hdk/latest/hdk/prelude/fn.get_details.html). You'll receive a [`holochain_zome_types::metadata::EntryDetails`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/metadata/struct.EntryDetails.html) struct.

```rust
use hdk::prelude::*;
use movie_integrity::*;

let maybe_details: Option<Details> = get_details(
    entry_hash,
    GetOptions::latest()
)?;

match maybe_details {
    Some(Details::Entry(entry_details)) => {
        let maybe_movie: Option<Movie> = entry_details.entry
            .as_app_entry()
            .clone()
            .try_into()
            .ok();
        match maybe_movie {
            Some(movie) => debug!(
                "Movie {} was written by {} agents, updated by {} agents, and deleted by {} agents. Its DHT status is currently {}.",
                movie.title,
                entry_details.actions.len(),
                entry_details.updates.len(),
                entry_details.deletes.len(),
                entry_details.entry_dht_status
            ),
            None => debug!("Movie entry couldn't be retrieved"),
        }
    }
    _ => debug!("Movie entry not found"),
}
```

## Scaffolding an entry type and CRUD API

The Holochain dev tool command `hc scaffold entry-type <entry_type>` generates the code for a simple entry type and a CRUD API. It presents an interface that lets you define a struct and its fields, then asks you to choose whether to implement update and delete functions for it along with the default create and read functions.

## Community CRUD libraries

If the scaffolder doesn't support your desired functionality, or is too low-level, there are some community-maintained libraries that offer opinionated and high-level ways to work with entries. Some of them also offer permissions management.

* [rust-hc-crud-caps](https://github.com/spartan-holochain-counsel/rust-hc-crud-caps)
* [hdk_crud](https://github.com/lightningrodlabs/hdk_crud)
* [hc-cooperative-content](https://github.com/mjbrisebois/hc-cooperative-content)

## Reference

* [hdi::prelude::hdk_entry_helper](https://docs.rs/hdi/latest/hdi/attr.hdk_entry_helper.html)
* [hdi::prelude::hdk_entry_defs](https://docs.rs/hdi/latest/hdi/prelude/attr.hdk_entry_defs.html)
* [hdi::prelude::entry_def](https://docs.rs/hdi/latest/hdi/prelude/entry_def/index.html)
* [hdk::prelude::create_entry](https://docs.rs/hdk/latest/hdk/entry/fn.create_entry.html)
* [hdk::prelude::update_entry](https://docs.rs/hdk/latest/hdk/entry/fn.update_entry.html)
* [hdi::prelude::delete_entry](https://docs.rs/hdk/latest/hdk/entry/fn.delete_entry.html)

## Further reading

* [Core Concepts: CRUD actions](/concepts/6_crud_actions/)
* [CRDT.tech](https://crdt.tech), a resource for learning about conflict-free replicated data types
