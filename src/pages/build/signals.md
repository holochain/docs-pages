---
title: "Signals"
---

::: intro
**Signals** are messages emitted by coordinator zomes, either locally to a front end or remotely to another agent cell in a DNA's network. They help you automate processes in your application and make it dynamic and responsive.
:::

## Send-and-forget messages, locally and across the network

There are two kinds of signals: [local](#local-signals) and [remote](#remote-signals). They are both **send-and-forget**; when you call the host function that sends the signal, they don't wait for confirmation from the receiver, and they don't store messages until the receiver is available.

## Local signals

**Local signals** are sent to [front ends](/build/connecting-a-front-end/) listening on the agent's local machine.

### Emit a signal

Your coordinator zome emits a signal with the [`emit_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.emit_signal.html) host function. It takes any serializable input and you can call this function from a regular [zome function](/build/zome-functions/) or the [`init`](/build/callbacks-and-lifecycle-hooks/#define-an-init-callback), [`recv_remote_signal`](/build/callbacks-and-lifecycle-hooks/#define-a-recv-remote-signal-callback), or [`post_commit`](/build/callbacks-and-lifecycle-hooks/#define-a-post-commit-callback) callbacks.

This example notifies the agent's local UI of any actions that their cell has written to their source chain, which is useful for building reactive front-end data stores, especially when some actions may be written by [remote calls](/build/calling-zome-functions/#call-a-zome-function-from-another-agent-in-the-network) rather than direct user action. You can see this pattern in any scaffolded hApp, in the file `dnas/<dna>/zomes/coordinator/<zome>/src/lib.rs`. ([Read about the `post_commit` callback](/build/callbacks-and-lifecycle-hooks/#define-a-post-commit-callback) to learn more about hooking into successful writes.)

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

### Listen for a signal

Holochain emits local signals over active app WebSocket connections, and a client should provide a way to receive these signals. For instance, with the TypeScript client, you can subscribe to signals with the [`AppWebsocket.prototype.on`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.on.md) method. The signal handler should expect signals from _any coordinator zome in any cell_ in the agent's hApp instance, and should discriminate between them by cell ID and zome name.

```typescript
import type { Signal, AppSignal, AgentPubKey } from "@holochain/client";
import { SignalType, encodeHashToBase64 } from "@holochain/client";

// Represent your zome's signal types in the UI.
type MyZomeSignal =
    | { type: "action_written"; value: ActionHash };

// Use the connection establishment function from
// https://developer.holochain.org/build/connecting-a-front-end/#connect-to-a-happ-with-the-javascript-client
getHolochainClient().then(client => {
    // Subscribe to signals.
    client.on("signal", (signal: Signal) => {
        // Signals coming from a coordinator zome are of the `App` type.
        if (signal.type != SignalType.App) return;
        const appSignal = signal.value;

        // For now, let's just assume this is a simple hApp with only one DNA
        // (hence one cell), and all we need to discriminate by is the zome
        // name.
        if (appSignal.zome_name != "my_zome") return;

        const payload: MyZomeSignal = appSignal.payload;
        switch (appSignal.payload.type) {
            case "action_written":
                console.log(`action hash ${encodeHashToBase64(payload.value)} written`);
        }
    });
});
```

## Remote signals

Agents can also send remote signals to each other using the [`send_remote_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.send_remote_signal.html) host function and a [`recv_remote_signal` callback](/build/callbacks-and-lifecycle-hooks/#define-a-recv-remote-signal-callback), which takes a single argument of any type and returns `ExternResult<()>`.

This example implements a 'heartbeat' feature, where agents can periodically ping a small number of friends to let them know they're still online.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut fns = BTreeSet::new();
    // Open up access for the remote signal handler callback to everyone on
    // the network -- see the note after this example.
    fns.insert((zome_info()?.name, "recv_remote_signal".into()));
    create_cap_grant(CapGrantEntry {
        tag: "remote signals".into(),
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
    )
}

#[hdk_extern]
pub fn recv_remote_signal(payload: RemoteSignal) -> ExternResult<()> {
    if let RemoteSignal::Heartbeat = payload {
        let caller = call_info()?.provenance;
        // On the receiving end we forward the remote signal to the front end
        // by emitting a local signal.
        // On the receiving end, we forward the remote signal to the front end by emitting a local signal.
        emit_signal(LocalSignal::Heartbeat(caller))?;
    }
    Ok(())
}
```

!!! info Remote signal handlers are just zome functions
`send_remote_signal` is sugar for a [remote call](/build/calling-zome-functions/#call-a-zome-function-from-another-agent-in-the-network) to a zome function named  `recv_remote_signal`. This target function exists by convention and must be given an `Unrestricted` capability grant for this to work. <!-- TODO: link to capabilities page -->. The only difference from a regular remote call is that `send_remote_signal` doesn't block execution waiting for a response, and it doesn't return an error if anything fails. Other than that, the following two are roughly equivalent.

```rust
fn send_heartbeat_via_remote_signal(agent: AgentPubKey) -> ExternResult<()> {
    send_remote_signal(RemoteSignal::Heartbeat, vec![agent])
}

fn send_heartbeat_via_remote_call(agent: AgentPubKey) -> ExternResult<()> {
    // Throw away the return value of `recv_remote_signal`, which shouldn't
    // contain anything meaningful anyway.
    let _ = call_remote(
        agent,
        zome_info()?.name,
        "recv_remote_signal".into(),
        None,
        RemoteSignal::Heartbeat
    )?;
    Ok(())
}
```

Take care that `recv_remote_signal` does as little as possible, to avoid people abusing it. Permissions and privileges are another topic which we'll talk about soon.<!-- TODO: delete this sentence and link to capabilities page -->

It also means that `send_remote_signal` always routes the call to a coordinator zome of the same name as the caller. Because [the remote agent might map that name to a different coordinator zome, or no zome at all](/build/calling-zome-functions/#remote-call-unknown-routing), this function might be handled in unexpected ways on the receiver's end.

Finally, remote signals open up connections to peers, so they should be used sparingly. The above heartbeat example would be very costly if everyone in a large network were sending heartbeats to each other.
!!!

## Reference

* [`hdk::p2p::emit_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.emit_signal.html)
* [`@holochain/client.AppWebsocket.prototype.on`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.on.md)
* [`hdk::p2p::send_remote_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.send_remote_signal.html)

## Further reading

* [Core Concepts: Signals](/concepts/9_signals/)
<!-- TODO: reference capabilities page -->