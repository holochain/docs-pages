---
title: "Cryptography functions"
---

::: intro
Holochain exposes key generation, signing, and best-practice encryption algorithms for you to use in your hApps.
:::

Because there's no central authority to act as a root of trustworthiness in a peer-to-peer network, most decentralized applications rely on cryptography to prove identity, verify data integrity, and keep data secret. On top of its base cryptographic primitives (key pairs for identity, signed and hashed [source chains](/concepts/3_source_chain/) and [DHT operations](/build/dht-operations/)) Holochain also provides a cryptography API for your zomes.

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

To hash an entry, use the [`hash_entry`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_entry.html) host function. This example shows a basic tagging taxonomy in use:

```rust
use hdk::prelude::*;

#[hdk_entry_helper]
pub struct Tag(String);

let tag = Tag("action/adventure".into());
let tag_hash = hash_entry(tag);
// Now we can use the tag's hash to create a link from it to a movie, or to
// get all action/adventure movies.
```

!!! info Why would you hash an entry?
Usually you have an entry hash and want to retrieve the entry data. When would you have data and want to hash it?

Entries don't need to be written to the DHT in order to serve as a [base or target for links](/build/links-paths-and-anchors/#define-a-link-type). As long as the entry can be reconstructed by anyone who wants to store or retrieve links on its basis address, such as the tag in this example, its hash can also be reconstructed and used in `create_link` or `get_links`, even if there's no entry data at the address. This saves some storage and validation overhead for everyone.

Or you may have just written an entry using `create` or `update` and want to use its hash in the same function call --- rather than retrieving the new written action by its hash to get the entry hash it contains, you can just hash the entry.
!!!

Although it's uncommon to have action data without a hash, you can also hash an action with [`hash_action`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_action.html):

```rust
use hdk::prelude::*;

// The action we're about to construct doesn't necessarily exist...
let imaginary_action = Action::Dna(Dna {
    author: agent_info()?.agent_latest_pubkey,
    timestamp: Timestamp(1743025465_000_000),
    hash: dna_info()?.hash,
});
// ... But if it did, this is what its hash would be:
let imaginary_action_hash = hash_action(imaginary_action)?;
```

### Hash arbitrary data

You can also Blake2b hash any data you like, with any hash length up to 64 bytes, using [`hash_blake2b`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_action.html):

```rust
use hdk::prelude::*;

let hello_hash_16_bit = hash_blake2b("hello".as_bytes().to_vec(), 2)?;
```

