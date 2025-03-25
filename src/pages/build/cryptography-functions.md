---
title: "Cryptography functions"
---

::: intro
Holochain exposes key generation, signing, and best-practice encryption algorithms for you to use in your hApps.
:::

Because there's no central authority to act as a root of trustworthiness in a peer-to-peer network, most decentralized applications rely on cryptography to prove identity, verify data integrity, and keep data secret. On top of its base cryptographic primitives (key pairs for identity, signed and hashed [source chains](/concepts/2_source_chain/) and [DHT operations](/build/dht-operations/)) Holochain also provides a cryptography API for your zomes.

## Hash data

To reduce the weight of your compiled zomes, Holochain exposes hashing functions via the host API.

!!! info You can also build native hashing into your zomes
If you want to be able to hash data without calling out to the host, you can build hashing into your zome crate. List the `holo_hash` crate explicitly in your zome's `Cargo.toml` file, and turn on the `hashing` feature:

```diff
...
[dependencies]
hdk = { workspace = true }
serde = { workspace = true }
+ # Replace the following version number with whatever your project is
+ # currently using -- search your root `Cargo.lock` for "holo_hash" to find it.
+ holo_hash = { version = "=0.4.0", features = ["hashing"] }
...
```
!!!

### Hash an action or entry

Holochain's native hashing scheme is Blake2b-256.

To hash an entry, use the [`hash_entry`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_entry.html) host function. This example implements a basic tagging taxonomy:

```rust
use hdi::prelude::*;

#[hdk_entry_helper]
pub struct Tag(String);

#[hdk_entry_types]
#[unit_enum(UnitEntryTypes)]
enum EntryTypes {
    Tag(Tag),
}
```

```rust
use hdk::prelude::*;
use hashtags_integrity::*;

fn get_linked_hashes_for_tag(tag: String, link_type: (ZomeIndex, LinkType)) -> ExternResult<EntryHash> {
    let tag_hash = hash_entry(Hashtag(tag).into())?;
    get_links(GetLinksInput {
        base_address: tag_hash,
        link_type: LinkTypeFilter::Types(vec!((link_type.0, vec!(link_type.1)))),
        GetOptions::default(),
        none,
        none,
        none,
        none
    })
}
```

!!! info Why would you hash an entry?
Usually you have an entry hash and want to retrieve the entry data. When would you have data and want to have it?

Entries don't need to be written to the DHT in order to serve as a [base or target for links](/build/links-paths-and-anchors/#define-a-link-type). As long as the entry can be reconstructed by anyone who wants to store or retrieve links on its basis address, such as the tag in this example, its hash can also be reconstructed and used in `create_link` or `get_links`. This saves some storage and validation overhead for everyone.
!!!

Although it's uncommon to have action data without a hash, you can also hash an action with [`hash_action`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_action.html):

```rust
use hdk::prelude::*;

fn calculate_imaginary_first_genesis_hash_for_myself(timestamp: Timestamp) -> ExternResult<ActionHash> {
    // The action we're about to construct doesn't necessarily exist...
    let imaginary_action = Action::Dna(Dna {
        author: agent_info()?.agent_latest_pubkey,
        timestamp,
        hash: dna_info()?.hash,
    });
    // ... But if it did, this is what its hash would be:
    hash_action(imaginary_action)
}
```

### Hash arbitrary data

You can also Blake2b hash any data you like, with any hash length up to 256 bits, using [`hash_blake2b`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_action.html):

```rust
use hdk::prelude::*;

#[hdk_extern]
fn hash_hello_16_bit() -> ExternResult<Vec<u8>> {
    hash_blake2b("hello".as_bytes().to_vec(), 16)
}
```

