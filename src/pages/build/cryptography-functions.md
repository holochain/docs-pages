---
title: "Cryptography functions"
---

::: intro
Holochain exposes key generation, signing, and best-practice encryption algorithms for you to use in your hApps.
:::

Because there's no central authority to act as a root of trustworthiness in a peer-to-peer network, most decentralized applications rely on cryptography to prove identity, verify data integrity, and keep data secret. On top of its base cryptographic primitives (key pairs for identity, signed and hashed [source chains](/concepts/3_source_chain/) and [DHT operations](/build/dht-operations/)) Holochain also provides a cryptography API for your zomes.

## Hash data

To reduce the weight of your compiled zomes, Holochain exposes hashing functions via the host API.

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

* To create a reproducible DHT address as a link base (such as the `"action/adventure"` tag) without needing to ensure that an entry exists at the address, which can create extra DHT data to process. (It's valid to attach a link to an address with no data.)
* To use an entry hash from a previous write in a subsequent write within the same function call, rather than retrieving the entry creation action by its hash to get the entry hash it contains.
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

### Sending encrypted messages without a shared key using box

Box encryption is the more straightforward of the two because it doesn't require you to generate and share an encryption key --- instead, the two participants generate a new key pair to use specifically for encryption, share the public component with each other, and use [Elliptic Curve Diffie-Hellman (ECDH)](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman) to generate a shared secret non-interactively. Messages are encrypted and decrypted using the [`x_25519_x_salsa20_poly1305_encrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_25519_x_salsa20_poly1305_encrypt.html) and [`x_25519_x_salsa20_poly1305_decrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_25519_x_salsa20_poly1305_decrypt.html) host functions, which correspond to libsodium's `crypto_box_easy` and `crypto_box_open_easy` functions.

This example creates a key pair specially for box encryption, then shows how to encrypt and decrypt a message using this key pair and the message recipient's key pair. (In a real-world example, the key pairs would be created by two different parties, then exchanged with each other over an insecure channel. Each party must know the other party's public key in order to communicate.)

```rust
use hdk::prelude::*;

fn create_key_pair() -> ExternResult<X25519PubKey> {
    create_x25519_keypair()
}

fn encrypt_message(
    // The payload to be encrypted can be any vector of bytes; we've chosen a
    // simple string here.
    message: String,
    // Because we may have generated any number of key pairs for encryption,
    // we need to specify which one the recipient expects us to use.
    my_pub_key: X25519PubKey,
    recipient_pub_key: X25519PubKey
) -> ExternResult<XSalsa20Poly1305EncryptedData> {
    x_25519_x_salsa20_poly1305_encrypt(
        // This public key must correspond to a private key stored in our own
        // key store.
        my_pub_key,
        recipient_pub_key,
        message.as_bytes().to_vec().into()
    )
}

fn decrypt_message(
    encrypted_message: XSalsa20Poly1305EncryptedData,
    // As with encryption, we may have created any number of key pairs, so we
    // need to know which one the sender used when they encrypted the message
    // for us.
    my_pub_key: X25519PubKey,
    sender_pub_key: X25519PubKey
) -> ExternResult<String> {
    let maybe_message = x_25519_x_salsa20_poly1305_decrypt(
        // The message may have been encrypted by ourselves or by the other
        // party, and we can still authenticate and decrypt it, but the first
        // argument must correspond to a private key we have in our own key
        // store.
        my_pub_key,
        sender_pub_key,
        encrypted_message
    )?;
    match maybe_message {
        Some(message) => String::from_utf8(
            message.as_ref().to_vec()
        ).map_err(|e| wasm_error!(e.to_string())),
        None => Err(wasm_error!("Couldn't authenticate and decrypt message")),
    }
}
```

### Sending encrypted messages with a symmetric shared key using secretbox

