---
title: Get Building
---

In Quick Start you installed Holochain and built a templated forum application. Here you will use the Scaffold tool to build your own application and learn the basic commands for using the scaffold.

!!! note Pre-requisite
Holochain installed as per [Quick Start](../quick-start/index)
!!! 

## Scaffold a Custom Holochain Application

For this example we will scaffold the canonical example, a To-do hApp.

Run the holochain scaffolding tool by typing in your terminal:
```bash
nix-shell https://holochain.love --run "hc scaffold web-app"
```
You should then see: OUTPUT
```bash
? App name (no whitespaces): 
```
 Type your hApp's name using snake_casing, e. g. super_todos.
You should then see: OUTPUT
```bash
? Choose UI framework: ›
❯ Vanilla
  Vue
  Svelte
  Lit
```
Use the arrow keys to select a UI framework for your front-end and then press <enter> (or just choose `Vanilla` for plain JavaScript with no UI framework).  
  
For this example choose `Svelte` and press <enter>
You should then see: OUTPUT
```bash
? Do you want to set up the holonix development environment for this project? ›
❯ Yes (recommended)
  No
```
Choose `Yes` and press <enter>

You should then see `Initializing..` with some details of what is being added, followed by instructions of next steps for setting up the development environment for your hApp and continuing to scaffold more of its elements.  Follow those instructions by typing each of these commands:

```bash
cd super_todos
```
```bash
nix-shell
```
and
```bash
npm install
```

  Now lets continue scaffolding your happ by creating a new DNA with:
```bash
hc scaffold dna
```
You should then see OUTPUT:
```bash
? DNA name (snake_case): 
```
Many hApps have just one DNA, so in this case you might type: `todo`
You should then see: OUTPUT:
```bash
DNA "todo" scaffolded!

Add new zomes to your DNA with:

  hc scaffold zome
```
DNAs are comprised of code modules, we call zomes.  A DNA should have at least two zomes, and *integrity zome* which declares your DNAs data structures and validation code, and a *coordinator zome* which contains, among other things, the API functions your UI will call to access your DNA. 

Create your DNA's first zome with:

```bash
hc scaffold zome
```
You should then see: OUTPUT
```bash
? What do you want to scaffold? ›
❯ Integrity/coordinator zome-pair (recommended)
  Only an integrity zome
  Only a coordinator zome
```
Press <enter> to select `Integrity/coordinator zome-pair`
You should then see: OUTPUT
```bash
? Enter coordinator zome name (snake_case):
 (The integrity zome will automatically be named '{name of coordinator zome}_integrity')
```
Type in a name for the zome.  In this case we can just use the same name as the DNA `todo`
You should then see: OUTPUT
```bash
? Scaffold integrity zome in folder "dnas/todo/zomes/integrity/"? (y/n) ›
```
Press `y`  (this option is for advanced users who may have set up a different folder structure)
You should then see: OUTPUT
```bash
Integrity zome "todo_integrity" scaffolded!
? Scaffold coordinator zome in "dnas/todo/zomes/coordinator/"? (y/n) ›
```
Press `y` again.

You will then see `Coordinator zome "todo" scaffolded!` along with output from the intial downloading and setting up of the Holochain rust hdk.  Followed by instructions for adding your first entry type.

  Now we get to the really exciting part!  In the next steps you will specify your data model, and the Scaffolding tool will automatically add both zome and UI code to your hApp.

In our To-do happ every to-do item is stored as an entry so let's add new entry definitions with:
```bash
  hc scaffold entry-type
```
You should see: OUTPUT
```bash
✔ Entry type name (snake_case): ·
```
type: `todo_item`
You should then see: OUTPUT
```bash
Which fields should the entry contain?

? Choose field type: ›
❯ String
  bool
  u32
  i32
  f32
  Timestamp
  ActionHash
  EntryHash
  AgentPubKey
  Option of...
  Vector of...
```
The scaffolding tool is smart about adding different data type fields to your entry.  For our example we will just have two, a text field describing the todo item, and a boolean to check-off when it is done.  So, press <enter> to select `String`.
You should see: OUTPUT
```bash
? Field name: › 
```
type `description`
You should then see: OUTPUT
```bash
? Add another field to the entry? (y/n) ›
```
press `y`
This will again display the filed type list.  Use the arrow keys to select `bool` and press <enter>
You should again see the `FIeld name:` question.  Type `done` and press <enter>.
You should again see  the question to add another field.  This time press `n`

You should then see: OUTPUT
```bash
? Which CRUD functions should be scaffolded (SPACE to select/unselect, ENTER to continue)? ›
✔ Update
✔ Delete
```
The scaffolding tool can add zome and UI functions for updating and deleting entries.  In the case of our todo app we want to be able to do both, which is the default, so just press <enter>

You should then see: OUTPUT
```bash
? Should a link from the original entry be created when this entry is updated? ›
❯ Yes (more storage cost but better read performance, recommended)
  No (less storage cost but worse read performance)
```
Because Holochain stores data in append only source-chains, updating requires choosing a strategy of how to find updated data.   The scaffolding tool allows you to choose between two strategies, one where updates are only linked to the previous version, and one where there is also a link added to the original entry for each update.  For this use case either strategy would work fine, so press <enter> to choose the default. 

You should then see: OUTPUT
```bash
Entry type "todo_item" scaffolded!

Add new collections for that entry type with:

  hc scaffold collection
```
  
  The final step is create a collection that shows all of Todo items you have created.

To create a collection type:
```bash
  hc scaffold collection
```
You should then see: OUTPUT
```bash
Collection name (snake_case, eg. "all_posts"): › 
```
Type in: `my_todos` and press <enter>

You should then see: OUTPUT
```bash
? Which type of collection should be scaffolded? ›
❯ Global (get all entries of the selected entry types)
  By author (get entries of the selected entry types that a given author has created)
```
Use the arrow key to select `By author` and press <enter>.
  
  You should then see: OUTPUT
```bash
? Which entry type should be collected? ›
❯ TodoItem
```
  
  press <enter>

You should then see: OUTPUT
```bash
Collection "my_todos" scaffolded!
```
  
  You have now scaffolded your first holochain hApp!  To see it in action type:

```bash
npm run start
```

After some compilation time you should see the `hc-launch` tool rendering your hApp.
