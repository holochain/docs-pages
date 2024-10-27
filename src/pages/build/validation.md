---
title: "Validation"
---

::: intro
**Validation** is how your app defined what kinds of Entries and Links can be published, and how they can be altered. The **validate** callback is a function defined in every integrity zome which defines allowed changes to the Entry Types and Link Types declared in that zome.
:::


### Validate Callback
The validate callback runs on **Ops**, not **Actions** (TODO: link to more info about ops vs actions). The hdi provides a helper to transform an `Op` into a data structure more suitable for use in validation: a `FlatOp`


The validate callback can return:
- `ValidateCallbackResult::Valid`
- `ValidateCallbackResult::Invalid`
- `ValidateCallbackResult::MissingDependencies`
  - TODO: The validation callback will be scheduled to run again. If subsequent runs never complete, then the Op will never be intergrated and is effectively ignored.
- an Error
  - TODO: The validation callback will be scheduled to run again. If subsequent runs never complete, then the Op will never be intergrated and is effectively ignored.

Because the validate callback itself can become quite large and unwiedly, we recommend using it only for matching by Action, Entry Type and Link Type, and then keeping your actual validation logic in a standalone function. This is how the scaffolder tool sets up your validate callback.

```rust
#[hdk_entry_type]
struct Post {
  title: String,
  body: String,
  tags: Vec<String>
}

#[hdk_entry_types]
enum EntryTypes {
  Post(Post)
}

/// PLEASE LET THE SCAFFOLDER GENERATE THIS FUNCTION FOR YOU
/// IT IS TOO LARGE AND UNWIEDLY TO INCLUDE HERE IN FULL
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
  match op.to_flat_op() {
    ...
  }
}

pub fn validate_create_post(action: Action, post: Post) -> ExternResult<ValidateCallbackResult> {
  // Post body must be at least 5 characters
  if post.body.trim().len() < 5 {
    return Ok(ValidateCallbackResult::Invalid("Post body must be at least 5 characters"));
  }

  // Post title cannot be blank
  if post.title.trim().len() == 0 {
    return Ok(ValidateCallbackResult::Invalid("Post title cannot be blank"));
  }

  // Post can have a maximum of 3 tags
  if post.tags.len() > 3 {
    return Ok(ValidateCallbackResult::Invalid("Post cannot have more than 3 tags"));
  }

  Ok(ValidateCallbackResult::Valid)
}

pub fn validate_update_post(action: Action, post: Post, original_post: Post, original_action: Action) -> ExternResult<ValidateCallbackResult> {
  // Only the original author can update their Post
  if original_action.author != action.author {
    return Ok(ValidateCallbackResult::Invalid("Only the original author can update a Post"));
  }

  // The Post title cannot be updated
  if original_post.title != post.title {
    return Ok(ValidateCallbackResult::Invalid("Post title cannot be updated"));
  }

  Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_post(action: Action, post: Post, original_post: Post, original_action: Action) -> ExternResult<ValidateCallbackResult> {
  // Only the original author can delete their Post
  if original_action.author != action.author {
    return Ok(ValidateCallbackResult::Invalid("Only the original author can delete a Post"));
  }

  Ok(ValidateCallbackResult::Valid)
}
```

### Determanism

The validate callback function must be **determanistic**. That is, no matter when or by whom the validation is executed, it always arrives at the same outcome: either Valid or Invalid.

For this reason you cannot: 
- Use current machine timestamps in validation
- Use your own agent info in validation


### Using DHT Data

To allow validation to depend fetching some other data from the DHT, the `hdi` provides a `must_get_*` functions:

- `must_get_valid_record`
  - The only one that checks for validation receipts/warrants because an entry is only valid/invalid in the context of an action
  - It trusts the claim of the agent it fetched from (1-of-n validation)
  - If you want to run the validation yourself, then you must run validate on the received record.

- `must_get_entry`
- `must_get_action`


Note that you **cannot** depend on links from the DHT. There is no `must_get_links` function in the hdi because that would not be determanistic, as different agents may have a different perspective on all the links available. There is also no `must_get_link` function in the hdi currently, as links are only hashed by their base hash.


### What Can Be Validated?

- membrane proof
- entry structure (entry_def macro gives you deserialisation and error short-circuiting for free with ? operator)
- permission
- rate limiting with weight field
- dependencies, incl source chain history
- Inductive validation for costly dep trees (pattern?)

### What to Validate and When?

TODO: Considerations re: what should be validated on each op (IOW, what authorities should be responsible for what things)


### Limitations

- Cannot must_get links or actions on a base
- Cannot must_get a single link
- Cannot currently co-validate multiple actions (can only validate an action based on prior valid actions)      
- Cannot validate the non-existence of something, because that can always change
- (future) source chain restructured to atomic bundle of actions, co-validated
- (future) link have another basis of their base,target,tag and can be must_get by that hash


### Validate Under-the-hood
TODO: Lifecycle of a validation
      At author time
      At publish time
      At gossip time


    Membrane proof
    Genesis self-check -- not a 'true' validation function, just a way to guard yourself against copy/paste mistakes and other things that can permanently hose your chance of joining a network
    (future) Handled specially -- restricts/grants access to a network; validated at handshake time (turns out this is not currently implemented, and there are questions about how to implement it in a way that doesn't carry a performance hit with each new peer connection -- and there may be lots of them in a big heavily sharded DHT)
    AgentValidationPkg is the only action for which an honest person can get warranted, because they try to join the network and publish it before they're able to fetch deps

### Sys Validation

Some validation is always run by the Holochain Conductor, without requiring any changes to your app.

TODO: It includes:


## Reference

* [hdi::prelude::must_get_entry](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_entry.html)
* [hdi::prelude::must_get_action](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_action.html)
* [hdi::prelude::must_get_valid_record](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_valid_record.html)
* [hdi::prelude::ValidateCallbackResult](https://docs.rs/hdi/latest/hdi/prelude/enum.ValidateCallbackResult.html)
* [hdi::prelude::FlatOp](https://docs.rs/hdi/latest/hdi/flat_op/enum.FlatOp.html)

## Further reading

* [Core Concepts: Validation](/concepts/7_validation/)
