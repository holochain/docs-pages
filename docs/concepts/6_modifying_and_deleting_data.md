# 6: Modifying and Deleting Data

> Holochain allows agents to mutate immutable data by publishing special **remove** and **update** entries.

![](https://i.imgur.com/fLamuNE.png)

Unlike traditional databases, entries in a Holochain app cannot be modified or removed once they're written. This is useful for financial applications, but not for applications such as Wikis, project management tools, and social media.

So how do we make apps that support mutable data? We leave the old entries in place and write new entries, adding a piece of metadata onto the originals to indicate their status. Holochain features two special entry types that do this for you:

![](https://i.imgur.com/ji7oVPW.png)

* A **remove entry**, which instructs DHT peers to mark the original entry as deleted.

![](https://i.imgur.com/sjzzntQ.png)

* An **update entry**, which carries updated data and instructs DHT peers to mark the original entry as updated, with a pointer to the new entry.

When you try to retrieve a DHT entry or link that's been removed, Holochain will give an empty result. When you try to retrieve a DHT entry that's been updated, Holochain will traverse the chain of update pointers to the newest version. But applications can still explicitly ask for old or deleted entries---no data is ever truly removed.