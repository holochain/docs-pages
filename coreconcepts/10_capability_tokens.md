# 10: Securing And Delegating Access To Zome Functions With Capability Tokens

> Holochain empowers individuals to control who or what accesses their DNA instances through **capability tokens**. This allows them to **delegate their agency** to other agents in the same network.

By now you probably have a good picture of what **agent-centric computing** looks like in practice. You've seen how each agent [controls their own private key](../3_private_data#Agent-identity), which gives them exclusive privilege to [write to their own source chain](../3_private_data#Source-chain-your-own-data-store) using an instance of an [application DNA that lives in the Holochain conductor](../2_application_architecture) on their own machine. You've also seen how they become part of a [network of other users](../4_public_data_on_the_DHT) running the same DNA, contributing some of their storage and processing power in exchange for the security and resilience of [peer validation](../7_validating_data).

Internally, Holochain uses a form of [**capability-based security**](https://en.wikipedia.org/wiki/Capability-based_security) to restrict access and grant privileges to your running DNA instances. Capability-based security lets you be very specific about the resources you're granting access to and the things that can be done with them.

Here's an example from real life.

![](https://i.imgur.com/LmSayIe.jpg)
Alice owns a car which comes with two keys: a regular key and a valet key. The regular key allows its bearer the **capability** to drive the car and open the trunk, while the valet key only grants them the capability to drive the car. These two keys are like **capability tokens**, and they let Alice **grant** or **delegate** their powers to anyone she likes.

![](https://i.imgur.com/iQpcf0E.jpg)
Alice is married to Bob, and she trusts him to treat her car nicely. She makes a copy of both keys and gives them to him. Now Bob can drive the car and open the trunk too. Alice knows he can also grant these capabilities to anyone by lending them his keys, but she knows he's a good judge of character.

![](https://i.imgur.com/s83Cv2G.jpg)
Alice and Bob are holidaying on their tenth anniversary. They stop at a hotel for the night. Alice gives the valet key to Charlie, the parking attendant at the hotel. This grants him the capability to drive the car but not open the trunk. While he can in theory do all sorts of nasty things with this capability, in reality there are **conditions** on this grant: Alice expects to get the key back in the morning, it's stamped with 'DO NOT COPY', and Charlie could lose his job if he lets his friend take the car out for a joyride.

We think this is such a robust security model that we're making it available for you to use in your applications.  The basic mechanics of granting, revoking, using, and verifying capabilties are already implemented, but what you do with them is up to you. You could use them for:

* allowing a ['ghost writer'](https://en.wikipedia.org/wiki/Ghostwriter) to to publish a blog post under your name
* granting your doctor and your hospital access to private entries on your source chain
* defining a small group of agents who are allowed to change a global variable on the DHT, and periodically changing the membership

It's important to make sure that the scope of the capability is well-defined. Remember the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege): delegate enough authority to get the job done, and no more.

That's why **conditions** are important. You may want your capability to be used only once, or only within the next two weeks, or only on a certain resource. Holochain gives you one built-in condition: the ability to restrict who can use a given capability. It can be granted to either:

![](https://i.imgur.com/3rhtnzI.jpg)
* Everyone on the DHT (a **public** grant), which would be like gluing the key into the car's ignition.

![](https://i.imgur.com/IxVbmwg.jpg)
* Anyone who holds the token (a **transferable** grant), which would be like the example above.

![](https://i.imgur.com/FMk4DXQ.jpg)
* Specific agents (an **assigned** grant), which would be like embedding a fingerprint reader into the key.

In order for a grantee to use a capability, the grantor must be online, because it represents the authority to access a resource in the grantor's control. Because of this, it usually makes sense to use node-to-node messaging to share capability tokens and exercise claims against them.

A capability grant is a special system entry type that lives in your source chain, but you can add your own content to it. This is where you would put information necessary to define the specific resources and conditions that are relevant to your app.

[Tutorial: **DelegatedMicroBlog** >](#)
[Next: **Securing Access to DNA Instances With Membranes** >>](../11_membranes)

###### tags: `Holochain Core Concepts`
