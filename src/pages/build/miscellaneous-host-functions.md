---
title: "Miscellaneous Host functions"
---

::: intro
This page contains all the host API functions that don't fit into other categories. It covers system time, randomness, and logging.
:::

## Get the system time

You can get the agent's current system time with the [`sys_time`](https://docs.rs/hdk/latest/hdk/time/fn.sys_time.html) host function, which takes no arguments and returns a result containing a [`Timestamp`](https://docs.rs/kitsune_p2p_timestamp/latest/kitsune_p2p_timestamp/struct.Timestamp.html).<!-- TODO: change to the right package when kitsune_p2p_timestamp is retired in 0.5 --> _**Note**: This function is only available to coordinator zomes._

```rust
use hdk::prelude::*;

let now = sys_time().unwrap();
```

## Generate some random bytes

To generate some random bytes using the system's random number generator, use the [`random_bytes`](https://docs.rs/hdk/latest/hdk/random/fn.random_bytes.html) host function, It takes the number of bytes you want and returns a result containing the bytes, wrapped in a [`Bytes`](https://docs.rs/hdk/latest/hdk/prelude/type.Bytes.html) struct. _**Note**: This function is only available to coordinator zomes._

```rust
use hdk::prelude::*;

let number_between_0_and_255: u8 = random_bytes(1)
    .unwrap()
    .into_vec()
    [0];

let reasonably_random_unique_id: Vec<u8> = random_bytes(32)
    .unwrap()
    .into_vec();
```

!!! info The quality of the randomness depends on the host operating system
Holochain just uses whatever random number generator the host operating system provides. These can reasonably be assumed to be random enough for most purposes in most operating systems. They can't be assumed to be 'secure', though, because they end up in WASM memory, and this host function isn't performant or reproducible if you need to do statistical analysis.

If you need secure, cryptographic-strength random bytes that aren't exposed insecurely in memory, consider using `x_salsa20_poly1305_shared_secret_create_random`<!-- TODO: link to crypto page -->, which stores the bytes in Holochain's secure key store.

If you need performant, reproducible randomness for use in statistical analysis, use the value of `random_bytes` as a seed for a pseudorandom number generator that's suited to your use case (take a look at [seedable random number generators](https://rust-random.github.io/book/guide-seeding.html) in Rust's `rand` crate).
!!!

## Log things in your zomes

You can emit log messages from your zomes using Rust's [`tracing`](https://docs.rs/tracing/latest/tracing/) crate. The HDK includes a tracing subscriber that forwards all your tracing calls to the host. This subscriber is active in any public function marked with the `#[hdk_extern]` macro.

```rust
use hdi::prelude::*;
use tracing::*;

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
WASM_LOG=info hc-spin workdir/my-app.happ
```

When the `foo` zome function is called, you'll see:

::: output-block
```text
[hc-spin] | [hc sandbox]: 2025-03-28T21:17:59.566029Z  INFO movies:dnas/movies/zomes/coordinator/movies/src/lib.rs:443 I am an info message
[hc-spin] | [hc sandbox]: 2025-03-28T21:17:59.566102Z  WARN movies:dnas/movies/zomes/coordinator/movies/src/lib.rs:444 I am a warning message
[hc-spin] | [hc sandbox]: 2025-03-28T21:17:59.566155Z ERROR movies:dnas/movies/zomes/coordinator/movies/src/lib.rs:445 I am an error message
```
:::

## Reference

* [`hdk::time::sys_time`](https://docs.rs/hdk/latest/hdk/time/fn.sys_time.html)
* [`hdk::random::random_bytes`](https://docs.rs/hdk/latest/hdk/random/fn.random_bytes.html)
* [`hdk::trace` module documentation](https://docs.rs/hdk/latest/hdk/trace/index.html)
* [`tracing` crate documentation](https://docs.rs/tracing/latest/tracing/)