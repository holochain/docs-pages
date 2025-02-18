---
title: "Signals"
---

::: intro
**Signals** are messages emitted by coordinator zomes, either locally to a front end or remotely to another agent cell in a DNA's network. They help you automate processes in your application and make it dynamic and responsive.
:::

## Local signals

**Local signals** are sent to [front ends](/build/connecting-a-front-end/) listening on the agent's local machine.

### Emit a signal

Your coordinator zome emits a signal with the [`emit_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.emit_signal.html) host function. You can call this function from a regular [zome function](/build/zome-functions/) or the [`init`](/build/callbacks-and-lifecycle-hooks/#define-an-init-callback), [`recv_remote_signal`](/build/callbacks-and-lifecycle-hooks/#define-a-recv-remote-signal-callback), or [`post_commit`](/build/callbacks-and-lifecycle-hooks/#define-a-post-commit-callback) callbacks.

This example notifies the agent's local UI of any actions that their cell has written to their source chain, which is useful for building reactive front-end data stores, especially when some actions may be written by [remote calls](/build/calling-zome-functions/#call-a-zome-function-from-another-agent-in-the-network) rather than direct user action. ([Read about the `post_commit` callback](/build/callbacks-and-lifecycle-hooks/#define-a-post-commit-callback) to learn more about hooking into successful writes.)

```rust
use hdk::prelude::*;

// Because you'll probably end up defining multiple local signal message
// types, it's best to define your local signal as an enum of messages.
#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "value", rename_all = "snake_case")]
pub enum LocalSignal {
    ActionWritten(ActionHash),
}

#[hdk_extern(infallible)]
pub fn post_commit(committed_actions: Vec<SignedActionHashed>) {
    // Tell the UI about every action that any function in this zome has
    // written.
    for action in committed_actions {
        let _ = emit_signal(LocalSignal::ActionWritten(action.action_address()));
    }
}
```

This example sets up a 'heartbeat' feature, where peers can periodically ping each other to let them know they're still online.

```rust
use hdk::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "value", rename_all = "snake_case")]
pub enum LocalSignal {
    Heartbeat(AgentPubKey),
}

#[hdk_extern]
pub fn init() -> ExternResult<InitCallbackResult> {
    // Let all agents send heartbeat messages to each other.
    let mut fns = BTreeSet::new();
    fns.insert((zome_info()?.name, "receive_heartbeat".into()));
    create_cap_grant(CapGrantEntry {
        tag: "".into(),
        access: CapAccess::Unrestricted,
        functions: GrantedFunctions::Listed(fns),
    })?;
    Ok(InitCallbackResult::Pass)
}

// An agent's UI calls this function periodically to let others know they're
// online.
#[hdk_extern]
pub fn send_heartbeat(receivers: Vec<AgentPubKey>) -> ExternResult<()> {
    for agent in receivers {
        call_remote(
            agent,
            zome_info()?.name,
            "receive_heartbeat",
            None,
            (),
        )?;
    }
    Ok(())
}

#[hdk_extern]
pub fn receive_heartbeat() -> ExternResult<()> {
    // Find out who called our heartbeat function.
    let caller = call_info()?.provenance;
    // Tell the UI that the caller is still online.
    emit_signal(LocalSignal::Heartbeat(caller))?;
    Ok(())
}
```

### Listen for a signal

The UI subscribes to signals with the [`AppWebsocket.prototype.on`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.on.md) method. The signal handler should expect signals from any coordinator zome in any cell in the agent's hApp instance, and can discriminate between them by cell ID and zome name.

```typescript
import type { Signal, AppSignal, AgentPubKey } from "@holochain/client";
import { SignalType, encodeHashToBase64 } from "@holochain/client";

// Duplicate your zome's signal types in the UI.
type MyZomeSignal =
    | { type: "heartbeat"; content: AgentPubKey }
    | { type: "action_written"; content: ActionHash };

