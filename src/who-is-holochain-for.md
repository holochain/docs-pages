# Who is Holochain For?

### Holochain is a smart choice if:

* Your application needs to be accessible despite unreliable network conditions or total loss of connectivity.
* You want adaptive security that minimizes the impact of data breaches and automatically responds to attacks.
* You want to see your application scale automatically and cheaply with user adoption.
* You want to meet strong privacy requirements (e.g., [GDPR](https://medium.com/h-o-l-o/beyond-gdpr-holo-vault-delivering-on-self-sovereign-identity-for-distributed-applications-543a5449d5c9) and [HIPAA](https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act#Privacy_Rule)) without much hassle.
* You want to respect the privacy and agency of your users.
* You want to equip your user communities to own their infrastructure—without having to become system admins.
* You’re exploring more ethical business models and want technology that makes it affordable to embody your values.
* You’re ready to trade some control for technology that puts your users first.
* You’ve tried blockchain, but found it slow, expensive, and hard to tweak for your governance and permissioning needs.

### Holochain might not be ideal if:

* You need true real-time performance---while Holochain has speed advantages over blockchain and in some cases even client/server models, it's optimized for resilience, not immediacy.
* You want an always consistent view of data---Holochain is designed for [eventual consistency](https://en.wikipedia.org/wiki/Eventual_consistency) and availability of read/write operations, not guaranteed consistency.
* Your business model depends on capture and analysis of user data---Holochain spreads data out over many nodes.
* You expect to maintain global oversight over data---Holochain apps empower participants to contribute their own perspectives to a shared data pool.
* You need to maintain a single, authoritative timeline of all events, as with blockchain---Holochain allows individual agents to maintain their own timelines that intersect with each other at key moments.
* You're building a token-based cryptocurrency---while this is possible with Holochain, it goes against its design due to the need for token-based systems' need for single authoritative ledgers.

<div class="h-button-container">
	<a href="../install/" class="h-button">Install Holochain</a>
</div>