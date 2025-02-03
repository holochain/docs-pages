---
title: "Genesis Self-Check Callback"
---

::: intro
To enforce access control for a network, a DNA can require a [**membrane proof**](/concepts/3_source_chain/#source-chain-your-own-data-store), which is a piece of data that gets entered by the user and written to their [**source chain**](/concepts/3_source_chain/). The `genesis_self_check` function can guard against user entry error and help prevent them from being banned from the network accidentally.
:::

## Membrane proof: a per-agent joining code for a network

If your network needs to enforce membership control, your [`validate` callback](/build/validate-callback/) can check the contents of the [`AgentValidationPkg`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.AgentValidationPkg) record. This [**genesis record**](/resources/glossary/#genesis-records) contains data that's entered by the user on app installation. If validators find an invalid proof, they can ban the unauthorized agent from joining the network.

A membrane proof can be basic, like per-agent invite codes, or it can be something complex like a [JSON Web Token (JWT)](https://jwt.io/) signed by an agent that has authority to admit members.

!!! info Membership control isn't implemented yet
This feature is not fully implemented. Currently, validators merely record validation failure for a membrane proof and supply it on request. Our plan is to use membrane proof validation outcomes to admit or block communications from peers.
!!!

## The need for basic pre-validation

Most useful membrane proofs will require access to network data in order to fully validate them. But an agent can't self-validate their own membership proof at genesis time, because they haven't joined the network yet. This creates a minor problem; they may accidentally type or paste their membrane proof wrong, but won't find out until they try to join the network and get ejected.

To reduce the risk, you can define a `genesis_self_check` function that checks the membrane proof before network communications start. This function is limited --- it naturally doesn't have access to DHT data -- but it can be a useful guard against basic data entry errors.

## Define a `genesis_self_check` callback

`genesis_self_check` must take a single argument of type [`GenesisSelfCheckData`](https://docs.rs/hdi/latest/hdi/prelude/type.GenesisSelfCheckData.html) and return a value of type [`ValidateCallbackResult`](https://docs.rs/hdi/latest/hdi/prelude/enum.ValidateCallbackResult.html) wrapped in an `ExternResult`.

Here's an example that checks that the membrane proof exists and is the right length:

```rust
use hdi::prelude::*;

#[hdk_extern]
pub fn genesis_self_check(data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    if let Some(membrane_proof) = data.membrane_proof {
        if membrane_proof.bytes().len() == 32 {
            return Ok(ValidateCallbackResult::Valid);
        }
        return Ok(ValidateCallbackResult::Invalid("Membrane proof is not the right length. Please check it and enter it again.".into()));
    }
    Ok(ValidateCallbackResult::Invalid("This network needs a membrane proof to join.".into()))
}
```

This more complex example deserializes a JWT, checks that its [`sub` (subject) field](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.2) matches the agent's public key, and checks that its [`iss` (issuer) field](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.1) matches an authorized key hard-coded into the DNA's [`properties` block](/build/dnas/#properties). {#jwt-membrane-proof}

```rust
use hdi::prelude::*;

// A type for deserializing a JWT payload from our membrane proof.
#[derive(Serialize, Deserialize)]
pub struct MembraneProofJwtPayload {
    pub iss: AgentPubKeyB64,
    pub sub: AgentPubKeyB64,
}

// A type for deserializing the DNA properties that this integrity zome needs.
#[dna_properties]
pub struct DnaProperties {
    membrane_proof_signing_authority: AgentPubKeyB64,
}

#[hdk_extern]
pub fn genesis_self_check(data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    if let Some(membrane_proof) = data.membrane_proof {
        // A JWT is three JSON objects, Base64 urlencoded, and concatenated
        // with periods. Let's break it apart, decode, and deserialize it.
        let parts: Vec<&str> = std::str::from_utf8(membrane_proof.bytes())
            .map_err(|e| wasm_error!(e.to_string()))?
            .split(".")
            .collect();
        let payload_encoded = parts[1];
        let payload_decoded = base64_url::decode(payload_encoded)
            .map_err(|e| wasm_error!(e.to_string()))?;
        let payload_string = std::str::from_utf8(&payload_decoded)
            .map_err(|e| wasm_error!(e.to_string()))?;
        let payload: MembraneProofJwtPayload = serde_json::from_str(payload_string)
            .map_err(|e| wasm_error!(e.to_string()))?;

        // Now that we've got that, compare it against the public key of the
        // agent submitting the membrane proof.
        if payload.sub != data.agent_key.into() {
            return Ok(ValidateCallbackResult::Invalid("Author's public key doesn't match membrane proof".into()));
        }

        // And against the DNA's authorized membrane proof signer.
        if payload.iss != DnaProperties::try_from_dna_properties()?.membrane_proof_signing_authority {
            return Ok(ValidateCallbackResult::Invalid("Membrane proof issuer is unrecognized".into()));
        }
    }
    Ok(ValidateCallbackResult::Invalid("This network needs a membrane proof to join.".into()))
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