// Use the connection establishment function from
// https://developer.holochain.org/build/connecting-a-front-end/#connect-to-a-happ-with-the-javascript-client
getHolochainClient().then(client => {
    // Subscribe to signals.
    client.on("signal", (signal: Signal) => {
        // There's currently only one useful signal type to listen for -- an
        // app signal.
        if (!(SignalType.App in signal)) return;
        const appSignal = signal[SignalType.App];

        // For now, let's just assume this is a simple hApp with only one DNA
        // (hence one cell), and all we need to discriminate by is the zome
        // name.
        if (appSignal.zome_name != "my_zome") return;
        switch (appSignal.payload.type) {
            case "heartbeat":
                console.log(`agent ${encodeHashToBase64(appSignal.payload.content)} is still online`);
                break;
            case "action_written":
                console.log(`action hash ${encodeHashToBase64(appSignal.payload.content)} written`);
        }
    });
});
```

## Remote signals

Agents can also send remote signals to each other using the [`send_remote_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.send_remote_signal.html) host function and a [`recv_remote_signal` callback](/build/callbacks-and-lifecycle-hooks/#define-a-recv-remote-signal-callback), which takes a single argument of any type and returns `ExternResult<()>`.

This example rewrites and expands the `heartbeat` function above to use remote signals.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut fns = BTreeSet::new();
    // Open up access for the remote signal handler callback to everyone on
    // the network -- see the note after this example.
    fns.insert((zome_info()?.name, "recv_remote_signal".into()));
    create_cap_grant(CapGrantEntry {
        tag: "".into(),
        access: CapAccess::Unrestricted,
        functions: GrantedFunctions::Listed(fns),
    })?;
    Ok(InitCallbackResult::Pass)
}

// Again, it's good practice to define your remote signal type as an enum so
// you can add more message types later.
#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "value", rename_all = "snake_case")]
enum RemoteSignal {
    Heartbeat,
}

#[hdk_extern]
pub fn send_heartbeat(receivers: Vec<AgentPubKey>) -> ExternResult<()> {
    // Now that we're using signals, we can send the same message to multiple
    // remote agents at once.
    send_remote_signal(
        RemoteSignal::Heartbeat,
        agents: receivers
    )
}

#[hdk_extern]
pub fn recv_remote_signal(payload: Signal) -> ExternResult<()> {
    if let RemoteSignal::Heartbeat = payload {
        let caller = call_info()?.provenance;
        emit_signal(LocalSignal::Heartbeat(caller))?;
    }
    Ok(())
}
```

!!! info Remote signal handlers are just zome functions
`send_remote_signal` is sugar for a [remote call](/build/calling-zome-functions/#call-a-zome-function-from-another-agent-in-the-network) to a zome function named  `recv_remote_signal` with no capability secret<!-- TODO: link to capabilities page -->. It works differently from a usual remote call, though, in that it's 'send-and-forget' --- it won't return an error if anything fails. In practice, these two are equivalent:

```rust
fn send_heartbeat(agent: AgentPubKey) -> ExternResult<()> {
    send_remote_signal(RemoteSignal::Heartbeat, agent)
}

fn send_heartbeat_via_remote_call(agent: AgentPubKey) -> ExternResult<()> {
    // Throw away the return value of `recv_remote_signal`, which shouldn't
    // contain anything meaningful anyway.
    let _ = call_remote(
        agent,
        zome_info()?.name,
        "recv_remote_signal",
        None,
        RemoteSignal::Heartbeat
    )?;
    Ok(())
}
```

This means an agent needs to set up an [`Unrestricted` capability grant](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/enum.CapAccess.html#variant.Unrestricted)<!--TODO: link to capabilities page --> for it, so other agents can call it. Take care that this function does as little as possible, to avoid people abusing it. Permissions and privileges are another topic which we'll talk about soon.<!-- TODO: delete this sentence -->

It also means that `send_remote_signal` always routes the call to a coordinator zome of the same name as the caller. Because [the remote agent might map that name to a different coordinator zome, or no zome at all](/build/calling-zome-functions/#remote-call-unknown-routing), this function might be handled in unexpected ways on the receiver's end.
!!!

## Reference

* [`hdk::p2p::emit_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.emit_signal.html)
* [`@holochain/client.AppWebsocket.prototype.on`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.on.md)
* [`hdk::p2p::send_remote_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.send_remote_signal.html)

## Further reading

* [Core Concepts: Signals](/concepts/9_signals/)
<!-- TODO: reference capabilities page -->