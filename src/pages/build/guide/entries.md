---
title: "Entries"
tocData:
  - text: Define an entry type
    href: define-an-entry-type
  - text: Create an entry
    href: create-an-entry
    children:
      - text: Create Under-the-hood
        href: create-under-the-hood
  - text: Update an entry
    href: update-an-entry
    children:
      - text: Update under the hood
        href: update-under-the-hood
      - text: Update patterns
        href: update-patterns
      - text: Resolving update conflicts
        href: resolving-update-conflicts
  - text: Delete an entry
    href: delete-an-entry
    children:
      - text: Delete under the hood
        href: delete-under-the-hood
  - text: Identifiers on the DHT
    href: identifiers-on-the-dht
  - text: Retrieve an entry
    href: retrieve-an-entry
  - text: Community CRUD libraries
    href: community-crud-libraries
  - text: Reference
    href: reference
---

An **entry** is structured data that's serialized and written as a blob of bytes to an agent's source chain via an **entry creation action**, which can either be a `Create` or `Update` action. It can be updated or deleted. Although entry data exists as its own entity on a DHT, its associated entry creation action is semantically considered part of it and is stored along with it. This let you distinguish separate writes of the same entry from each other.

## Define an entry type

Each entry has a **type**, which your application code uses to make sense of the entry's bytes. Our [HDI library](https://docs.rs/hdi/latest/hdi/) gives you macros to automatically define, serialize, and deserialize entry types from any Rust struct or enum that [`serde`](https://docs.rs/serde/latest/serde/) can handle.

