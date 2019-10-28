# 7: Validating data

> Holochain applications specify **validation rules** for every type of entry or link. This empowers end-users to **check the integrity** of the data they see. When called upon to validate data, it allows them to identify corrupt peers and publish a **warrant** against them.

![](https://i.imgur.com/4iiJiZn.jpg)

You may recall, from way back at the beginning, that Holochain's first pillar of trust is [**intrinsic data integrity**](../1_the_basics). We said that each type of [**app entry**](../3_private_data#Source-chain-your-own-data-store) can contain any sort of string data whose correctness is determined by custom **validation rules**. Then we showed how [**peer validators**](../4_public_data_on_the_DHT#A-cloud-of-witnesses) subject entries to those same rules before accepting them.

If you're using our [Rust HDK](https://developer.holochain.org/api/latest/hdk/), you can create basic validation rules with built-in tools that let you define app entries as [structs](https://doc.rust-lang.org/rust-by-example/custom_types/structs.html), which can be converted to JSON and back again. This enforces a data schema for each type of app entry. But apps can (and should) define more finely-grained rules too.

The purpose of validation is to **empower a group of individuals to hold one another accountable to a shared agreement**. This is a pretty abstract claim, so let's break it down into a few categories. With validation rules, you can define:

* **The shape of valid data**---upper/lower bounds on numbers, non-empty fields, or correctly formatted email addresses
* **Rules of the game**---traditional games like Chess, or socioeconomic games like currencies, supply chains, and voting systems
* **Write privileges**---enforcing permissions for [creating](../4_public_data_on_the_DHT), [updating, and removing](../6_modifyin_and_deleting_data) entries and links
* **Entry membranes**---who's allowed to join the network

_Because every participant in this app holds a copy of the validation rules, everybody has the power to hold their peers to them._ As a user, you can refuse to participate in a fraudulent interaction. As a peer validator, you can blow the whistle on others who are committing fraud. When all these actions are aggregated, they allow a collection of individuals to form a self-policing network---a social organism with its own **immune system**.

#### Learn more

* [Guidebook: Validate Agent](../../guide/zome/validate_agent)

[Tutorial: **MicroBlog140** >](#)
[Tutorial: **ForgivingMicroBlogWithWriteControl** >](#)
[Next: **Handling data conflicts with CRDTs or resolution callbacks** >>](../8_resolution_callbacks)
