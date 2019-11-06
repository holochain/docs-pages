# 07: Validating data

<div class="coreconcepts-intro" markdown="1">
Holochain applications specify **validation rules** for every type of entry or link. This empowers end-users to **check the integrity** of the data they see. When called upon to validate data, it allows them to identify corrupt peers and publish a **warrant** against them.
</div>

<div class="coreconcepts-orientation" markdown="1">
## What you'll learn

* [Why validation matters](#validation-the-beating-heart-of-holochain)
* [What happens when validation fails](#validation-flow-success-and-failure)
* [What validation rules can be used for](#use-cases-for-validation)
* [How a validation rule is defined](#how-validation-rules-are-defined)
* [What makes a good validation rule](#guidelines-for-writing-validation-rules)

## Why it matters

Data validation rules are the core of a Holochain app. They deserve the bulk of your attention while you're writing your DNA.
</div>

![](https://i.imgur.com/4iiJiZn.jpg)

## Validation: the beating heart of Holochain

Let's review what we've covered so far.

1. Holochain is a framework for building apps that let peers directly share data without needing the protective oversight of a central server.
2. How does it do this? You may recall, from [way back at the beginning](../1_the_basics) of this series, that Holochain's two pillars of trust are **intrinsic data integrity** and **peer validation**. The first pillar defines what valid data looks like, and the second pillar uses the rules of the first pillar to defend users and the whole network.
3. We said that each type of [**app entry**](../3_private_data#source-chain-your-own-data-store) can contain any sort of string data whose correctness is determined by custom **validation rules**.
4. Then we showed how [**peer validators**](../4_public_data_on_the_DHT#a-cloud-of-witnesses) subject entries to those rules and spread news of bad actors.

Holochain is the engine that moves data around, validates it, and takes action based on validation results. Your DNA is simply a collection of functions for creating data, and validation rules for checking that data. But those two things are critical to the success of your app, because they define the membranes of safety between user and DHT. Well-designed validation rules protect everyone, and buggy validation rules leave them vulnerable.

Some entries can be quite computationally expensive to validate. In a currency app, for example, the validity of a transaction rests on the account balances of both transacting parties, which is the sum of all their prior transactions. But the validity of each of those transactions depends on the account balance at the time, plus the validity of the account balance of the people they transacted with, and so on and so on. The data is deeply interconnected; it could take forever to call up every single transaction and validate it. This is annoying when you're waiting in a checkout line.

But the DHT offers a shortcut: it remembers the validation results of existing entries. You can just ask the validators of the parties' previous transactions if they detected any problems. You can assume that they have done the same thing for the transaction prior to those, and so on. As long as you trust a decent portion of your peers to be following the same rules as you, the validity the most recent entry 'proves' the validity of all the entries before it.

## Validation flow: success and failure

Each validation function returns either true or false, with an optional error description. They're called in two different scenarios, each with different consequences.

### Authoring

When you **commit an entry**, your Holochain conductor is responsible for making sure you're playing by the rules. This protects you from publishing any invalid data that could make you look like a bad actor. Let's use a microblog app as an example. The rules are:

* Posts must have a timestamp, an author ID, and of course a message field.
* The message field must be 140 characters or less, because old school Twitter is cool.

1. Alice types a message into her UI and presses 'Post'.
2. Her UI combines her message with a timestamp and makes a zome call to the DNA's `publish_post` zome function.
3. The `publish_post` function gets her agent ID, combines it with the message and timestamp, and asks the conductor to `commit` it as an entry of type `post`.
4. Alice's conductor calls the DNA's validation function for the `post` entry type.
5. If her message is 140 characters or less and has a timestamp and author ID, the entry is valid. Her conductor commits the entry to her source chain, publishes it to the DHT, and returns the new entry's address to the `publish_post` function.
6. If her message is 141 characters or more or is missing one of the extra fields, the validation function returns an error message. The conductor passes this message back to the `publish_post` function.
7. The function handles the validation result by returning it to the UI for processing.

This isn't all that different from how form validation works in a client/server architecture.

### Validation

When your node **receives an entry for validation**, the flow is very different. Your Holochain node doesn't just assume that the author has already validated the data; they could easily have hacked their conductor to bypass validation rules. It's your duty and right to treat every piece of data as suspect until you can prove otherwise. Fortunately, you have your very own copy of the validation rules that the author was supposed to run.

1. Bob and Carol receive a copy of Alice's entry for validation and storage.
2. Their conductors call the `post` entry type's validation function.
3. If the entry is **valid**, they store it in their personal shard of the DHT, along with their signatures that attest to its validity. They then send a copy of their validation signatures back to Alice.
4. If the entry is **invalid**, they create a **warrant** that contains the evidence (the invalid entry) along with their signature attesting to its invalidity.
5. Bob and Carol then add Alice to their blacklists and share the warrant with their neighbors, who add her to _their_ blacklists and pass it on.
6. Eventually everyone knows that Alice is a 'bad actor' who has hacked her app. She is effectively ejected from the system.

## Use cases for validation

The purpose of validation is to **empower a group of individuals to hold one another accountable to a shared set of rules**. This is a pretty abstract claim, so let's break it down into a few categories. With validation rules, you can define:

* **Access membranes**---validation rules on the **agent ID entry** control who's allowed to join a DNA's network and see its data.
* **The shape of valid data**---validation rules on **entry and link types that hold data** can enforce upper/lower bounds on numbers, string lengths, non-empty fields, or correctly formatted email addresses
* **Rules of the game**---validation rules on **entry and links types that hold details about an action** can make sure chess moves, transactions, property transfers, and votes are legitimate.
* **Privileges**---validation rules on **[create](../4_public_data_on_the_DHT), [update, or remove](../6_modifying_and_deleting_data) actions** on entries and links can define who gets to do what.

## How validation rules are defined

If you're using our [Rust HDK](https://developer.holochain.org/api/latest/hdk/), your validation rule for any entry or link type is simply a function that takes a string, analyzes it, and returns a result (`Ok` or an error message).

But it's annoying to hand-roll your own string parsing and deserialization code. So the HDK lets you declare that your function only accepts a [struct](https://doc.rust-lang.org/rust-by-example/custom_types/structs.html) of your own creation. If it sees this sort of function, will automatically assume that the entry content is JSON and try to deserialize it into an instance of that struct. If it can't make the conversion, validation fails before your function is even called. This lets you forget about the low-level details and work with your app's native types.

## Guidelines for writing validation rules

* Consider the regions of your application domain that **require unambiguous decisions** about what constitutes valid or invalid data---the rules without which the integrity of your application would fall apart or be subject to exploitation.
* They are **hard boolean rules**, meant to be used as evidence that an agent has tampered with their Holochain software. This means they aren't appropriate for soft things like codes of conduct that usually require human discretion.
* They should be **deterministic**: they should never return different results for one entry, regardless of who's validating it, when they're validating it, and what new information has been produced since it was published.
* They should be **pure**: they shouldn't rely on any context such as time of day, the agent ID of the validator, or the current state of the DHT. This will help make them deterministic.
* They should be **total**: they should define a result for the entire range of inputs---empty sets, negative numbers, and other base or edge cases should be accounted for.
* Nothing can be invalidated once it's been published and validated. But just as with [updating or deleting entries](../6_modifying_and_deleting_data), you can write new data that supersedes existing data.

## Learn more

* [Guidebook: Validate Agent](../../guide/zome/validate_agent)
* [HDK Reference: Entry validator callback](https://developer.holochain.org/api/v0.0.34-alpha1/hdk/entry_definition/struct.validatingentrytype#structfield.validator)
* [HDK Reference: Link validator callback](https://developer.holochain.org/api/v0.0.34-alpha1/hdk/entry_definition/struct.validatinglinkdefinition#structfield.validator)
* [Wikipedia: Monotonicity of entailment](https://en.wikipedia.org/wiki/Monotonicity_of_entailment), a useful principle for writing validation functions that update entries without invalidating old ones