There are [other hashing algorithms](https://docs.rs/hdk/latest/hdk/hash/index.html) available:

```rust
use hdk::prelude::*;

let hello_bytes = "hello".as_bytes().to_vec();
let hello_hash_keccak256 = hash_keccak256(hello_bytes.clone())?;
let hello_hash_sha3_256 = hash_sha3(hello_bytes.clone())?;
let hello_hash_sha2_256 = hash_sha256(hello_bytes.clone())?;
let hello_hash_sha2_512 = hash_sha512(hello_bytes.clone())?;
```

## Sign data

### With an agent key

To sign data with an agent's private key, pass the data and the key to to the [`sign`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign.html) or [`sign_raw`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign_raw.html) host functions. `sign_raw` signs a `Vec<u8>` while `sign` accepts anything that can be serialized.

This example lets an administrator of a network create a joining certificate for new members (see the [joining certificate example on the `genesis_self_check` callback page](/build/genesis-self-check-callback/#joining-certificate) for details).

```rust
use hdk::prelude::*;
use base64::prelude::*;
use movies_integrity::*;

#[hdk_extern]
pub fn create_joining_certificate(invitee: AgentPubKey) -> ExternResult<String> {
    // The `DnaProperties` struct comes from the example we linked to above.
    let dna_props = DnaProperties::try_from_dna_properties()?;
    let administrator: AgentPubKey = dna_props.authorized_joining_certificate_issuer.into();
    let my_pub_key = agent_info()?.agent_latest_pubkey;
    if administrator != my_pub_key {
        // Because these entries aren't recorded to a source chain, we can't
        // check for validity in the `validate` callback. Instead, we do some
        // soft validation in this function, to prevent random members from
        // creating certificates that won't work.
        return Err(wasm_error!("You're not the administrator; you're not allowed to create a joining certificate!"));
    }

    let signature = sign(my_pub_key, invitee)?;
    let signature_b64 = BASE64_STANDARD.encode(signature);
    Ok(signature_b64)
}
```

!!! info Signing only works with key pairs in the keystore
Private keys are stored in Holochain's keystore and looked up by their public counterpart. If you pass a public key for a private key that isn't in the keystore, it'll return an error.
!!!

### With an ephemeral key

If you're building a complex authentication or encryption scheme that needs [ephemeral keys](https://www.reference.com/science-technology/role-ephemeral-key-secure-communications), you can use [`sign_ephemeral`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign_ephemeral.html) or [`sign_ephemeral_raw`](https://docs.rs/hdk/latest/hdk/ed25519/fn.sign_ephemeral_raw.html). The host generates a key pair, signs the payloads with it, and discards the private component, returning the public key to the calling zome function.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn sign_data_ephemeral(data: Vec<u8>) -> ExternResult<(AgentPubKey, Signature)> {
    // This function can sign multiple payloads at a time.
    let signed_payload = sign_ephemeral_raw(vec!(data))?;
    // The output signatures are indexed in the same order as the input
    // payloads.
    // Send back the public key so the receiver can verify the signature.
    Ok((signed_payload.key, signed_payload.signatures[0].clone()))
}
```

### Verify a signature

If you have the public key, you can verify a signature against its payload with [`verify_signature`](https://docs.rs/hdk/latest/hdk/ed25519/fn.verify_signature.html) or [`verify_signature_raw`](https://docs.rs/hdk/latest/hdk/ed25519/fn.verify_signature_raw.html). Take a look at the previously mentioned [example from the `genesis_self_check` callback page](/build/genesis-self-check-callback/#joining-certificate) to see it in action.

## Encrypt data

You can encrypt and decrypt data with the [box](https://doc.libsodium.org/public-key_cryptography/sealed_boxes) and [secretbox](https://doc.libsodium.org/public-key_cryptography/authenticated_encryption) algorithms from [libsodium](https://doc.libsodium.org/). We've selected these because they're robust, well-tested, best-practice algorithms that are fairly easy to use properly. This saves you having to implement your own cryptography scheme.

We won't go into the details of which scheme is best to use for which application; instead, we encourage you to read some advice on how to use libsodium. [This article](https://paragonie.com/blog/2017/06/libsodium-quick-reference-quick-comparison-similar-functions-and-which-one-use) is a good starting point.

Holochain keeps all secret material in its own key store so you don't have to keep it safe yourself. We also recommend that, instead of using their agent IDs, all participants generate extra keys specifically for encryption using the [`create_x25519_keypair`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.create_x25519_keypair.html) host function [for better security](https://doc.libsodium.org/quickstart#how-can-i-sign-and-encrypt-using-the-same-key-pair). This function corresponds to libsodium's `crypto_box_keypair` function.

!!! info Encryption is a complex topic
The following examples represent a very basic usage of Holochain's encryption functions to set up secure channels and encrypt/decrypt messages with them. A lot of important parts are left out, and a complete, secure system needs to consider both user experience and best-practice cryptography schemes. The host functions that Holochain provides are merely building blocks.

Also, because they use elliptic curve cryptography, these algorithms (like almost all cryptography systems in use today) could be compromised in the future by a quantum computer. If this is a concern to you, avoid storing encrypted data permanently in a source chain or DHT.
!!!

### Sending encrypted messages between two parties using box

Box encryption is the more straightforward of the two because it doesn't require you to generate and share an encryption key --- instead, the two participants generate a new key pair to use specifically for encryption, share the public component with each other, and use [Elliptic Curve Diffie-Hellman (ECDH)](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman) to generate a shared secret non-interactively. Messages are encrypted and decrypted using the [`x_25519_x_salsa20_poly1305_encrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_25519_x_salsa20_poly1305_encrypt.html) and [`x_25519_x_salsa20_poly1305_decrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_25519_x_salsa20_poly1305_decrypt.html) host functions, which correspond to libsodium's `crypto_box_easy` and `crypto_box_open_easy` functions.

This example receives the public key of a message recipient, creates a key pair for encryption, and encrypts a message for the recipient.

```rust
use hdk::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct EncryptMessageInput {
    pub message: String,
    pub recipient: X25519PubKey,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EncryptedMessage {
    pub message: XSalsa20Poly1305EncryptedData,
    pub sender: X25519PubKey,
}

#[hdk_extern]
pub fn encrypt_message(input: EncryptMessageInput) -> ExternResult<EncryptedMessage> {
    let my_pub_key = create_x25519_keypair()?;
    let encrypted_message = x_25519_x_salsa20_poly1305_encrypt(
        my_pub_key,
        input.recipient,
        input.message.as_bytes().to_vec().into()
    )?;
    Ok(EncryptedMessage {
        message: encrypted_message,
        sender: my_pub_key,
    })
}
```

This example decrypts it on the other end.

```rust
use hdk::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct DecryptMessageInput {
    pub my_pub_key: X25519PubKey,
    pub message: EncryptedMessage,
}

#[hdk_extern]
pub fn decrypt_message(input: DecryptMessageInput) -> ExternResult<String> {
    let maybe_message = x_25519_x_salsa20_poly1305_decrypt(
        input.my_pub_key,
        input.message.sender,
        input.message.message
    )?;
    match maybe_message {
        Some(message) => String::from_utf8(message.as_ref().to_vec()).map_err(|e| wasm_error!(e.to_string())),
        None => Err(wasm_error!("Couldn't decrypt message")),
    }
}
```

### Sending encrypted messages among multiple parties using secretbox

Sending encrypted messages to one or more recipients involves a few more steps:

1. The sender generates a symmetric encryption key and shares it with the recipients over a secure channel with the [`x_salsa20_poly1305_shared_secret_create_random`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_create_random.html) host function.
2. The sender passes the encryption key and the message to the encryption function [`x_salsa20_poly1305_encrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_encrypt.html), which corresponds to libsodium's `crypto_secretbox_easy` function.
3. The sender sends the encrypted message to recipients; this can be done over an insecure channel.
4. The recipients pass the message and the encryption key to the decryption function [`x_salsa20_poly1305_decrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_decrypt.html), which corresponds to libsodium's `crypto_secretbox_open_easy` function.

For step 1, Holochain gives you tools to encrypt the encryption key using [box encryption](#sending-encrypted-messages-between-two-parties-using-box) so it can be shared over an insecure channel, using[`x_salsa20_poly1305_shared_secret_export`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_export.html) and [`x_salsa20_poly1305_shared_secret_ingest`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_ingest.html).

This example generates an encryption key and encrypts a message for multiple recipients, preparing the key for delivery over an insecure channel at the same time.

```rust
use hdk::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct EncryptGroupMessageInput {
    message: String,
    recipients: Vec<X25519PubKey>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EncryptedGroupMessage {
    message: XSalsa20Poly1305EncryptedData,
    sender: X25519PubKey,
    secrets: Vec<(X25519PubKey, XSalsa20Poly1305EncryptedData)>,
}

#[hdk_extern]
pub fn encrypt_group_message(input: EncryptGroupMessageInput) -> ExternResult<EncryptedGroupMessage> {
    // First we need to create an encryption key.
    let secret_ref = x_salsa20_poly1305_shared_secret_create_random(None)?;
    // Because we use the box algorithm to encrypt the encryption key for
    // each recipient, we need a public key of our own.
    let my_pub_key = create_x25519_keypair()?;
    // Now encrypt the secret for each recipient.
    let secrets = input.recipients
        .into_iter()
        .map(|r| {
            let secret_encrypted_for_recipient = x_salsa20_poly1305_shared_secret_export(
                my_pub_key,
                r,
                secret_ref.clone()
            )?;
            Ok((r, secret_encrypted_for_recipient))
        })
        .collect::<ExternResult<Vec<(X25519PubKey, XSalsa20Poly1305EncryptedData)>>>()?;

    // Encrypt the message itself, using the encryption key.
    let encrypted_message = x_salsa20_poly1305_encrypt(
        secret_ref,
        input.message.as_bytes().to_vec().into()
    )?;

    // Return the message and the shared key (individually encrypted to each
    // recipient) to the caller, who will have to distribute the right copy
    // of the key to the right recipient.
    Ok(EncryptedGroupMessage {
        message: encrypted_message,
        sender: my_pub_key,
        secrets,
    })
}
```

This example decrypts the message on the receiving end.

```rust
use hdk::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct DecryptGroupMessageInput {
    pub message: XSalsa20Poly1305EncryptedData,
    pub sender: X25519PubKey,
    pub my_pub_key: X25519PubKey,
    pub my_encrypted_secret: XSalsa20Poly1305EncryptedData,
}

#[hdk_extern]
pub fn decrypt_group_message(input: DecryptGroupMessageInput) -> ExternResult<String> {
    // Decrypt the shared secret encrypted with my public key, which only I
    // can do.
    let secret_ref = x_salsa20_poly1305_shared_secret_ingest(
        input.my_pub_key,
        input.sender,
        input.my_encrypted_secret,
        None
    )?;

    let maybe_message = x_salsa20_poly1305_decrypt(
        secret_ref,
        input.message
    )?;
    match maybe_message {
        Some(message) => String::from_utf8(message.as_ref().to_vec()).map_err(|e| wasm_error!(e.to_string())),
        None => Err(wasm_error!("Couldn't decrypt message")),
    }
}
```

!!! info Where are the nonces?
If you're familiar with the box and secretbox algorithms, you'll know that good, cryptographically secure nonces are important, yet they don't appear anywhere in the code above. That's because Holochain generates a nonce and prepends it to the encrypted payload, then extracts the nonce from the payload when it's being decrypted. This ensures that the encryption isn't weakened by insecure nonce implementations.
!!!

## Reference

* Hashing
    * [`hdk::hash::hash_entry`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_entry.html)
    * [`hdk::hash::hash_action`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_action.html)
    * [`hdk::hash::hash_blake2b`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_blake2b.html)
    * [`hdk::hash::hash_keccak256`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_keccak256.html)
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