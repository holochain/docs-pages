---
title: "Validation: Assuring Data Integrity"
---

::: coreconcepts-intro
Holochain DNAs specify **validation rules** for every type of entry or link. This empowers agents to check the integrity of the data they see. When called upon to validate data, it allows them to identify corrupt peers and publish a **warrant** against them.
:::

::: coreconcepts-orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Why validation matters](#validation-the-beating-heart-of-holochain)
2. [How complex validations can be sped up](#remembering-validation-results)
2. [What happens when validation fails](#validation-flow-success-and-failure)
3. [What validation rules can be used for](#use-cases-for-validation)
4. [How a validation rule is defined](#how-validation-rules-are-defined)
5. [What makes a good validation rule](#guidelines-for-writing-validation-rules)

### <i class="far fa-atom"></i> Why it matters

Data validation rules are the core of a Holochain app. They deserve the bulk of your attention while you're writing your DNA.
:::

![](/assets/img/concepts/7.1-validation.png)

## Validation: the beating heart of Holochain

Let's review what we've covered so far.

1. Holochain is a framework for building apps that let peers directly share data without needing the protective oversight of a central server.
2. Holochain’s two pillars of integrity are [intrinsic data validity and peer witnessing](../1_the_basics/#how-holochain-does-things-differently). The first defines what correct data looks like, while the second uses the strength of many eyes to detect discrepancies and changes.
3. Each type of app entry can contain any sort of binary data whose correctness is determined by validation rules written into the application.
4. Peer validators use those rules to analyze entries and spread news about bad actors, triggering an immune response in the network.

Holochain is the engine that allows peers to move data around, validate it, and take action based on validation results. **Your DNA is simply a collection of functions for creating, accessing, and validating data.** The design of these functions is critical to the success of your app because they define the membranes of safety between the user and the stuff she receives from others via the DHT. An agent’s running DNA prevents her from creating invalid data and protects her from accepting other people’s invalid data. Well-designed validation rules protect everyone, while buggy validation rules leave them vulnerable.

## 'Remembering' validation results

Some entries can be computationally expensive to validate. In a currency app, for example, the validity of a transaction depends on the account balances of both transacting parties, which is the sum of all their prior transactions. The validity of each of those transactions depends on the account balance at the time, plus the validity of the account balance of the people they transacted with, and so on and so on. The data is deeply interconnected; you don’t want to wait while the coffee shop's payment terminal interrogates half the town's economic history when you’re trying to buy a cup of coffee and get to work.

The DHT offers a shortcut—it remembers the validation results of existing entries. You can ask the validators of the parties’ previous transactions if they detected any problems. You can assume that they have done the same thing for the transaction prior to those and so on. As long as you trust a decent number of your peers to be playing by the rules, the validation results attached to the most recent entry ‘proves’ the validity of all the entries before it.

You can also consult the agent activity authority for any peer you're unsure of. They hold a copy of any past evidence of malicious activity, along with a record of all of the peer's source chain actions that show whether they've tried to change their history.

## Validation flow: success and failure

A validation rule is just a function that receives a record (and any supporting data necessary for validation) and returns success or failure. You'll remember that a record is an _action_, not a thing, so your function is validating whether the record's author should have performed that action.

The validation function is called in two different scenarios, each with different consequences:

* When an agent first authors a record,
* When an authority receives a record for validation.

We’ll carry on with the DHT illustrations from chapter 4 to show what happens when data is written, but let’s add a simple validation rule: the “word” entry type has a validation rule that says that it can only contain one word.


### Authoring

When you **commit an entry**, your Holochain conductor is responsible for making sure you're playing by the rules. This protects you from publishing any invalid data that could make you look like a bad actor.

#### Valid entry

::: coreconcepts-storysequence
1. ![](/assets/img/concepts/7.2-commit.png)
Alice calls the `publish_word` zome function with the string `"eggplant"`. The function commits that word to her source chain. The conductor ‘stages’ the commit in the function’s scratch space and returns the creation action’s record hash to the `publish_word` function. The function continues executing and passes a return value back to the conductor, which holds onto it for now.

2. ![](/assets/img/concepts/7.3-validate.png)
After the function has finished, Alice’s conductor takes this record and calls the DNA’s validation function for the `word` entry type.

3. ![](/assets/img/concepts/7.4-validation-success.png)
The validation function sees only one word, so it returns `Valid`.

4. ![](/assets/img/concepts/7.5-persist-and-publish.png)
Her conductor commits the entry to her source chain, clears out the scratch space, and passes the `publish_word` function’s return value back to the client. The new record is then published to the DHT.
:::

#### Invalid entry

::: coreconcepts-storysequence
1. ![](/assets/img/concepts/7.6-commit.png)
Alice calls the same zome function with the string `"orca whales"`. Again, the function calls `create_entry` and the commit is staged to the scratch space.

2. ![](/assets/img/concepts/7.7-validate.png)
Again, the conductor calls the validation function for the `word` entry type.

3. ![](/assets/img/concepts/7.8-validation-failure.png)
This time, the validation function sees two words. It returns `Invalid("too many words")`.

4. ![](/assets/img/concepts/7.9-return-error.png)
Instead of committing the entry, the conductor passes this error message back to the client instead of whatever the `publish_word` function’s return value was.
:::

You can see that author-side validation is similar to how data validation works in a traditional client/server app: if something is wrong, the business logic rejects it and asks the user to fix it.

### Peer validation

When an authority **receives an entry for validation**, the flow is very different. The authority doesn’t just assume that the author has already validated the data; they could easily have hacked their conductor to bypass validation rules. It’s the authority’s duty and right to treat every piece of data as suspect until they can personally verify it. Fortunately, they have their own copy of the validation rules.

Here are the two scenarios above from the perspective of the DHT.

#### Valid entry

::: coreconcepts-storysequence
1. ![](/assets/img/concepts/7.10-gossip-to-authorities.png)
As authorities for the address `E`, Diana and Fred receive a copy of Alice’s `"eggplant"` entry for validation and storage.

2. ![](/assets/img/concepts/7.11-authorities-validate.png)
Their conductors call the `word` entry type’s validation function.

3. ![](/assets/img/concepts/7.12-hold.png)
The entry is valid, so they store it in their personal shard of the DHT, along with their **validation receipts** attesting its validity.

4. ![](/assets/img/concepts/7.13-respond-validation-receipts.png)
They both send a copy of their receipts back to Alice. Later on, they share the entry and their validation receipts with their neighbors for resilience.
:::

#### Invalid entry

Let's say Alice has taken off her guard rails---she's hacked her Holochain software to bypass the validation rules.

::: coreconcepts-storysequence
1. ![](/assets/img/concepts/7.14-gossip-to-authorities.png)
Norman and Rosie receive a copy of Alice's `"orca whales"` entry.

2. ![](/assets/img/concepts/7.15-validate.png)
Their conductors call the validation function.

3. ![](/assets/img/concepts/7.16-warrant.png)
The entry is invalid. They create, sign, and store a **warrant** (a validation receipt that claims the entry is invalid).

4. ![](/assets/img/concepts/7.17-gossip-warrant.png)
In addition to sharing the warrant with their neighbors, Norman and Rosie also share it with Alice’s agent ID authorities — that is, her neighbors. Now anyone who wants to check up on her can contact those authorities, ask for warrants, and choose to refuse contact with her.

5. ![](/assets/img/concepts/7.18-ejection.png)
Eventually, everyone knows that Alice is a ‘bad actor’ who has hacked her app. They all ignore her whenever she tries to talk to them, which effectively ejects her from the DHT.
:::

## Use cases for validation

The purpose of validation is to **empower a group of individuals to hold one another accountable to a shared set of rules**. This is a pretty abstract claim, so let's break it down into a few categories. With validation rules, you can define:

* **Access membranes**---validation rules on the **agent ID entry** govern who's allowed to join a DNA's network and see its data.
* **The shape of valid data**---validation rules on **entry and link types that hold data** can check for properly structured data, upper/lower bounds on numbers, string lengths, non-empty fields, or correctly formatted content.
* **Rules of the game**---validation rules on **connected graph data** can make sure chess moves, transactions, property transfers, and votes are legitimate.
* **Privileges**---validation rules that focus on the type of action (**[create](../4_dht), [update, or remove](../6_crud_actions)**) can define who gets to do what.

## How validation rules are defined

A validation rule is simply a callback function in your zome code that takes a record and any supporting data required to validate it, analyzes it, and returns a result. The supporting data is called a **validation package**, and it can consist of any prior source chain data necessary to validate the record. The required validation package contents are specified per entry type and can be one of:

* Nothing,
* The **full chain** up to the record,
* **All chain records of the same type** up to the record,
* A **custom package** generated by a special function of your own creation.

Data can also be retrieved from the DHT to support validation. Once it’s done its work, the validation function can return one of three values:

* **Valid**,
* **Invalid**, with a description of what was invalid,
* **Unresolved dependencies**, with a list of the addresses of data it couldn’t retrieve from the DHT.

All actions (create, update, delete) on all entry types (app entries, agent ID entries, and capability grants/claims) can have different validation functions, which follow a ‘cascade’ of specificity. Holochain calls all the matching validation functions it can find for an entry type, starting with the most specific, until one of them returns an error. The cascade for entries looks like this:

1. `validate_<action>_entry_<entry_type>` for specific actions on specific app entry types (e.g., `validate_update_entry_word` will be called for all update actions for entries of type `word`)
2. `validate_<action>_entry` for specific actions on all app entry types produced by the current zome
3. `validate_<action>` for specific actions on all app entry types produced by the current zome, as well as any system entry type produced by any zome in the DNA
4. `validate` for all actions on all app entry types produced by the current zome, as well as any system entry type produced by any zome in the DNA

For instance, you could have two validation functions for the “word” entry type:

1. `validate_create_entry_word` checks that the entry only contains one word.
2. `validate_create_entry` checks general write permissions for all app entry types, including the “word” type.

Links also have their own validation functions, `validate_create_link` and `validate_delete_link`, which are called for any links produced by the current zome. Because links don’t have a type, if you want to apply different validation rules to different types of link, your function will have to switch on different kinds of link based on the base, target, and tag.

## Guidelines for writing validation rules

Validation functions **return a boolean value**, meant to be used as clear evidence that an agent has tampered with their Holochain software. They should be [**deterministic**](https://en.wikipedia.org/wiki/Deterministic_algorithm) and [**pure**](https://en.wikipedia.org/wiki/Pure_function) so that the result for a given commit doesn't change based on who validated it, when they validated it, or what information was available to them at validation time. And nothing should ever be invalidated once it's been published and validated. As mentioned before, a record contains an action taken by an agent, so the validation function's job is to decide whether they ought to have taken the action _at that point in time_. This means validation functions aren't appropriate for soft things, like codes of conduct, which usually require human discretion. 

If an agent is committing a record to their source chain that depends on DHT data, it's **their job to make sure those references exist at commit time and explicitly reference them**. The validation function doesn't need to revalidate those dependencies, though; Holochain will use its own heuristics to determine the trustworthiness of other validators' claims when it retrieves the data.

When validating a record whose validity depends on other data on the DHT, be careful to not introduce subtle sources of non-determinism. The DHT is [eventually consistent](../../glossary/#eventual-consistency), and that means that data either _definitively exists_ or _hasn't been seen yet_ --- there's no way to determine that a piece of data definitively _doesn't_ exist.

For record data that can't be retrieved, the validation function should return 'unresolved dependencies' rather than a validation failure. This signals that the function hasn't failed; it's just waiting for the data to appear.

## Key takeaways

* Validation rules are the most important part of a Holochain DNA, as they define the core domain logic that comprises the 'rules of the game'.
* Validation supports intrinsic data integrity, which upholds the security of a Holochain app.
* Validation rules can cover an agent's entry into an application, the shape and content of data, rules for interaction, and write permissions.
* The result of a validation function is a clear yes/no result. It proves whether the author has hacked their software to produce invalid entries.
* If the validity of an entry depends on existing entries, you can generally trust in the existing validation results on those dependencies rather than revalidating them.
* An author validates their own entries before committing them to their source chain or publishing them to the DHT.
* All public entries on the DHT are subject to third-party validation before they're stored. This validation uses the same rules that the author used at the time of commit.
* Validation rules are functions that analyze the content of an entry and return either a success or error message.
* When an entry is found to be invalid, the validator creates and shares a warrant, which proves that the author is writing corrupt data.
* Agents can use warrants as grounds for blocking communication with a corrupt agent.
* Validation functions should be deterministic and pure.
* An entry can't be found invalid once it's been validated, but new data can be produced to supersede obsolete data.

## Learn more

* [Wikipedia: Deterministic algorithm](https://en.wikipedia.org/wiki/Deterministic_algorithm)
* [Wikipedia: Pure function](https://en.wikipedia.org/wiki/Pure_function)
* [Wikipedia: Total function](https://en.wikipedia.org/wiki/Partial_function#Total_function)
* [Wikipedia: Monotonicity of entailment](https://en.wikipedia.org/wiki/Monotonicity_of_entailment), a useful principle for writing validation functions that update entries without invalidating old ones
