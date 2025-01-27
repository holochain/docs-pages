---
title: "Genesis self-check callback"
---

::: intro
When an agent hasn't yet joined a network, but has written their [**genesis records**](/concepts/3_source_chain/#source-chain-your-own-data-store) to their [**source chain**](/concepts/3_source_chain/), they may not be able to fully validate those records, but still need a way to do basic pre-validation before joining the network. This helps prevent them from being rejected from the network.
:::

## The need for basic prevalidation

Holochain assumes that every agent is able to self-validate all the data they create before storing it in their [source chain](/concepts/3_source_chain/) and publishing it to the [DHT](/concepts/4_dht/). But at **genesis** time, when their cell has just been instantiated but they haven't connected to other peers, they may not be able to fully validate their genesis records if their validity depends on shared data. So Holochain skips full self-validation for these records, only validating the basic structure of their [actions](/build/working-with-data/#entries-actions-and-records-primary-data).

This creates a risk to the new agent; they may mistakenly publish malformed data, have it marked as invalid by their peers, and be ejected from the network.

To reduce the risk, you can define a `genesis_self_check` function that checks the _content_ of genesis records before they're published. This function is limited --- it naturally doesn't have access to DHT data. But it can be a useful guard against a **membrane proof** that the participant typed or pasted incorrectly, for example.

## Membrane proofs

Among the genesis records is the [`AgentValidationPkg`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.AgentValidationPkg) action. It contains a **membrane proof**, a small payload of bytes that the user can give the [conductor](/concepts/2_application_architecture/#conductor) at app installation time. Its job is to serve an agent-specific claim that they're allowed to join the network.

A membrane proof can be basic, like a secret user-specific passcode that's stored on the DHT, or it can be something complex like a [JSON Web Token (JWT)](https://jwt.io/) signed by an agent in the DHT that has authority to admit members.

Both of these use cases require an agent to be able to access network data in order to fully validate the membrane proof. This isn't possible when an agent has just instantiated the DNA. But it is possible to do basic checks, like a valid number of bytes or a JWT that can be deserialized.

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

This example deserializes a JWT and checks that the author's public key is the same as the JWT's subject:

```rust
use hdi::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct MembraneProofJwtPayload {
    pub sub: AgentPubKeyB64,
}

#[hdk_extern]
pub fn genesis_self_check(data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    if let Some(membrane_proof) = data.membrane_proof {
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
        if payload.sub == data.agent_key.into() {
            return Ok(ValidateCallbackResult::Valid);
        } else {
            return Ok(ValidateCallbackResult::Invalid("Author's public key doesn't match membrane proof".into()));
        }

    }
    Ok(ValidateCallbackResult::Invalid("This network needs a membrane proof to join.".into()))
}
```
