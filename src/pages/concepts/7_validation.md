---
title: "Validation: Assuring Data Integrity"
---

::: coreconcepts-intro
Holochain DNAs can specify **validation rules** for DHT operations. This empowers agents to check the integrity of the data they see. When called upon to validate data, it allows them to identify corrupt peers, author a **warrant** against them as proof of their actions, and take personal defensive action against them.
:::

::: coreconcepts-orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Why validation matters](#validation-the-beating-heart-of-holochain)
2. [How complex validations can be sped up](#remembering-validation-results)
3. [How validation rules are defined](#how-validation-rules-are-defined)
4. [When validation happens](#the-lifecycle-s-of-a-validation)
5. [What validation rules can be used for](#use-cases-for-validation)
6. [What makes a good validation rule](#guidelines-for-writing-validation-rules)
7. [How and when to deal with things that can't be handled by validation](#things-that-aren-t-quite-validation-but-almost-are)

### <i class="far fa-atom"></i> Why it matters

Data validation rules are the core of a Holochain app. They deserve the bulk of your attention while you're writing your DNA.
:::

![](/assets/img/concepts/7.1-validation.png){.sz80p} {.center}

## Validation: the beating heart of Holochain

Let's review what we've covered so far.

1. Holochain is a framework for building apps that let peers directly share data without needing the protective oversight of a central server.
2. Holochain's two pillars of integrity are [intrinsic data validity and peer witnessing](../1_the_basics/#how-holochain-does-things-differently). The first defines what correct data looks like, while the second uses the strength of many eyes to rapidly detect corruption and reduce the overall burden of validation.
3. Each type of app entry and link can contain any sort of binary data whose correctness is determined by validation rules written into the application.
4. Peer validators use those rules to analyze entries, flag bad actors, and trigger personal defensive action such as blocking the corrupt agent.

Holochain is the engine that allows peers to move data around, validate it, and take action based on validation results. **Your DNA is mainly a collection of functions for creating, accessing, and validating data.** The design of these functions is critical to the success of your app because they define the membranes of safety between a participant and the stuff she receives from others via the DHT. Her running DNA --- her cell --- prevents her from creating invalid data and defends her from the consequences of other people's invalid data. Well-designed validation rules protect everyone, while buggy validation rules leave them vulnerable.

## 'Remembering' validation results

Some entries can be computationally expensive to validate. In a currency app, for example, the validity of a transaction depends on the account balances of both transacting parties, which is the sum of all their prior transactions. The validity of each of those transactions depends on the account balance at the time, plus the validity of the account balance of the people they transacted with, and so on and so on. The data is deeply interconnected; you don't want to wait while the coffee shop's payment terminal interrogates half the town's economic history when you're just trying to buy a coffee and get to work.

The DHT offers a shortcut --- it remembers the validation results of existing entries. You can ask the validation authorities for the parties' previous transactions if they detected any problems. You can assume that they have done the same thing for the transaction prior to those, and so on. As long as you trust a decent number of your peers to be playing by the rules, the validation results attached to the most recent entry 'proves' the validity of all the entries before it.

The result of a validation, if it was able to complete, is stored as a **validation receipt**. A failed validation receipt is also called a **warrant**. If a participant asks an authority for a piece of data that happens to be invalid, the authority can return the warrant in place of the actual data.

While this works for finding the validity of one _particular_ entry or action, a participant might have a reason to find out if another participant has ever produced _any_ invalid data. In the future, Holochain may allow them to consult the agent activity authorities for that peer and get all warrants at once.

## How validation rules are defined

A validation rule is simply a callback function in an integrity zome code that takes an operation, analyzes it, and returns a validation result. You'll remember that an operation encapsulates the details of an _action_, not a thing, so this function is validating whether the action's author should have performed it. The function has access to the author's source chain and the DHT, so it can also base its result on context such as the author's history or any data that the action may reference.

The entry and link types defined in an integrity zome go hand-in-hand with the validation function defined in that same zome; that is, the validation function should cover all the operations produced by the act of creating, updating, or deleting entries and links of those types.

!!! warning Non-determinism in validation functions
Entries and action can be retrieved by hash, as can entire sequences of a source chain. But collections such as links on a base or full agent activity reports can't be retrieved, because they change over time and would lead to non-determinism in validation results. This would cause different validation authorities to give different answers, leading to disagreement on the validity of an operation.

Other sources of non-determinism, such as conductor host API functions that retrieve the time, read the cell owner's own state, generate a random number, or call a zome function in another cell, are disallowed for the same reason.
!!!

Once it's done its work, the validation function can return one of three values:

* **Valid**,
* **Invalid**, with a description of what was invalid,
* **Unresolved dependencies**, with a list of the addresses of dependencies that it couldn't retrieve from the DHT. (If the conductor fails to retrieve data, it'll short-circuit execution of the validation function, return this value, and schedule the validation for retry later.)

All operations on CRUD actions whose entry or link types are defined in an integrity zome share a single validation function within that zome. Within this function, you can use branching logic to handle different operation types on different entry or link types.

**System actions** like membrane proof or capability grants result in operations that are validated by _all_ integrity zomes. That's because they have no entry or link type associated with them, so they can't be defined in or routed to a specific integrity zome. This is an advantage, though, because it lets you compose multiple validation rules for system actions into one DNA.

## The lifecycle(s) of a validation

Validation functions are called in two different scenarios, each with different consequences:

* When an agent first authors a record and attempts to produce DHT operations from it, and
* When an authority receives an operation for validation.

We'll carry on with the DHT illustrations from chapter 4 to show what happens when data is written, but let's add a simple validation rule: there's a `word` entry type that has a validation rule that says that it can't contain spaces.

### Authoring

When you **commit a record**, your conductor is responsible for making sure you're playing by the rules. This protects you from publishing any invalid data that could make you look like a bad actor.

#### Valid entry

::: coreconcepts-storysequence
![](/assets/img/concepts/7.2-commit.png){.sz80p} {.center}

Alice calls the `publish_word` zome function with the string `"eggplant"`. The function commits that word to her source chain. The conductor 'stages' the commit in the function's scratch space and returns the creation action's record hash to the `publish_word` function. The function continues executing and passes a return value back to the conductor, which holds onto it for now.

![](/assets/img/concepts/7.3-validate.png){.sz80p} {.center}

After the function has finished, Alice's conductor [converts this record into DHT operations](../4_dht/#a-cloud-of-witnesses), looks up the integrity zome that defines the `word` entry type, and calls that zome's validation function on each of the operations.

![](/assets/img/concepts/7.4-validation-success.png){.sz80p} {.center}

The validation function simply checks that the entry data contained in the action is only one word long, returning `Valid`.

![](/assets/img/concepts/7.5-persist-and-publish.png){.sz80p} {.center}

Her conductor commits the entry to her source chain, clears out the scratch space, and passes the `publish_word` function's return value back to the client. The operations are then sent to the appropriate DHT authorities for validation and integration into their shards.
:::

#### Invalid entry

::: coreconcepts-storysequence
![](/assets/img/concepts/7.6-commit.png){.sz80p} {.center}

Alice calls the same zome function with the string `"orca whales"`. Again, the function calls `create_entry` and the commit is staged to the scratch space.

![](/assets/img/concepts/7.7-validate.png){.sz80p} {.center}

Again, the conductor converts the committed action into operations calls the validation function on each of them.

![](/assets/img/concepts/7.8-validation-failure.png){.sz80p} {.center}

This time, the validation function sees two words. It returns `Invalid("too many words")`.

![](/assets/img/concepts/7.9-return-error.png){.sz80p} {.center}

Instead of committing the entry, the conductor passes this error message back to the client instead of whatever the `publish_word` function's return value was.
:::

You can see that author-side validation is similar to how data validation works in a traditional client/server app: if something is wrong, the validation logic sends an error message back to the application logic, which can handle it as it sees fit (for example, parsing the error and asking the user to fix the invalid fields).

### Peer validation

When an authority **receives an entry for validation**, the flow is different. The authority doesn't just assume that the author has already validated the data; she could easily have hacked her conductor to bypass validation rules. It's the authority's duty and right to treat every piece of data as suspect until they can personally verify it. Fortunately, they have their own copy of the validation rules.

Here are the two scenarios above from the perspective of a DHT authority.

#### Valid entry

::: coreconcepts-storysequence
![](/assets/img/concepts/7.10-gossip-to-authorities.png){.sz80p} {.center}

As authorities for the address `E`, Diana and Fred receive a copy of a store-entry operation that stores the `"eggplant"` entry at that address.

![](/assets/img/concepts/7.11-authorities-validate.png){.sz80p} {.center}

Their conductors call the appropriate validation function.

![](/assets/img/concepts/7.12-hold.png){.sz80p} {.center}

The operation is valid, so they store the entry and action in their personal DHT stores, along with their **validation receipts** attesting its validity.

![](/assets/img/concepts/7.13-respond-validation-receipts.png){.sz80p} {.center}

They both send a copy of their receipts back to Alice. Later on, they share the operation with their neighbors for resilience.
:::

!!! note Multiple operations for each action
You may remember from our [exploration of the DHT](../4_dht/) that the 'store entry' operation is only one of three produced by the action that Alice committed to her chain. The 'store record' and 'register agent activity' operations are validated by other authorities, and the validation function may contain slightly different logic for each of them based on the nature of the operation --- for instance, the 'store record' authority may not care about the number of words in the entry, but may care whether the author has been granted permission to add new words to the DHT. Ultimately, all authorities can retrieve all record data for an operation, along with all source chain data preceding that record, but it may make sense to distribute the work in ways that are appropriate for each operation.
!!!

#### Invalid entry

Let's say Alice has taken off her guard rails --- she's hacked her Holochain software to bypass the validation rules.

::: coreconcepts-storysequence
![](/assets/img/concepts/7.14-gossip-to-authorities.png){.sz80p} {.center}

Norman and Rosie receive a copy of Alice's 'store entry' operation for `"orca whales"`.

![](/assets/img/concepts/7.15-validate.png){.sz80p} {.center}

Their conductors call the validation function.

![](/assets/img/concepts/7.16-warrant.png){.sz80p} {.center}

The operation is invalid. They create, sign, and store a **warrant** (a claim that the operation is invalid).

![](/assets/img/concepts/7.17-gossip-warrant.png){.sz80p} {.center}

Norman and Rosie add Alice to their permanent block lists and remove her data from their DHT shards. When anyone asks for the data at the entry's address, they return the warrant instead.

![](/assets/img/concepts/7.18-ejection.png){.sz80p} {.center}

Eventually, everyone knows that Alice is a 'bad actor' who has hacked her app. They all ignore her whenever she tries to talk to them, which effectively ejects her from the DHT.

!!! info What happens when an agent receives a warrant instead of data?
Currently only validation authorities permanently block authors for invalid data; a future release of Holochain will also allow non-authorities to store a warrant they've received and use it as justification for taking personal defensive action against the warranated agent. This will likely look like challenging the warranted agent to produce the potentially invalid data on first contact, then blocking them if the data is indeed valid or warranting the authority if the data is valid and the warrant is erroneous.
!!!

:::

## Use cases for validation

The purpose of validation is to **empower a group of individuals to hold one another accountable to a shared set of rules**. This is a pretty abstract claim, so let's break it down into a few categories. With validation rules, you can define things like:

* **Access membranes** --- validation rules on the **membrane proof** govern who's allowed to join a DNA's network and see its data.
* **The shape of valid data** --- validation rules on **entry and link types that hold data** can check for properly structured data, upper/lower bounds on numbers, string lengths, non-empty fields, or correctly formatted content.
* **Rules of the game** --- validation rules on **connected graph data**, including the history in the author's source chain and entries [countersigned](../10_countersigning) with others, can make sure chess moves, transactions, property transfers, and votes are legitimate.
* **Privileges** --- validation rules that focus on the type of action (**[create](../4_dht), [update, or remove](../6_crud_actions)**) can define who gets to do what.
* **Rate limiting** --- each CRUD action has a **weight** field that, along with the timestamp, entry/link type, and source chain history, can be used to create a validation rule that rejects actions if they're costly and are written too frequently.

## Guidelines for writing validation rules

It's already been mentioned, but it bears repeating: validation functions are [**deterministic**](https://en.wikipedia.org/wiki/Deterministic_algorithm) and [**pure**](https://en.wikipedia.org/wiki/Pure_function), returning a clear yes/no answer for a given operation no matter who executes them. The only exception is when data upon which the validation depends can't be retrieved, in which case the result is inconclusive and the validation will be tried again later.

A record contains an action taken by an agent, so the validation function's job is to decide whether they ought to have taken the action _at that point in time_. This means validation functions are only appropriate when all necessary data is available and referenced, either directly or transitively, by the data contained in the operation. This can include both the reference to the previous source chain record, from which the agent's entire history can be rebuilt, as well as data explicitly referenced by hash in the content of the record. This makes it challenging to implement validation for cases where a privilege may be revoked, unless each action that exercises that privilege is signed by the agent who holds the power to revoke that privilege.

If an agent is committing a record to their source chain that depends on DHT data, it's **their job to make sure those references exist at commit time and explicitly reference them**. The validation function doesn't need to revalidate those dependencies, though; Holochain will use its own heuristics to determine the trustworthiness of other validators' claims when it retrieves them. This lets you write 'inductive' validation rules --- algorithms that only check an operation's validity in the context of its _immediate dependencies only_, assuming that, if those validators report no problems, they've applied the same inductive reasoning. Inductive validation is especially useful for data that has a large graph of dependencies behind it.

Soft things which normally require human discretion, like content moderation and code-of-conduct enforcement, are also challenging to encode unambiguously, especially when they lack the context in which the interaction is happening. In the future, coordinator zomes will be able to create revocable app-level warrants that can be used to non-definitively block an agent from a network. This is also useful for non-threat scenarios, for instance in cases where an employee resigns from a company on good terms and needs to be removed from the company's applications.

## Things that aren't quite validation but almost are

There are certain validation-like things that either fall outside the constraints of determinism necessary for validation functions, or are similar to validation but don't result in an immune response.

### Genesis self-check

A **genesis self-check** function can be defined in your integrity zomes. Its job is to 'pre-validate' an agent's membrane proof before she joins a network, to prevent her from accidentally committing a membrane proof that would forever bar her from joining the network.

This function exists because it may require DHT access to fully check the validity of a membrane proof, but the newcomer isn't yet part of the network when they attempt to publish their membrame proof action. So this function verifies as much as it can without network access.

If the self-check fails, the cell fails to be created and the rest of the cells in the hApp are disabled. Then an error is passed back to the system that's trying to install the app (usually this is the [Holochain Launcher](https://github.com/holochain/launcher), which will then show an error message to the user.

### Source chain forks

We discussed this situation, in which an agent attempts to create two parallel histories, in the [section on the DHT](../4_dht/#detecting-attempts-to-rewrite-history) and their attempt is recorded by the agent activity authorities. It's not quite deterministic validation, because authorities who haven't yet seen the parallel chains will rightly judge their view of the source chain to be valid. In fact, even for the authority who _can_ see the parallel chains, each one may be internally valid; it's the presence of the two that isn't allowed.

In the future, Holochain may support temporarily blocking agents who fork their source chains, but this will need to be done cautiously as forks may also be caused by innocent behavior such as restoring one's hard drive from a backup that didn't contain the most recent source chain records.

### Application-level blocking

Some reasons for ejecting an agent from a network simply shouldn't be encoded in a validation function, either because they require human discretion, would need too much processing power to validate properly, or aren't the result of an invalid action. These can include things like an employee's departure from a company, behavior that violates a community's code of conduct, or disturbing images and videos. These **application-level blocks** can also be temporary, so they can be lifted if someone is to be reinstated into a network. Holochain's host SDK provides **block** and **unblock** functions for these purposes, and you can use these functions to build 'soft' immune responses.

## Key takeaways

* Validation rules are the most important part of a Holochain DNA, as they define the core domain logic that comprises the 'rules of the game'.
* Validation supports intrinsic data integrity, which upholds the security of a Holochain app.
* Validation rules can be written for an agent's entry into an application, the shape and content of data, rules for interaction, write permissions, and write throttling.
* An author validates their own entries before committing them to their source chain or publishing them to the DHT.
* All public entries on the DHT are subject to third-party validation before they're stored. This validation uses the same rules that the author used at the time of commit.
* If all data upon which a validation depends can be retrieved, the result of a validation function is a clear yes/no result. It proves whether the author has hacked their software to produce invalid entries.
* If some data dependencies can't be retrieved from the DHT, the conductor will fail with an 'unresolved dependencies' error and try again later.
* If the validity of an operation depends on existing DHT data, a validating agent can generally trust in the existing validation results on those dependencies instead of having to revalidate them.
* Validation rules are functions that analyze the content of an operation and return either a success or error message, or 'unresolved dependencies' if not all of the data the operation depends on can be retrieved.
* Validation functions are deterministic and pure, and should also cover all possible input values.
* When an operation is found to be invalid, the validator creates a warrant, which attests that the author is writing corrupt data.
* Agents can use warrants as grounds for blocking communication with a corrupt agent and deleting their data.
* Some scenarios can't be covered by validation:
    * Membrane self-checking occurs before an agent joins a network, so it may comprise a reduced set of checks that don't involve dependencies from the DHT.
    * Source chain forks are non-deterministic, so they can only be detected, not warranted against.
    * Application-level blocking and unblocking can be used to provide an immune-like response when there are non-deterministic or non-adversarial reasons for blocking an agent.

!!! learn Learn more
* [Wikipedia: Deterministic algorithm](https://en.wikipedia.org/wiki/Deterministic_algorithm)
* [Wikipedia: Pure function](https://en.wikipedia.org/wiki/Pure_function)
* [Wikipedia: Total function](https://en.wikipedia.org/wiki/Partial_function#Total_function)
* [Wikipedia: Monotonicity of entailment](https://en.wikipedia.org/wiki/Monotonicity_of_entailment), a useful principle for writing validation functions that update entries without invalidating old ones
* [Wikipedia: Byzantine fault](https://en.wikipedia.org/wiki/Byzantine_fault), describing the nature of failures among nodes in a distributed computing system
!!!

### Next Up

[Explore calls & capabilities →](../8_calls_capabilities/){.btn-purple}