Entry types are defined in an [**integrity zome**](/resources/glossary/#integrity-zome). To define an `EntryType`, use the [`hdk_entry_helper`](https://docs.rs/hdi/latest/hdi/attr.hdk_entry_helper.html) macro on your Rust type:

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

Each variant in the enum holds the Rust type that defines the shape of the entry, and is implicitly marked with an `entry_def` proc macro which, if you specify it explicitly, lets you configure the given entry type further:

* An entry type can be configured as **private**, which means that it's never published to the DHT, but exists only on the author's source chain. To do this, use the `visibility = "private"` argument.
* A public entry type can be configured to expect a certain number of **required validations**, which is the number of [validation receipts](/resources/glossary/#validation-receipt) that an author tries to collect from authorities before they consider their entry published on the DHT. To do this, use the `required_validations = <num>` argument.
* You can override the name of an entry type, which defaults to the name of the enum variant.

```rust
use hdi::prelude::*;

#[hdk_entry_defs]
enum EntryTypes {
    #[entry_def(name = "moovee", required_validations = 7, )]
    Movie(Movie),

    // You can reuse your Rust type in another entry type if you like. In this
    // example, `HomeMovie` also (de)serializes to/from the `Movie` struct, but
    // is actually a different entry type with different visibility, and can be
    // subjected to different validation rules.
    #[entry_def(visibility = "private", )]
    HomeMovie(Movie),
}
```

This technique doesn't just generate the `entry_defs` callback for you. It also gives you an enum that you can use later when you're storing app data. This is important because, under the hood, an entry type consists of two bytes -- an integrity zome index and an entry def index. These are required whenever you want to write an entry. Instead of having to remember those values every time you store something, your coordinator zome can just import and use this enum, which already knows the right values.

## Create an entry

You can define <abbr title="create, read, update, delete">CRUD</abbr> functions in your integrity zome, but most of the time you'll want to define them in a [**coordinator zome**](/resources/glossary/#coordinator-zome). This is because an updated coordinator zome can be hot-swapped in a running application, whereas changes to an integrity zome result in a new DNA with a separate network and database from the previous DNA.

Create an entry by calling [`hdk::prelude::create_entry`](https://docs.rs/hdk/latest/hdk/entry/fn.create_entry.html). The entry will be serialized into a blob automatically, thanks to the `hdk_entry_helper` macro.

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
    // create. The `hdk_entry_types` macro will have set this up for you, so all
    // you need to do is wrap your movie in the corresponding enum variant.
    &EntryTypes::Movie(movie.clone()),
)?;
```

### Create under the hood

When the client calls a zome function that calls `create_entry`, Holochain does the following:

1. Prepare a **scratch space** for making an atomic set of changes to the source chain for the agent's cell.
2. Build a [`Create` action](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.Create.html) that includes:
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
8. Publish the actions in the scratch space to the source chain.
9. Return the zome function's return value to the client.
10. In the background, publish all newly created DHT operations to their respective authority agents.

<!-- TODO review and outline steps that are taken under the hood *exactly*, including which DHT ops are published -->

## Update an Entry

Update an entry creation action (either a `Create` or an `Update`) by calling [`hdk::entry::update_entry`](https://docs.rs/hdk/latest/hdk/entry/fn.update_entry.html) with the old action hash and the new entry data:

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

An [`Update` action](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.Update.html) operates on an entry creation action (either a `Create` or an `Update`). It doesn't remove the original data from the DHT; instead, it gets attached to both the original entry and its entry creation action. As an entry creation action itself, it references the hash of the new entry so it can be retrieved from the DHT.

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
8. Publish the actions in the scratch space to the source chain.
9. Return the zome function's return value to the client.
10. In the background, publish all newly created DHT operations to their respective authority agents.

<!-- TODO review and outline steps that are taken under the hood *exactly*, including which DHT ops are published -->

### Update patterns

Holochain gives you this `update_entry` function, but is somewhat unopinionated about how it's used. You can interpret an update as applying to either the original _action_ or the original _entry_ being updated, because the `Update` action is merely a piece of metadata attached to both, and can be retrieved along with the original data.

You can also choose where to attach updates. You can structure them as a 'list', where all updates refer to the `ActionHash` of the original `Create` action.

<svg aria-roledescription="flowchart-v2" role="graphics-document document" style="overflow: hidden; max-width: 100%;" xmlns="http://www.w3.org/2000/svg" width="100%" id="graph-div" height="100%" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events"><g id="viewport-20240308200747100" class="svg-pan-zoom_viewport" transform="matrix(0.9122735261917114,0,0,0.9122735261917114,289.83331298828125,210.19723510742188)" style="transform: matrix(0.912274, 0, 0, 0.912274, 289.833, 210.197);"><style>#graph-div{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;fill:#333;}#graph-div .error-icon{fill:#552222;}#graph-div .error-text{fill:#552222;stroke:#552222;}#graph-div .edge-thickness-normal{stroke-width:2px;}#graph-div .edge-thickness-thick{stroke-width:3.5px;}#graph-div .edge-pattern-solid{stroke-dasharray:0;}#graph-div .edge-pattern-dashed{stroke-dasharray:3;}#graph-div .edge-pattern-dotted{stroke-dasharray:2;}#graph-div .marker{fill:#333333;stroke:#333333;}#graph-div .marker.cross{stroke:#333333;}#graph-div svg{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;}#graph-div .label{font-family:"trebuchet ms",verdana,arial,sans-serif;color:#333;}#graph-div .cluster-label text{fill:#333;}#graph-div .cluster-label span,#graph-div p{color:#333;}#graph-div .label text,#graph-div span,#graph-div p{fill:#333;color:#333;}#graph-div .node rect,#graph-div .node circle,#graph-div .node ellipse,#graph-div .node polygon,#graph-div .node path{fill:#ECECFF;stroke:#9370DB;stroke-width:1px;}#graph-div .flowchart-label text{text-anchor:middle;}#graph-div .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#graph-div .node .label{text-align:center;}#graph-div .node.clickable{cursor:pointer;}#graph-div .arrowheadPath{fill:#333333;}#graph-div .edgePath .path{stroke:#333333;stroke-width:2.0px;}#graph-div .flowchart-link{stroke:#333333;fill:none;}#graph-div .edgeLabel{background-color:#e8e8e8;text-align:center;}#graph-div .edgeLabel rect{opacity:0.5;background-color:#e8e8e8;fill:#e8e8e8;}#graph-div .labelBkg{background-color:rgba(232, 232, 232, 0.5);}#graph-div .cluster rect{fill:#ffffde;stroke:#aaaa33;stroke-width:1px;}#graph-div .cluster text{fill:#333;}#graph-div .cluster span,#graph-div p{color:#333;}#graph-div div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:12px;background:hsl(80, 100%, 96.2745098039%);border:1px solid #aaaa33;border-radius:2px;pointer-events:none;z-index:100;}#graph-div .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#333;}#graph-div :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}</style><g><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="6" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-pointEnd"><path style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 0 0 L 10 5 L 0 10 z"></path></marker><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="4.5" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-pointStart"><path style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 0 5 L 10 10 L 10 0 z"></path></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="11" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-circleEnd"><circle style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" r="5" cy="5" cx="5"></circle></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="-1" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-circleStart"><circle style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" r="5" cy="5" cx="5"></circle></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="12" viewBox="0 0 11 11" class="marker cross flowchart" id="graph-div_flowchart-crossEnd"><path style="stroke-width: 2px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"></path></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="-1" viewBox="0 0 11 11" class="marker cross flowchart" id="graph-div_flowchart-crossStart"><path style="stroke-width: 2px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"></path></marker><g class="root"><g class="clusters"></g><g class="edgePaths"><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-B LE-A" id="L-B-A-0" d="M39.95,39L39.95,43.167C39.95,47.333,39.95,55.667,66.314,65.854C92.678,76.042,145.405,88.084,171.769,94.105L198.133,100.126"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-C LE-A" id="L-C-A-0" d="M169.85,39L169.85,43.167C169.85,47.333,169.85,55.667,175.203,63.501C180.556,71.335,191.261,78.67,196.614,82.337L201.967,86.004"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-D LE-A" id="L-D-A-0" d="M299.75,39L299.75,43.167C299.75,47.333,299.75,55.667,294.397,63.501C289.044,71.335,278.339,78.67,272.986,82.337L267.633,86.004"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-E LE-A" id="L-E-A-0" d="M429.65,39L429.65,43.167C429.65,47.333,429.65,55.667,403.286,65.854C376.922,76.042,324.195,88.084,297.831,94.105L271.467,100.126"></path></g><g class="edgeLabels"><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g></g><g class="nodes"><g transform="translate(39.94999694824219, 19.5)" data-id="B" data-node="true" id="flowchart-B-16" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 1</span></div></foreignObject></g></g><g transform="translate(234.79998779296875, 108.5)" data-id="A" data-node="true" id="flowchart-A-17" class="node default default flowchart-label"><rect height="39" width="63" y="-19.5" x="-31.5" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-24, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="48"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Create</span></div></foreignObject></g></g><g transform="translate(169.84999084472656, 19.5)" data-id="C" data-node="true" id="flowchart-C-18" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 2</span></div></foreignObject></g></g><g transform="translate(299.74998474121094, 19.5)" data-id="D" data-node="true" id="flowchart-D-20" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 3</span></div></foreignObject></g></g><g transform="translate(429.6499786376953, 19.5)" data-id="E" data-node="true" id="flowchart-E-22" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 4</span></div></foreignObject></g></g></g></g></g></g><defs><style id="svg-pan-zoom-controls-styles" type="text/css">.svg-pan-zoom-control { cursor: pointer; fill: black; fill-opacity: 0.333; } .svg-pan-zoom-control:hover { fill-opacity: 0.8; } .svg-pan-zoom-control-background { fill: white; fill-opacity: 0.5; } .svg-pan-zoom-control-background { fill-opacity: 0.8; }</style></defs><g id="svg-pan-zoom-controls" transform="translate(816 531) scale(0.75)" class="svg-pan-zoom-control"><g id="svg-pan-zoom-zoom-in" transform="translate(30.5 5) scale(0.015)" class="svg-pan-zoom-control"><rect x="0" y="0" width="1500" height="1400" class="svg-pan-zoom-control-background"></rect><path d="M1280 576v128q0 26 -19 45t-45 19h-320v320q0 26 -19 45t-45 19h-128q-26 0 -45 -19t-19 -45v-320h-320q-26 0 -45 -19t-19 -45v-128q0 -26 19 -45t45 -19h320v-320q0 -26 19 -45t45 -19h128q26 0 45 19t19 45v320h320q26 0 45 19t19 45zM1536 1120v-960 q0 -119 -84.5 -203.5t-203.5 -84.5h-960q-119 0 -203.5 84.5t-84.5 203.5v960q0 119 84.5 203.5t203.5 84.5h960q119 0 203.5 -84.5t84.5 -203.5z" class="svg-pan-zoom-control-element"></path></g><g id="svg-pan-zoom-reset-pan-zoom" transform="translate(5 35) scale(0.4)" class="svg-pan-zoom-control"><rect x="2" y="2" width="182" height="58" class="svg-pan-zoom-control-background"></rect><path d="M33.051,20.632c-0.742-0.406-1.854-0.609-3.338-0.609h-7.969v9.281h7.769c1.543,0,2.701-0.188,3.473-0.562c1.365-0.656,2.048-1.953,2.048-3.891C35.032,22.757,34.372,21.351,33.051,20.632z" class="svg-pan-zoom-control-element"></path><path d="M170.231,0.5H15.847C7.102,0.5,0.5,5.708,0.5,11.84v38.861C0.5,56.833,7.102,61.5,15.847,61.5h154.384c8.745,0,15.269-4.667,15.269-10.798V11.84C185.5,5.708,178.976,0.5,170.231,0.5z M42.837,48.569h-7.969c-0.219-0.766-0.375-1.383-0.469-1.852c-0.188-0.969-0.289-1.961-0.305-2.977l-0.047-3.211c-0.03-2.203-0.41-3.672-1.142-4.406c-0.732-0.734-2.103-1.102-4.113-1.102h-7.05v13.547h-7.055V14.022h16.524c2.361,0.047,4.178,0.344,5.45,0.891c1.272,0.547,2.351,1.352,3.234,2.414c0.731,0.875,1.31,1.844,1.737,2.906s0.64,2.273,0.64,3.633c0,1.641-0.414,3.254-1.242,4.84s-2.195,2.707-4.102,3.363c1.594,0.641,2.723,1.551,3.387,2.73s0.996,2.98,0.996,5.402v2.32c0,1.578,0.063,2.648,0.19,3.211c0.19,0.891,0.635,1.547,1.333,1.969V48.569z M75.579,48.569h-26.18V14.022h25.336v6.117H56.454v7.336h16.781v6H56.454v8.883h19.125V48.569z M104.497,46.331c-2.44,2.086-5.887,3.129-10.34,3.129c-4.548,0-8.125-1.027-10.731-3.082s-3.909-4.879-3.909-8.473h6.891c0.224,1.578,0.662,2.758,1.316,3.539c1.196,1.422,3.246,2.133,6.15,2.133c1.739,0,3.151-0.188,4.236-0.562c2.058-0.719,3.087-2.055,3.087-4.008c0-1.141-0.504-2.023-1.512-2.648c-1.008-0.609-2.607-1.148-4.796-1.617l-3.74-0.82c-3.676-0.812-6.201-1.695-7.576-2.648c-2.328-1.594-3.492-4.086-3.492-7.477c0-3.094,1.139-5.664,3.417-7.711s5.623-3.07,10.036-3.07c3.685,0,6.829,0.965,9.431,2.895c2.602,1.93,3.966,4.73,4.093,8.402h-6.938c-0.128-2.078-1.057-3.555-2.787-4.43c-1.154-0.578-2.587-0.867-4.301-0.867c-1.907,0-3.428,0.375-4.565,1.125c-1.138,0.75-1.706,1.797-1.706,3.141c0,1.234,0.561,2.156,1.682,2.766c0.721,0.406,2.25,0.883,4.589,1.43l6.063,1.43c2.657,0.625,4.648,1.461,5.975,2.508c2.059,1.625,3.089,3.977,3.089,7.055C108.157,41.624,106.937,44.245,104.497,46.331z M139.61,48.569h-26.18V14.022h25.336v6.117h-18.281v7.336h16.781v6h-16.781v8.883h19.125V48.569z M170.337,20.14h-10.336v28.43h-7.266V20.14h-10.383v-6.117h27.984V20.14z" class="svg-pan-zoom-control-element"></path></g><g id="svg-pan-zoom-zoom-out" transform="translate(30.5 70) scale(0.015)" class="svg-pan-zoom-control"><rect x="0" y="0" width="1500" height="1400" class="svg-pan-zoom-control-background"></rect><path d="M1280 576v128q0 26 -19 45t-45 19h-896q-26 0 -45 -19t-19 -45v-128q0 -26 19 -45t45 -19h896q26 0 45 19t19 45zM1536 1120v-960q0 -119 -84.5 -203.5t-203.5 -84.5h-960q-119 0 -203.5 84.5t-84.5 203.5v960q0 119 84.5 203.5t203.5 84.5h960q119 0 203.5 -84.5 t84.5 -203.5z" class="svg-pan-zoom-control-element"></path></g></g></svg>

Or you can structure your updates as a 'chain', where each update refers to the `ActionHash` of the previous entry creation action (either an `Update` or the original `Create`).

<!-- TODO: replace with original Mermaid source once the site supports server-side Mermaid rendering. Use `git blame` to find the source. -->
<svg aria-roledescription="flowchart-v2" role="graphics-document document" style="overflow: hidden; max-width: 100%;" xmlns="http://www.w3.org/2000/svg" width="100%" id="graph-div" height="100%" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events"><g id="viewport-20240308200846672" class="svg-pan-zoom_viewport" transform="matrix(0.7384428381919861,0,0,0.7384428381919861,289.83331298828125,210.19723510742188)" style="transform: matrix(0.738443, 0, 0, 0.738443, 289.833, 210.197);"><style>#graph-div{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;fill:#333;}#graph-div .error-icon{fill:#552222;}#graph-div .error-text{fill:#552222;stroke:#552222;}#graph-div .edge-thickness-normal{stroke-width:2px;}#graph-div .edge-thickness-thick{stroke-width:3.5px;}#graph-div .edge-pattern-solid{stroke-dasharray:0;}#graph-div .edge-pattern-dashed{stroke-dasharray:3;}#graph-div .edge-pattern-dotted{stroke-dasharray:2;}#graph-div .marker{fill:#333333;stroke:#333333;}#graph-div .marker.cross{stroke:#333333;}#graph-div svg{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;}#graph-div .label{font-family:"trebuchet ms",verdana,arial,sans-serif;color:#333;}#graph-div .cluster-label text{fill:#333;}#graph-div .cluster-label span,#graph-div p{color:#333;}#graph-div .label text,#graph-div span,#graph-div p{fill:#333;color:#333;}#graph-div .node rect,#graph-div .node circle,#graph-div .node ellipse,#graph-div .node polygon,#graph-div .node path{fill:#ECECFF;stroke:#9370DB;stroke-width:1px;}#graph-div .flowchart-label text{text-anchor:middle;}#graph-div .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#graph-div .node .label{text-align:center;}#graph-div .node.clickable{cursor:pointer;}#graph-div .arrowheadPath{fill:#333333;}#graph-div .edgePath .path{stroke:#333333;stroke-width:2.0px;}#graph-div .flowchart-link{stroke:#333333;fill:none;}#graph-div .edgeLabel{background-color:#e8e8e8;text-align:center;}#graph-div .edgeLabel rect{opacity:0.5;background-color:#e8e8e8;fill:#e8e8e8;}#graph-div .labelBkg{background-color:rgba(232, 232, 232, 0.5);}#graph-div .cluster rect{fill:#ffffde;stroke:#aaaa33;stroke-width:1px;}#graph-div .cluster text{fill:#333;}#graph-div .cluster span,#graph-div p{color:#333;}#graph-div div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:12px;background:hsl(80, 100%, 96.2745098039%);border:1px solid #aaaa33;border-radius:2px;pointer-events:none;z-index:100;}#graph-div .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#333;}#graph-div :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}</style><g><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="6" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-pointEnd"><path style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 0 0 L 10 5 L 0 10 z"></path></marker><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="4.5" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-pointStart"><path style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 0 5 L 10 10 L 10 0 z"></path></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="11" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-circleEnd"><circle style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" r="5" cy="5" cx="5"></circle></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="-1" viewBox="0 0 10 10" class="marker flowchart" id="graph-div_flowchart-circleStart"><circle style="stroke-width: 1px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" r="5" cy="5" cx="5"></circle></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="12" viewBox="0 0 11 11" class="marker cross flowchart" id="graph-div_flowchart-crossEnd"><path style="stroke-width: 2px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"></path></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="-1" viewBox="0 0 11 11" class="marker cross flowchart" id="graph-div_flowchart-crossStart"><path style="stroke-width: 2px; stroke-dasharray: 1px, 0px;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"></path></marker><g class="root"><g class="clusters"></g><g class="edgePaths"><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-B LE-A" id="L-B-A-0" d="M39.95,306L39.95,310.167C39.95,314.333,39.95,322.667,39.95,330.117C39.95,337.567,39.95,344.133,39.95,347.417L39.95,350.7"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-C LE-B" id="L-C-B-0" d="M39.95,217L39.95,221.167C39.95,225.333,39.95,233.667,39.95,241.117C39.95,248.567,39.95,255.133,39.95,258.417L39.95,261.7"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-D LE-C" id="L-D-C-0" d="M39.95,128L39.95,132.167C39.95,136.333,39.95,144.667,39.95,152.117C39.95,159.567,39.95,166.133,39.95,169.417L39.95,172.7"></path><path marker-end="url(#graph-div_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-E LE-D" id="L-E-D-0" d="M39.95,39L39.95,43.167C39.95,47.333,39.95,55.667,39.95,63.117C39.95,70.567,39.95,77.133,39.95,80.417L39.95,83.7"></path></g><g class="edgeLabels"><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="edgeLabel"></span></div></foreignObject></g></g></g><g class="nodes"><g transform="translate(39.94999694824219, 286.5)" data-id="B" data-node="true" id="flowchart-B-584" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 1</span></div></foreignObject></g></g><g transform="translate(39.94999694824219, 375.5)" data-id="A" data-node="true" id="flowchart-A-585" class="node default default flowchart-label"><rect height="39" width="63" y="-19.5" x="-31.5" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-24, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="48"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Create</span></div></foreignObject></g></g><g transform="translate(39.94999694824219, 197.5)" data-id="C" data-node="true" id="flowchart-C-586" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 2</span></div></foreignObject></g></g><g transform="translate(39.94999694824219, 108.5)" data-id="D" data-node="true" id="flowchart-D-588" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 3</span></div></foreignObject></g></g><g transform="translate(39.94999694824219, 19.5)" data-id="E" data-node="true" id="flowchart-E-590" class="node default default flowchart-label"><rect height="39" width="79.89999389648438" y="-19.5" x="-39.94999694824219" ry="0" rx="0" style="" class="basic label-container"></rect><g transform="translate(-32.44999694824219, -12)" style="" class="label"><rect></rect><foreignObject height="24" width="64.89999389648438"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;"><span class="nodeLabel">Update 4</span></div></foreignObject></g></g></g></g></g></g><defs><style id="svg-pan-zoom-controls-styles" type="text/css">.svg-pan-zoom-control { cursor: pointer; fill: black; fill-opacity: 0.333; } .svg-pan-zoom-control:hover { fill-opacity: 0.8; } .svg-pan-zoom-control-background { fill: white; fill-opacity: 0.5; } .svg-pan-zoom-control-background { fill-opacity: 0.8; }</style></defs><g id="svg-pan-zoom-controls" transform="translate(816 531) scale(0.75)" class="svg-pan-zoom-control"><g id="svg-pan-zoom-zoom-in" transform="translate(30.5 5) scale(0.015)" class="svg-pan-zoom-control"><rect x="0" y="0" width="1500" height="1400" class="svg-pan-zoom-control-background"></rect><path d="M1280 576v128q0 26 -19 45t-45 19h-320v320q0 26 -19 45t-45 19h-128q-26 0 -45 -19t-19 -45v-320h-320q-26 0 -45 -19t-19 -45v-128q0 -26 19 -45t45 -19h320v-320q0 -26 19 -45t45 -19h128q26 0 45 19t19 45v320h320q26 0 45 19t19 45zM1536 1120v-960 q0 -119 -84.5 -203.5t-203.5 -84.5h-960q-119 0 -203.5 84.5t-84.5 203.5v960q0 119 84.5 203.5t203.5 84.5h960q119 0 203.5 -84.5t84.5 -203.5z" class="svg-pan-zoom-control-element"></path></g><g id="svg-pan-zoom-reset-pan-zoom" transform="translate(5 35) scale(0.4)" class="svg-pan-zoom-control"><rect x="2" y="2" width="182" height="58" class="svg-pan-zoom-control-background"></rect><path d="M33.051,20.632c-0.742-0.406-1.854-0.609-3.338-0.609h-7.969v9.281h7.769c1.543,0,2.701-0.188,3.473-0.562c1.365-0.656,2.048-1.953,2.048-3.891C35.032,22.757,34.372,21.351,33.051,20.632z" class="svg-pan-zoom-control-element"></path><path d="M170.231,0.5H15.847C7.102,0.5,0.5,5.708,0.5,11.84v38.861C0.5,56.833,7.102,61.5,15.847,61.5h154.384c8.745,0,15.269-4.667,15.269-10.798V11.84C185.5,5.708,178.976,0.5,170.231,0.5z M42.837,48.569h-7.969c-0.219-0.766-0.375-1.383-0.469-1.852c-0.188-0.969-0.289-1.961-0.305-2.977l-0.047-3.211c-0.03-2.203-0.41-3.672-1.142-4.406c-0.732-0.734-2.103-1.102-4.113-1.102h-7.05v13.547h-7.055V14.022h16.524c2.361,0.047,4.178,0.344,5.45,0.891c1.272,0.547,2.351,1.352,3.234,2.414c0.731,0.875,1.31,1.844,1.737,2.906s0.64,2.273,0.64,3.633c0,1.641-0.414,3.254-1.242,4.84s-2.195,2.707-4.102,3.363c1.594,0.641,2.723,1.551,3.387,2.73s0.996,2.98,0.996,5.402v2.32c0,1.578,0.063,2.648,0.19,3.211c0.19,0.891,0.635,1.547,1.333,1.969V48.569z M75.579,48.569h-26.18V14.022h25.336v6.117H56.454v7.336h16.781v6H56.454v8.883h19.125V48.569z M104.497,46.331c-2.44,2.086-5.887,3.129-10.34,3.129c-4.548,0-8.125-1.027-10.731-3.082s-3.909-4.879-3.909-8.473h6.891c0.224,1.578,0.662,2.758,1.316,3.539c1.196,1.422,3.246,2.133,6.15,2.133c1.739,0,3.151-0.188,4.236-0.562c2.058-0.719,3.087-2.055,3.087-4.008c0-1.141-0.504-2.023-1.512-2.648c-1.008-0.609-2.607-1.148-4.796-1.617l-3.74-0.82c-3.676-0.812-6.201-1.695-7.576-2.648c-2.328-1.594-3.492-4.086-3.492-7.477c0-3.094,1.139-5.664,3.417-7.711s5.623-3.07,10.036-3.07c3.685,0,6.829,0.965,9.431,2.895c2.602,1.93,3.966,4.73,4.093,8.402h-6.938c-0.128-2.078-1.057-3.555-2.787-4.43c-1.154-0.578-2.587-0.867-4.301-0.867c-1.907,0-3.428,0.375-4.565,1.125c-1.138,0.75-1.706,1.797-1.706,3.141c0,1.234,0.561,2.156,1.682,2.766c0.721,0.406,2.25,0.883,4.589,1.43l6.063,1.43c2.657,0.625,4.648,1.461,5.975,2.508c2.059,1.625,3.089,3.977,3.089,7.055C108.157,41.624,106.937,44.245,104.497,46.331z M139.61,48.569h-26.18V14.022h25.336v6.117h-18.281v7.336h16.781v6h-16.781v8.883h19.125V48.569z M170.337,20.14h-10.336v28.43h-7.266V20.14h-10.383v-6.117h27.984V20.14z" class="svg-pan-zoom-control-element"></path></g><g id="svg-pan-zoom-zoom-out" transform="translate(30.5 70) scale(0.015)" class="svg-pan-zoom-control"><rect x="0" y="0" width="1500" height="1400" class="svg-pan-zoom-control-background"></rect><path d="M1280 576v128q0 26 -19 45t-45 19h-896q-26 0 -45 -19t-19 -45v-128q0 -26 19 -45t45 -19h896q26 0 45 19t19 45zM1536 1120v-960q0 -119 -84.5 -203.5t-203.5 -84.5h-960q-119 0 -203.5 84.5t-84.5 203.5v960q0 119 84.5 203.5t203.5 84.5h960q119 0 203.5 -84.5 t84.5 -203.5z" class="svg-pan-zoom-control-element"></path></g></g></svg>

If you structure your updates as a chain, you may want to also create links from the `ActionHash` of the original `Create` to each update in the chain, making it a hybrid of a list and a chain. This trades additional storage space for reduced lookup time.

### Resolving update conflicts

It's up to you to decide whether two updates on the same entry or action are a conflict. If your use case allows branching edits similar to Git, then conflicts aren't an issue.

But if your use case needs a single canonical version of a resource, you'll need to decide on a conflict resolution strategy to use at retrieval time.

If only the original author is permitted to update the entry, choosing the latest update is simple. Just choose the `Update` action with the most recent timestamp, which is guaranteed to [advance monotonically](https://doc.rust-lang.org/std/time/struct.Instant.html) for any honest agent. But if multiple agents are permitted to update an entry, it gets more complicated. Two agents could make an update at exactly the same time (or their action timestamps might be wrong or falsified). So, how do you decide which is the 'latest' update?

These are two common patterns:

* Use an opinionated, deterministic definition of 'latest' that can be calculated from the content of the update.
* Model your updates with a data structure that can automatically merge simultaneous updates, such as a [conflict-free replicated data type (CRDT)](https://crdt.tech/).

## Delete an entry

Delete an entry creation action by calling [`hdk::entry::delete_entry`](https://docs.rs/hdk/latest/hdk/entry/fn.delete_entry.html).

```rust
use hdk::prelude::*;

let delete_action_hash: ActionHash = delete_entry(
    create_action_hash,
)?;
```

As with an update, this does _not_ actually remove data from the source chain or the DHT. Instead, a [`Delete` action](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.Delete.html) is committed to the cell's source chain, and the entry creation action is marked 'dead'. An entry itself is only considered dead when all entry creation actions that created it are marked dead, and it can become live again in the future if a _new_ entry creation action writes it. Any dead data can still be retrieved with [`hdk::entry::get_details`](https://docs.rs/hdk/latest/hdk/entry/fn.get_details.html) (see below).

In the future we plan to include a 'purge' functionality. This will give agents permission to actually erase an entry from their DHT store, but not its associated entry creation action.

Remember that, even once purge is implemented, it is impossible to force another person to delete data once they have seen it. Be deliberate about how what data becomes public in your app.

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
7. Publish the actions in the scratch space to the source chain.
8. Return the zome function's return value to the client.
9. In the background, publish all newly created DHT operations to their respective authority agents.

<!-- TODO review and outline steps that are taken under the hood *exactly*, including which DHT ops are published -->

## Identifiers on the DHT

Coming from centralized software architectures, you might expect an entry to have a unique ID that can be used to reference it elsewhere. Holochain uses the hash of a piece of content as its unique ID. In practice, different kinds of hashes have different meaning and suitability to use as an identifier.

To identify the _contents_ of an entry, use the entry's `EntryHash`. Remember that, if two entry creation actions write identical entry contents, the entries will collide in the DHT. You may want this or you may not, depending on the nature of your entry type.

A common pattern to identify an _instance_ of an entry (i.e., an entry authored by a specific agent at a specific time) is to use the `ActionHash` of its entry creation action instead. This gives you timestamp and authorship information for free, and can be a persistent way to identify the initial entry at the root of a tree of updates.

You can reference an agent via their `AgentPubKey`. This is a special type of DHT entry whose identifier is identical to its content --- that is, the agent's public key. You can use it just like an `EntryHash` and `ActionHash`.

Finally, you can also use **external identifiers** (that is, IDs of data that's not in the DHT) as long as they're 32 bytes. It's up to you to determine how to interpret these identifiers in your front end.

You can use any of these identifiers as a field in your entry types to model a many-to-one relationship, or you can use links between identifiers to model a one-to-many relationship.

## Retrieve an entry

Get an entry creation action along with its entry data by calling [`hdk::entry::get`](https://docs.rs/hdk/latest/hdk/entry/fn.get.html)] with the action hash. The return value is a `Result<`[`holochain_integrity_types::record::Record`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/record/struct.Record.html)`>`, where a `Record` is a pairing of an action and its optional entry data.

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
        // that the action hash referenced an action with entry data attached
        // to it.
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

To get a record and all the updates, deletes, and outbound links associated with its action, as well as its current validation status, call [`hdk::entry::get_details`](https://docs.rs/hdk/latest/hdk/entry/fn.get_details.html) with an _action hash_. You'll receive a `Result<`[`holochain_zome_types::metadata::RecordDetails`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/metadata/struct.RecordDetails.html)`>`.

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

To get an entry and all the deletes and updates that operated on it (or rather, that operated on the entry creation actions that produced it), _as well as_ all its entry creation actions and its current status on the DHT, pass an _entry hash_ to [`hdk::entry::get_details`](https://docs.rs/hdk/latest/hdk/entry/fn.get_details.html). You'll receive a [`holochain_zome_types::metadata::EntryDetails`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/metadata/struct.EntryDetails.html) struct.

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

## Community CRUD libraries

If the scaffolder doesn't support your desired functionality, or is too low-level, there are some community-maintained libraries that offer opinionated and high-level ways to work with entries. Some of them also offer permissions management.

- [rust-hc-crud-caps](https://github.com/spartan-holochain-counsel/rust-hc-crud-caps)
- [hdk_crud](https://github.com/lightningrodlabs/hdk_crud)
- [hc-cooperative-content](https://github.com/mjbrisebois/hc-cooperative-content)

## Reference

- [hdi::prelude::hdk_entry_helper](https://docs.rs/hdi/latest/hdi/attr.hdk_entry_helper.html)
- [hdi::prelude::hdk_entry_defs](https://docs.rs/hdi/latest/hdi/prelude/attr.hdk_entry_defs.html)
- [hdi::prelude::entry_def](https://docs.rs/hdi/latest/hdi/prelude/entry_def/index.html)
- [hdk::prelude::create_entry](https://docs.rs/hdk/latest/hdk/entry/fn.create_entry.html)
- [hdk::prelude::update_entry](https://docs.rs/hdk/latest/hdk/entry/fn.update_entry.html)
- [hdi::prelude::delete_entry](https://docs.rs/hdk/latest/hdk/entry/fn.delete_entry.html)