There are [other hashing algorithms](https://docs.rs/hdk/latest/hdk/hash/index.html) available:

```rust
use hdk::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct ManyHashes {
    // Used by Ethereum and other EVM blockchains.
    keccak256: Vec<u8>,
    sha3_256: Vec<u8>,
    sha2_256: Vec<u8>,
    sha2_512: Vec<u8>,
}

#[hdk_extern]
fn hash_hello_in_many_ways() -> ExternResult<ManyHashes> {
    let hello_bytes = "hello".as_bytes().to_vec();
    ManyHashes {
        keccak256: hash_keccac256(hello_bytes.clone())?,
        sha3_256: hash_sha3(hello_bytes.clone())?,
        sha2_256: hash_sha256(hello_bytes.clone())?,
        sha2_512: hash_sha512(hello_bytes.clone())?,
    }
}
```

## Sign data

### With an agent key

To sign data with an agent's private key, pass the data and the key to to the [`sign`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign.html) or [`sign_raw`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign_raw.html). `sign_raw` signs a `Vec<u8>` while `sign` accepts anything that can be serialized.

This example lets an administrator of a network create a joining certificate for new members (see the [joining certificate example on the `genesis_self_check` callback page](/build/genesis-self-check-callback/#joining-certificate) for details).

```rust
use hdk::prelude::*;
use base64::prelude::*;
use movies_integrity::*;

#[hdk_extern]
pub fn create_joining_certificate(invitee: AgentPubKey) -> ExternResult<String> {
    // The `DnaProperties` struct comes from the example we linked to above.
    let dna_props = DnaProperties::try_from_dna_properties()?;
    let administrator = dna_props.authorized_joining_certificate_issuer;
    let my_pub_key = agent_info()?.agent_latest_pubkey;
    if (administrator != my_pub_key) {
        // Because these entries aren't recorded to a source chain, we can't
        // check for validity in the `validate` callback. Instead, we do some
        // soft validation in this function, to prevent random members from
        // creating certificates that won't work.
        return Err(wasm_error!("You're not the administrator; you're not allowed to create a joining certificate!"));
    }

    let signature = sign(my_pub_key, invitee)?;
    let signature_b64 = BASE64_STANDARD::encode(signature.into());
    Ok(signature_b64)
}
```

!!! info Signing only works with key pairs in the keystore
Private keys are stored in Holochain's keystore and looked up by their public counterpart. If you pass an unknown public key, it'll return an error.
!!!

### With an ephemeral key

If you're building a complex authentication or encryption scheme that needs [ephemeral keys](https://www.reference.com/science-technology/role-ephemeral-key-secure-communications), you can use [`sign_ephemeral`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign_ephemeral.html) or [`sign_ephemeral_raw`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign_ephemeral_raw.html). The host generates a key pair, signs the payloads with it, and discards the private component, returning the public key to the caller.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn sign_data_ephemeral(data: Vec<u8>) -> ExternResult<(AgentPubKey, Signature)> {
    // This function can sign multiple payloads at a time.
    let signed_payload = sign_ephemeral_raw(vec!(data))?;
    // The output signatures are indexed in the same order as the input
    // payloads.
    Ok((signed_payload.key, signed_payload.signatures[0]))
}
```

### Verify a signature

If you have the public key, you can verify a signature against its payload with [`verify_signature`](https://docs.rs/hdk/latest/hdk/ed25519/fn.verify_signature.html) or [`verify_signature_raw`](https://docs.rs/hdk/latest/hdk/ed25519/fn.verify_signature_raw.html). Take a look at the previously mentioned [example from the `genesis_self_check` callback page](/build/genesis-self-check-callback/#joining-certificate) to see it in action.

## Encrypt data

You can encrypt and decrypt data with the [box](https://doc.libsodium.org/public-key_cryptography/sealed_box) and [secretbox](https://doc.libsodium.org/public-key_cryptography/authenticated_encryption) algorithms from [libsodium](https://doc.libsodium.org/). We've selected these because they're robust, well-tested, best-practice algorithms that are fairly easy to use properly. This saves you having to implement your own cryptography scheme.

We won't go into the details of which scheme is best to use for which application; instead, we encourage you to read some advice on how to use libsodium. [This article](https://paragonie.com/blog/2017/06/libsodium-quick-reference-quick-comparison-similar-functions-and-which-one-use) is a good starting point.

Holochain keeps all secret material in its own key store so you don't have to keep it safe yourself. We also recommend that, instead of using their agent IDs, all participants generate extra keys specifically for encryption using the [`create_x25519_keypair`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.create_x25519_keypair.html) host function [for better security](https://doc.libsodium.org/quickstart#how-can-i-sign-and-encrypt-using-the-same-key-pair), which corresponds to libsodium's `crypto_box_keypair` function.

!!! info These algorithms are not quantum-resistant
While these algorithms represent some of the best in terms of problem-free secure encryption, they aren't quantum-resistant, because they use elliptic curve cryptography. We recommend not storing any encrypted data on the DHT if you're concerned about data being harvested and later decrypted with a quantum computer.
!!!

In the following examples, we'll show you how to establish secure channels using the two algorithms, but we won't show you how to create groups or send messages --- we'll leave that up to you. (You could use [the chat examples from the Cloning page](/build/cloning/), for example.)

### Sending encrypted messages between two parties using box

Sending encrypted messages between two parties is straightforward and doesn't require you to generate and share an encryption key --- instead, the two participants generate a new key pair to use specifically for encryption, share the public component with each other, and use [ECDH](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman) to generate a shared secret non-interactively. Messages are encrypted and decrypted using the [`x_25519_x_salsa20_poly1305_encrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_25519_x_salsa20_poly1305_encrypt.html) and [`x_25519_x_salsa20_poly1305_decrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_25519_x_salsa20_poly1305_decrypt.html) host functions, which correspond to libsodium's `crypto_box_easy` and `crypto_box_open_easy` functions.

This example implements secure direct messaging using the above functions.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn create_secure_direct_message_channel() -> ExternResult<XSalsa20Poly1305KeyRef> {
    // This creates a key pair, stores it in Holochain's key store, and
    // returns the public component as a reference. The caller should store
    // it and use it to encrypt and decrypt messages.
    create_x25519_keypair()
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EncryptDirectMessageInput {
    pub my_public_key: X25519PubKey,
    pub recipient_public_key: X25519PubKey,
    pub message: Vec<u8>,
}

#[hdk_extern]
pub fn encrypt_direct_message(input: EncryptDirectMessageInput) -> ExternResult<XSalsa20Poly1305EncryptedData> {
    let { my_public_key, recipient_public_key, message } = input;
    x_25519_x_salsa20_poly1305_encrypt(
        my_public_key,
        recipient_public_key,
        message.into()
    )
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DecryptDirectMessageInput {
    pub my_public_key: X25519PubKey,
    pub sender_public_key: X25519PubKey,
    pub message: XSalsa20Poly1305EncryptedData,
}

#[hdk_extern]
pub fn decrypt_direct_message(input: DecryptDirectMessageInput) -> ExternResult<Vec<u8>> {
    let { my_public_key, recipient_public_key, message } = input;
    x_25519_x_salsa20_poly1305_decrypt(
        my_public_key,
        sender_public_key,
        message
    ).into()
}
```

### Encrypt and decrypt a message for multiple recipients using secretbox

Sending encrypted messages to one or more recipients involves a few more steps:

1. The sender generates an encryption key and shares it with the recipients over a secure channel with the [`x_salsa20_poly1305_shared_secret_create_random`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_create_random.html) host function.
2. The sender passes the encryption key, the message, and a nonce to the encryption function [`x_salsa20_poly1305_encrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_encrypt.html), which corresponds to libsodium's `crypto_secretbox_easy` function.
3. The sender sends the nonce and the encrypted message to recipients; this can be done over an insecure channel.
4. The recipients pass the message, the nonce, and the encryption key to the decryption function [`x_salsa20_poly1305_decrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_decrypt.html), which corresponds to libsodium's `crypto_secretbox_open_easy` function.

Holochain gives you tools to encrypt the encryption key using [box encryption](#encrypt-and-authenticate-a-message-for-a-single-recipient-using-box) so it can be shared over an insecure channel, using[`x_salsa20_poly1305_shared_secret_export`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_export.html) and [`x_salsa20_poly1305_shared_secret_ingest`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_ingest.html).

This example implements a secure chat channel using secretbox. It's long, but by the time you get to the end of it, you'll have seen every one of the above host functions in use.

```rust
use hdk::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateSecureChatChannelOutput {
    pub secret_ref: XSalsa20Poly1305KeyRef,
    pub my_public_key: X25519PubKey,
}

// First we create a way to generate and distribute the shared secret.

#[hdk_extern]
pub fn create_secure_chat_channel(name: String) -> ExternResult<XSalsa20Poly1305KeyRef> {
    // Store the shared secret using a reference that the caller should use
    // later to encrypt and decrypt messages or add people to the chat.
    let secret_ref = format!("secure_chat_{}", name).as_bytes();
    // In order to encrypt the shared secret for people who want to join, we
    // need to create our own encryption key pair.
    let my_public_key = create_x25519_keypair()?;
    x_salsa20_poly1305_shared_secret_create_random(Some(secret_ref))?;
    Ok(CreateSecureChatChannelOutput {
        // This gets stored by the caller so we can refer to it later.
        secret_ref,
        // This gets stored by the caller and sent to anyone who wants to
        // join.
        my_public_key,
    })
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AddAgentToSecureChatChannelInput {
    pub secret_ref: XSalsa20Poly1305KeyRef,
    // This is the public key of the chat channel creator, generated in the
    // function above.
    pub my_public_key: X25519PubKey,
    pub joiner_public_key: X25519PubKey,
}

#[hdk_extern]
pub fn add_agent_to_secure_chat_channel(input: AddAgentToSecureChatChannelInput) -> ExternResult<XSalsa20Poly1305EncryptedData> {
    let { secret_ref, my_public_key, joiner_public_key } = input;
    // Encrypt the shared secret with the new agent's specially generated key,
    // then send it back to the caller.
    x_salsa20_poly1305_shared_secret_export(
        my_public_key,
        joiner_public_key,
        secret_ref
    )
}

#[derive(Serialize, Deserialize, Debug)]
pub struct JoinSecureChatChannelInput {
    pub name: String,
    pub creator_public_key: X25519PubKey,
    // This is the public key of the agent joining the channel.
    pub my_public_key: X25519PubKey,
    pub encrypted_secret: XSalsa20Poly1305EncryptedData,
}

#[hdk_extern]
pub fn join_secure_chat_channel(input: JoinSecureChatChannelInput) -> ExternResult<XSalsa20Poly1305KeyRef> {
    let { name, creator_public_key, my_public_key, encrypted_secret } = input;
    let secret_ref = format!("secure_chat_{}", name).as_bytes();
    x_salsa20_poly1305_shared_secret_ingest(
        my_public_key,
        creator_public_key,
        encrypted_secret,
        secret_ref
    )
}

// Now that we have an API for establishing a shared secret for chatting, we
// can start sending messages.

#[derive(Serialize, Deserialize, Debug)]
pub struct

#[derive(Serialize, Deserialize, Debug)]
pub struct EncryptChatMessageInput {
    pub message: Vec<u8>,
    pub chat_channel_secret_ref: XSalsa20Poly1305KeyRef,
}

#[hdk_extern]
pub fn encrypt_chat_message(input: EncryptChatMessageInput) -> ExternResult<XSalsa20Poly1305EncryptedData> {
    let { message, chat_channel_secret_ref } = input;
    x_salsa_poly1305_encrypt(
        chat_channel_secret_ref,
        message.into()
    )
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DecryptChatMessageInput {
    pub message: XSalsa20Poly1305EncryptedData,
    pub chat_channel_secret_ref: XSalsa20Poly1305KeyRef,
}

#[hdk_extern]
pub fn decrypt_chat_message(input: DecryptChatMessageInput) -> ExternResult<Vec<u8>> {
    let { message, chat_channel_secret_ref } = input;
    x_salsa_poly1305_decrypt(
        chat_channel_secret_ref,
        message
    ).into()
}
```

!!! info Where are the nonces?
If you're familiar with the box and secretbox algorithms, you'll know that good, cryptographically secure nonces are important, yet they don't appear anywhere in the code above. That's because Holochain generates a nonce and prepends it to the encrypted payload, then extracts the nonce from the payload when it's being decrypted. This ensures that the encryption isn't weakened by insecure nonce implementations.
!!!

## Reference

* Hashing
    * [`hdk::hash::hash_entry`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_entry.html)
    * [`hdk::hash::hash_action`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_action.html)
    * [`hdk::hash::hash_blake2b`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_action.html)
    * [`hdk::hash::hash_keccac256`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_keccac256.html)
    * [`hdk::hash::hash_sha3`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_sha3.html)
    * [`hdk::hash::hash_sha256`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_sha256.html)
    * [`hdk::hash::hash_sha512`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_sha512.html)
* Signing
    * [`hdk::ed25519::sign`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign.html)
    * [`hdk::ed25519::sign_raw`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign_raw.html)
    * [`hdk::ed25519::sign_ephemeral`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign_ephemeral.html)
    * [`hdk::ed25519::sign_ephemeral_raw`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign_ephemeral_raw.html)
    * [`hdk::ed25519::verify_signature`](https://docs.rs/hdk/latest/hdk/ed25519/fn.verify_signature.html)
    * [`hdk::ed25519::verify_signature_raw`](https://docs.rs/hdk/latest/hdk/ed25519/fn.verify_signature_raw.html)
* Encryption
    * [`hdk::x_salsa20_poly1305` module documentation](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/index.html)
    * [`hdk::x_salsa20_poly1305::create_x25519_keypair`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.create_x25519_keypair.html)
    * [`hdk::x_salsa20_poly1305::x_salsa20_poly1305_encrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_encrypt.html)
    * [`hdk::x_salsa20_poly1305::x_salsa20_poly1305_decrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_decrypt.html)
    * [`hdk::x_salsa20_poly1305::x_salsa20_poly1305_shared_secret_create_random`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_create_random.html)
    * [`hdk::x_salsa20_poly1305::x_salsa20_poly1305_shared_secret_export`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_export.html)
    * [`hdk::x_salsa20_poly1305::x_salsa20_poly1305_shared_secret_ingest`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_ingest.html)
    * [`hdk::x_salsa20_poly1305::x_salsa20_poly1305_encrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_encrypt.html)
    * [`hdk::x_salsa20_poly1305::x_salsa20_poly1305_decrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_decrypt.html)

## Further reading

* [libsodium: Public-key Cryptography: Authenticated Encryption](https://doc.libsodium.org/public-key_cryptography/authenticated_encryption)
* [libsodium: Secret-key Cryptography: Authenticated Encryption](https://doc.libsodium.org/secret-key_cryptography/secretbox)