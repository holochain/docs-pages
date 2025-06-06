---
title: "Genesis Self-Check Callback"
---

::: intro
To enforce access control for a network, a DNA can require a [**membrane proof**](/concepts/3_source_chain/#membrane-proof), which is a piece of data that gets entered by the user and written to their [**source chain**](/concepts/3_source_chain/). The `genesis_self_check` function can guard against user entry error and help prevent them from being accidentally marked as a bad actor.
:::

## Membrane proof: a joining code for a network

While a [network seed](/build/dnas/#network-seed) acts like a network-wide passcode, you might need to enforce more fine-grained membership control. You can do this by writing validation code for the contents of the[`AgentValidationPkg`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.AgentValidationPkg) record. This [**genesis record**](/resources/glossary/#genesis-records) contains data that the user enters on app installation.

A membrane proof can be basic, like an invite code, or it can be something complex like a signature from an agent that has authority to admit members.

!!! info Membership control isn't implemented yet
This feature is not fully implemented. Currently, validators merely record a validation failure and supply it on request. Our plan is to connect membrane proof validation outcomes to block lists, so agents can reject connection attempts from a peer with an invalid membrane proof.
!!!

## The need for basic pre-validation

Most useful membrane proofs will require access to network data in order to fully validate them. But an agent can't self-validate their own membership proof at genesis time, because they haven't joined the network yet. This creates a minor problem; they may accidentally type or paste their membrane proof wrong, but won't find out until they try to join the network and get blocked by their peers.

To reduce the risk, you can define a `genesis_self_check` function that checks the membrane proof before network communications start. This function is limited --- it naturally doesn't have access to DHT data -- but it can be a useful guard against basic data entry errors.

## Define a `genesis_self_check` callback

`genesis_self_check` must take a single argument of type [`GenesisSelfCheckData`](https://docs.rs/hdi/latest/hdi/prelude/type.GenesisSelfCheckData.html) and return a value of type [`ValidateCallbackResult`](https://docs.rs/hdi/latest/hdi/prelude/enum.ValidateCallbackResult.html) wrapped in an `ExternResult`.

Here's an example that checks that the membrane proof exists and is the right length:

```rust
use hdi::prelude::*;

#[hdk_extern]
pub fn genesis_self_check(data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    if let Some(membrane_proof) = data.membrane_proof {
        if membrane_proof.bytes().len() == 64 {
            return Ok(ValidateCallbackResult::Valid);
        }
        return Ok(ValidateCallbackResult::Invalid("Membrane proof is not the right length. Please check it and enter it again.".into()));
    }
    Ok(ValidateCallbackResult::Invalid("This network needs a membrane proof to join.".into()))
}
```

This more complex example deserializes an Ed25519 signature and checks that it matches the agent's public key and the public key of an agent with the authority to admit members, which is taken from the DNA's [`properties` block](/build/dnas/#use-dna-properties). {#joining-certificate}

```rust
use hdi::prelude::*;
use base64::*;

// A type for deserializing the DNA properties that this integrity zome needs.
// This struct lets a network creator specify who gets to create joining
// certificates.
#[dna_properties]
pub struct DnaProperties {
    // Because the DNA properties are given as YAML, this field should be a
    // string that someone can paste in.
    authorized_joining_certificate_issuer: AgentPubKeyB64,
}

#[hdk_extern]
pub fn genesis_self_check(data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    let Some(membrane_proof) = data.membrane_proof else {
        return Ok(ValidateCallbackResult::Invalid("This network needs a membrane proof to join.".into()));
    }

    // Accept a string, because this is something a user can paste into a
    // form field.
    let Ok(cert: Signature) = std::str::from_utf8(membrane_proof.bytes())
        // Expect it to be Base64-encoded; convert it into raw bytes.
        .and_then(|s| BASE64_STANDARD::decode(s))
        // And then into a Signature.
        .and_then(|b| b.try_into())
    else {
        return Ok(ValidateCallbackResult::Invalid("Couldn't decode membrane proof into joining certificate."));
    }

    // Check the certificate against the signing authority.
    let dna_props = DnaProperties::try_from_dna_properties()?;
    let cert_is_valid = verify_signature(
        dna_props.authorized_joining_certificate_issuer,
        cert,
        data.agent_key
    )?;
    if cert_is_valid {
        return Ok(ValidateCallbackResult::Valid);
    } else {
        return Ok(ValidateCallbackResult::Invalid("Joining certificate wasn't valid. Please try entering it again or asking the certificate issuer for a new one."));
    }
}
```

## Fully validating a membrane proof

Your `validate` callback also needs to validate a membrane proof in order to actually enforce network access. At the very least, it should apply the same rules as `genesis_self_check` does, and add on any checks that require DHT data. We'll explore this in full on the [`validate` callback](/build/validate-callback/#validate-agent-joining) page.

## Reference

* [`holochain_integrity_types::action::AgentValidationPkg`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.AgentValidationPkg)
* [`holochain_integrity_types::genesis::GenesisSelfCheckData`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/genesis/type.GenesisSelfCheckData.html)
* [`holochain_integrity_types::validate::ValidateCallbackResult`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/genesis/type.GenesisSelfCheckData.html)
* [`holochain_derive::dna_properties`](https://docs.rs/hdk_derive/latest/hdk_derive/attr.dna_properties.html)

## Further reading

* [Core Concepts: Genesis self-check](/concepts/7_validation/#genesis-self-check)
* [Build Guide: Validation](/build/validation/)