---
title: "Miscellaneous Host functions"
---

::: intro
This page contains all the host API functions that don't fit into other categories. It covers system time, randomness, and logging.
:::

## Get the system time

You can get the agent's current system time with the [`sys_time`](https://docs.rs/hdk/latest/hdk/time/fn.sys_time.html) host function, which takes no arguments and returns a result containing a [`Timestamp`](https://docs.rs/holochain_timestamp/latest/holochain_timestamp/struct.Timestamp.html). _**Note**: This function is only available to coordinator zomes._

```rust
use hdk::prelude::*;

fn get_time() -> ExternResult<Timestamp> {
    sys_time()
}
```

## Generate some random bytes

To generate some random bytes, use the [`random_bytes`](https://docs.rs/hdk/latest/hdk/random/fn.random_bytes.html) host function. It takes the number of bytes you want and returns a result containing the bytes, wrapped in a [`Bytes`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/bytes/type.Bytes.html) struct. _**Note**: This function is only available to coordinator zomes._

```rust
use hdk::prelude::*;

fn roll_die(sides: u8) -> ExternResult<u8> {
    match sides {
        0 => Err(wasm_error!("Can't roll a die with zero sides")),
        _ => Ok(random_bytes(1)?[0] % sides + 1),
    }
}

fn reasonably_random_unique_id() -> ExternResult<Vec<u8>> {
    Ok(random_bytes(32)?.into_vec())
}
```

!!! info `random_bytes` uses the host operating system's random number generator
Holochain just uses whatever random number generator the host operating system provides. The bytes are open in memory as they're passed to the caller, and they're not provably random or repeatable/seedable. Read the [`random_bytes` Rust documentation](https://docs.rs/hdk/latest/hdk/random/fn.random_bytes.html) to help you decide if this function is appropriate for your use case.
!!!

## Log things in your zomes

You can emit log messages from your zomes using Rust's [`tracing`](https://docs.rs/tracing/latest/tracing/) crate. The HDK includes a tracing subscriber that forwards all your tracing calls to the host. This subscriber is active in any public function marked with the `#[hdk_extern]` macro.

```rust
use hdi::prelude::*;

#[hdk_extern]
pub fn foo() -> ExternResult<()> {
    trace!("I am a trace message");
    debug!("I am a debug message");
    info!("I am an info message");
    warn!("I am a warning message");
    error!("I am an error message");
}
```

To set the logging level appropriate to your needs, set the `WASM_LOG` environment variable just like you'd set the `RUST_LOG` environment variable. The host re-emits the messages to its own tracing subscriber (typically this means outputting them to stdout).

```bash
WASM_LOG=info hc-spin workdir/my-app.webhapp
```

When the `foo` zome function is called, you'll see:

::: output-block
```text
[hc-spin] | [hc sandbox]: 2025-03-28T21:17:59.566029Z  INFO movies:dnas/movies/zomes/coordinator/movies/src/lib.rs:443 I am an info message
[hc-spin] | [hc sandbox]: 2025-03-28T21:17:59.566102Z  WARN movies:dnas/movies/zomes/coordinator/movies/src/lib.rs:444 I am a warning message
[hc-spin] | [hc sandbox]: 2025-03-28T21:17:59.566155Z ERROR movies:dnas/movies/zomes/coordinator/movies/src/lib.rs:445 I am an error message
```
:::

For more information on debugging a hApp, read the [debugging howto](/resources/howtos/debugging/).

## Further reading

* [Resources: Debugging a Running Holochain Conductor](/resources/howtos/debugging/)

## Reference

* [`hdk::time::sys_time`](https://docs.rs/hdk/latest/hdk/time/fn.sys_time.html)
* [`hdk::random::random_bytes`](https://docs.rs/hdk/latest/hdk/random/fn.random_bytes.html)
* [`hdk::trace` module documentation](https://docs.rs/hdk/latest/hdk/trace/index.html)
* [`tracing` crate documentation](https://docs.rs/tracing/latest/tracing/)