Sending encrypted messages to one or more recipients involves a few more steps. The sender must first generate a symmetric encryption key with the[`x_salsa20_poly1305_shared_secret_create_random`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_create_random.html) host function and share it with the recipient over a secure channel. Then they can encrypt the message with the [`x_salsa20_poly1305_encrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_encrypt.html) host function, which corresponds to libsodium's `crypto_secretbox_easy` function.

On the other side, the recipient passes the message and the encryption key to the decryption function [`x_salsa20_poly1305_decrypt`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_decrypt.html), which corresponds to libsodium's `crypto_secretbox_open_easy` function.

This example revisits the example above with secretbox.

```rust
use hdk::prelude::*;

fn create_shared_key() -> ExternResult<XSalsa20Poly1305KeyRef> {
    // This function doesn't return the shared key. Instead it gives a
    // reference to the shared key, which is stored in Holochain's key store.
    // This reference can be passed to the encryption and decryption
    // functions, which will retrieve it from the key store.
    // You can also pass a value to this function if you want to give a name
    // to the key reference -- an `XSalsa20Poly130KeyRef` simply wraps a
    // `Vec<u8>`.
    x_salsa20_poly1305_shared_secret_create_random(None)
}

fn encrypt_message(
    message: String,
    key_ref: XSalsa20Poly1305KeyRef,
) -> ExternResult<XSalsa20Poly1305EncryptedData> {
    x_salsa20_poly1305_encrypt(
        key_ref,
        message.as_bytes().to_vec().into()
    )
}

fn decrypt_message(
    encrypted_message: XSalsa20Poly1305EncryptedData,
    key_ref: XSalsa20Poly1305KeyRef,
) -> ExternResult<String> {
    let maybe_message = x_salsa20_poly1305_decrypt(
        key_ref,
        encrypted_message
    )?;
    match maybe_message {
        Some(message) => String::from_utf8(message.as_ref().to_vec()).map_err(|e| wasm_error!(e.to_string())),
        None => Err(wasm_error!("Couldn't authenticate or decrypt message")),
    }
}
```

### Create a secure channel for sharing the symmetric key

You'll notice in the above code that the zome never sees the shared key --- it stays in Holochain's key store all the time. So how do you share it with others?

Holochain gives you tools to encrypt and export the encryption key using [box encryption](#sending-encrypted-messages-without-a-shared-key-using-box) so it can be shared over an insecure channel, using[`x_salsa20_poly1305_shared_secret_export`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_export.html) and [`x_salsa20_poly1305_shared_secret_ingest`](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/fn.x_salsa20_poly1305_shared_secret_ingest.html).

This example shows how to output a box-encrypted symmetric key for a given recipient, then decrypt it on the receiving end. (Remember that box encryption requires both the sender and receiver to know each other's public key.)

!!! Keep the symmetric key safe!
While a zome in the recipient's cell could theoretically decrypt the symmetric key using `x_25519_x_salsa20_poly1305_decrypt`, this is extremely risky. **Always use `x_salsa20_poly1305_shared_secret_ingest` instead.** WASM memory is [not a safe place for secrets](https://docs.rs/hdk/latest/hdk/x_salsa20_poly1305/), and we've done [a lot of security-hardening work on our key store](https://leastauthority.com/blog/audits/audit-of-holochain-lair-keystore/) to make it the best place for secrets to be kept.
!!!

```rust
use hdk::prelude::*;

fn output_shared_key_for_recipient(
    // This is the reference received from the `create_shared_key` function
    // above.
    key_ref: XSalsa20Poly1305KeyRef,
    // This key would have come from the `create_key_pair` function from the
    // box encryption example.
    my_pub_key: X25519PubKey,
    recipient_pub_key: X25519PubKey,
) -> ExternResult<XSalsa20Poly1305EncryptedData> {
    x_salsa20_poly1305_shared_secret_export(
        my_pub_key,
        recipient_pub_key,
        key_ref
    )
}

fn accept_shared_key_from_sender(
    encrypted_shared_key: XSalsa20Poly1305EncryptedData,
    my_pub_key: X25519PubKey,
    sender_pub_key: X25519PubKey,
) -> ExternResult<XSalsa20Poly1305KeyRef> {
    // As with the `create_shared_key` example above, this function only
    // returns a reference to the decrypted shared key -- the key itself gets
    // stored safely in Holochain's key store.
    x_salsa20_poly1305_shared_secret_ingest(
        my_pub_key,
        sender_pub_key,
        encrypted_shared_key,
        None
    )
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

* [libsodium: Quick Start](https://doc.libsodium.org/quickstart)
* [libsodium: Public-key Cryptography: Authenticated Encryption](https://doc.libsodium.org/public-key_cryptography/authenticated_encryption)
* [libsodium: Secret-key Cryptography: Authenticated Encryption](https://doc.libsodium.org/secret-key_cryptography/secretbox)