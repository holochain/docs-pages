---
title: "Entries"
tocData:
  - title: Create an Entry
    href: create-an-entry
  - title: Update an Entry
    href: update-an-entry
    children:
      - title: Efficiently querying updates
        href: efficiently-querying-updates
      - title: Cooperative Updates
        href: cooperative-updates
  - title: Delete an Entry
    href: delete-an-entry
  - title: Reference an Entry
    href: reference-an-entry
  - title: Querying Entries
    href: querying-entries
---

## Create an Entry

- `create_entry` simple example

## Update an Entry

- `update_entry` simple example

### Efficiently querying updates

- Trading storage space for reduced lookup time
- but then how do you find the latest entry?
  - get action, get all "updates" off it
  - get update, get all updates off it
  (cont. until there are no more updates)

  - link from original entry to each update
    - scaffolder

- `update_entry` example with linking to each update


### Cooperative Updates

- What if multiple agents are allowed to update the same entry? They could potentially make an update at exactly the same time? Or their clocks might be wrong / or falsified! How do know which is the "latest" update?
  - You don't -- you either (1) come up with an opinionated definition of latest for that entry type or (2) expose both updates to the user so they can decide which is most meaningful to them
  - You could use an "objective" time system to determine the "latest" update, but remember that's simply another opinionated definition of latest -- it may make sense for some use cases, but not for others


## Delete an Entry


- `delete_entry` example

- No data is actually *removed* from the DHT, instead a Delete action is commited to the source chain with the action hash of the Create action

- Note that a "purge" feature is planned for a future update -- notifying agents that they are free to delete some entry, but not the action that references it

- Remember you can never force anyone to delete any data once they have seen it


## CRUD Libraries

If the scaffolder doesn't support your desired functionality, or is too low-level, there are some community-maintained libraries that offer an opinionated and high-level ways to work with entries.

- [hc-cooperative-content](https://github.com/mjbriesbois/hc-cooperative-content)
- [hdk_crud](https://github.com/lightningrodlab/shdk_crud)
- [hc_crud_caps](https://github.com/mjbriesboi/hc_crud_caps)
