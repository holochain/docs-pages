---
title: Get Started
tocData:
  - text: 1. Introduction to Holochain
    href: 1-introduction-to-holochain
  - text: 2. Installing Holochain development environment
    href: 2-installing-holochain-development-environment
---

Welcome to the Getting Started with Holochain guide! This guide will walk you through the process of installing the Holochain development tools and creating a simple forum application. By the end of this guide, you'll be familiar with the core concepts of Holochain and have a basic understanding of how to develop peer-to-peer applications using the Holochain framework.

## How to use this guide

Follow this guide step by step. All steps are essential to create the example applications. No additional code or steps are needed.

* The examples below use `$` to represent your terminal prompt in a UNIX-like OS, though it may have been customized in your OS to appear differently.
* We assume that you are reading this guide because your are a developer new to Holochain but interested in actually building peer-to-peer distributed applications using a framework that is agent-centric, that provides intrinsic data integrity, is scalable, and when deployed, end-user code runs just on the devices of the participants without relying on centralized servers or blockchain tokens or other points of centralized control.
* We assume that you've at least skimmed [Holochain's Core Concepts](/concepts/1_the_basics/) or are ready to pop over there when needed.
* Because Holochain's DNA's are written in Rust, we assume you have at least a basic familiarity with the language. Note, however, that this guide will take you through everything you need to do, step-by-step, so you can follow the steps and learn Rust later. Additionally, Holochain DNAs rarely need to take advantage of the more complicated aspects of the language, so don't let Rust's learning curve scare you.
    * If you're new to Rust, you can start your learning journey by reading chapters 1 to 11 in the [Rust Book](https://doc.rust-lang.org/book/) and doing the accompanying [Rustlings exercises](https://github.com/rust-lang/rustlings/).
* We also assume that you have basic familiarity with the Unix command line.

## 1. Introduction to Holochain

Holochain is a framework for building peer-to-peer distributed applications, also known as hApps. It emphasizes agent-centric architecture, intrinsic data integrity, and scalability. Holochain enables developers to build applications that run on just the devices of the participants without relying on centralized servers or blockchain tokens and it provides a robust and efficient means of managing data.

## 2. Installing Holochain development environment

In this section, we'll walk you through the step-by-step process of installing Holochain, its dependencies, and developer tools on your system so that you can develop hApps.

### 2.1. Hardware requirements

Before you install the Holochain development ment, make sure your system meets the following hardware requirements:

* 8GB+ RAM (16GB+ recommended)
* 4+ cores CPU (6+ cores recommended)
* 30GB+ available disk space
* High-speed internet connection

This may seem like a lot; it's mainly due to Rust's compiler, which requires a lot of system resources.

### 2.2. Windows prerequisite: WSL2 {#2-2-windows-prerequisite-wsl2}

For Windows users, please note that the Nix package manager, which is used to install and manage Holochain development environment, only supports macOS and Linux. You will need to [install Linux under Windows with WSL2 (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install) (recommended) or dual boot a Linux Operating System, alongside your [Windows 10](https://www.freecodecamp.org/news/how-to-dual-boot-windows-10-and-ubuntu-linux-dual-booting-tutorial/) or [Windows 11](https://www.xda-developers.com/dual-boot-windows-11-linux/) OS to proceed.

Holochain is supported under WSL2 via the Ubuntu distribution.

### 2.3. Set up development environment

Once you've ensured that your system meets the hardware requirements and set up WSL2 on Windows or a dual boot Linux OS (if applicable), you can proceed with the installation of the Nix package manager and the binary package cache for Holochain.

Open a command line terminal ([on Linux](https://ubuntu.com/tutorials/command-line-for-beginners#3-opening-a-terminal), [on macOS](https://support.apple.com/en-gb/guide/terminal/pht23b129fed/mac)) and run the following command by pasting or typing the following text in and pressing <kbd>Enter</kbd>:

```shell
bash <(curl https://holochain.github.io/holochain/setup.sh)
```

This command downloads the setup script and runs it, installing the Nix package manager and setting up a package cache for Holochain.

### 2.4. Verify installation

In a new terminal session type:

```shell
nix run --refresh -j0 -v github:holochain/holochain#hc-scaffold -- --version
```

Look out for binaries being copied from `holochain-ci.cachix.org`:

::: output-block
```text
downloading 'https://holochain-ci.cachix.org/nar/<some-hash>.nar.zst'...
```
:::

It proves that the package cache is configured correctly.

At the end of the output, Holochain's scaffolding tool should print its version string:

::: output-block
```text
holochain_scaffolding_cli x.y.z
```
:::

Congratulations! The Holochain development environment is now set up successfully on your system.

<!---
TODO: this looks like older stuff, cleanup?

====

TODO (Matt's best guess at this):
1. Creating Validation Rules
2. Built to Beautiful: adjusting our User Interface
3. Creating Tests
~~9. Deploying Your Holochain Application
    9.1. Packaging Your Application
    9.2. Configuring the Conductor
    9.3. Running Your Application~~
1.  Testing Your Holochain Application
    10.1 Creating Test Scenarios


QUESTIONS:
When to introduce:
- conductors
- cells
-

---
-->

<!--
## 5. Creating validation rules

What can validation rules do? All sorts of things including:

* validate the expected structure of the data (deserialize and throw an error if something isn't as it should be)
* validate constraints like length of a string
* write privileges
* membership privileges
* validate in the context of a person's history (can't really do that with a database schema)
    * by virtue of the fact that you have the user's whole history available, you could validate whether this person has built up enough history to post this comment.

For this tutorial, we are going to create just a couple of validation rules to give a feel for what goes into them

1. a simpler validation rule by imposing a constraint on the length of a comment and
2. a more advanced validation rule that only allows the original author of a post to update that post.

### 5.1. Beginner (inspecting the entries)

Character limit on comment length

In this section, we are going to make a validation rule that sets the maximum length of a comment to 140 characters.

Let's start by making use of a Test Driven Development (TDD) pattern and write a test to check whether or not comments longer than 140 characters are able to be created. Initially, this test should fail.

Then we will write a validation rule that ensures that comments with more than 140 characters are rejected as invalid so that our test will pass.

##### Writing a test

Holochain comes with some testing tools to make it easier to test peer-to-peer applications. One that the scaffold makes use of in the code that it generates is [Tryorama](https://github.com/holochain/tryorama).

Tryorama is a framework for testing Holochain applications. It provides a way to run a number of Holochain conductors (instances of the Holochain runtime) on your local machine, and can be used in combination with a test runner and assertion library to test the behavior of multiple Holochain nodes in a network. In this case, the test runner and assertion library we use are `vitest` and `assert` respectively.

In short, Tryorama helps us test that things are working as they should even when multiple peers are interacting by spinning up a virtual network of different agents on your computer.

In order to test whether or not comments longer than 140 are going to be able to be created, we are going to first open our `comment.test.ts`` file:

```shell
code tests/src/forum/posts/comment.test.ts
```

This file contains the boilerplate that the scaffold has written for testing comments. At the top are some imports, including `createComment` and `sampleComment` from `./common.js`. Then below that are some tests: one that tests 'create Comment', another that tests 'create and read Comment', another that tests 'create and update Comment' and finally, one that tests 'create and delete Comment'.

We are going to look to those tests for inspiration regarding how to structure our max 140 characters test.

Looking at the 'create Comment' test (starting at line 9 or so), the main steps of the test are as follows

* The location of the Holochain application bundle (`.happ` file) is specified.
* The application is installed for two players, Alice and Bob.
* Peer discovery through gossip is initiated with `scenario.shareAllAgents()`, allowing the players to recognize each other in the network.
* Alice creates a comment using the createComment function, which implements a call to a Holochain zome function to create a comment. This returns a Record instance.
* An assertion checks that the returned record is valid.

The first three steps basically involve setting up the test network with the application. Each test cleans up after itself so that subsequent tests are working with a clean slate. So we are going to have to implement some of those same steps in the test that we will be writing. Let's add that part first.

At the bottom of the `comment.test.ts` file, add in:

```javascript
test('should not create a Comment longer than 140 characters', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/my_forum_app.happ';

    // Set up the app to be installed
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();
  });
});
```

That gets the basic network set up out of the way. Now let's prep a constant to hold our "long comment" and a variable to keep track of whether an error occurred before we add the actual constraints that we want to test.

Just below the `await scenario.shareAllAgents();` line, create a string that is longer than 140 characters and assigning it to a constant:

```javascript
// Create a string longer than 140 characters
const longCommentContent = Array(142).join("a");
```

Directly after that line, add the following assertion:

```javascript
// Trying to create a Comment with content longer than 140 characters should throw an error
await expect(() => createComment(alice.cells[0], longCommentContent)).rejects.toThrowError();
```

This tests whether the `createComment` function properly throws an error when attempting to create a comment that is too long.

`alice.cells[0]` represents the first cell of the 'alice' agent, which might mean the first application, or component of an application if there are multiple DNAs, Alice can operate within.

`longCommentContent` is a string of text that represents a comment. In the context of the test, this string has been deliberately set to a length of 142 characters, which is longer than the application's allowed limit of 140 characters.

The await keyword is used to wait until the Promise returned by createComment either resolves (meaning the comment was successfully created), or rejects (throws an exception), which would indicate that an error occurred, such as the comment being too long.

In this test it is expected that the Promise of executing `createComment` be rejected. `rejects` unwraps the Promise and gives access to the value that it was rejected with. We expect to find an error object. That would mean that the validation of a too long comment failed.

##### Running our test

So as not to run all the tests, and just run the one we just created, change `test` at the beginning of this test to `test.only`.

Second, let's run just that test. In the command line run:

```shell
npx vitest --run comment.test.ts
```

Note: When you want to run all the tests, change `test.only` back to `test` and in the command line, run:

```shell
npm run test
```

The test should initially fail (because we haven't yet implemented that 140 character constraint).

##### Writing the validation rule

Our next step is to start editing the appropriate validation rule so that agents can only create a comment if it is no more than 140 characters in length.

Fortunately, the scaffold has already written a fair bit of validation rule boilerplate code for us.

In our IDE, let's open our integrity zome `comment.rs` file:

```shell
code dnas/zomes/integrity/posts/src/comment.rs
```

In `comment.rs`, we are going to want to add our "maximum 140 characters" constraint to the `validate_create_comment()` function (about line 8). Edit the `validate_create_comment` function to add the following on the line just above `Ok<ValidateCallbackResult::Valid)` (at the bottom of that function).

```rust
    if (comment.comment_content.len()) > 140 {
        return Ok(ValidateCallbackResult::Invalid("Comment is longer than 140 characters".to_string()));
    }
```

When finished, it should look like this:

```rust
pub fn validate_create_comment(
    _action: EntryCreationAction,
    comment: Comment,
) -> ExternResult<ValidateCallbackResult> {
  TODO
/*    let record = must_get_valid_record(comment.post_hash.clone())?;
    let _post: crate::Post = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Dependant action must be accompanied by an entry"))
            ),
        )?;*/
    if (comment.comment_content.len()) > 140 {
        return Ok(ValidateCallbackResult::Invalid("Comment is longer than 140 characters".to_string()));
    }
    Ok(ValidateCallbackResult::Valid)
}
```

Lets save the file.

If we now run the test again, it will pass.

TODO: SHOW RUNNING THE TEST AND IT PASSING.

What about updating comments?  Remember that in Holochain, because the source-chain is an appen only ledger, updating a comment is really creating a new comment and marking the old comment as deleted. Thus, when someone updates a comment, the create validation rules will still get enforced because a new comment entry gets created.

### 5.2. Advanced (inspecting the actions)

Permissions on updates and deletes

In `post.rs`, there is a function that enables us to update a post.

```rust
pub fn validate_update_comment()
```

Here we can create a validation rule that requires that the editor of a comment is the original author of that comment.
Edit the `validate_update_post` function as follows:

```rust
pub fn validate_update_post(
    _action: Update,
    _post: Post,
    _original_action: EntryCreationAction,
    _original_post: Post,
) -> ExternResult<ValidateCallbackResult> {
    // Check that the agent who originally created the post is the same as the one trying to update it.
    if *_original_action.author() != _action.author {
        return Ok(ValidateCallbackResult::Invalid("Only the original author can update the post".to_string()));
    }
    Ok(ValidateCallbackResult::Valid)
}
```

UI doesn't generate an edit button that the author can't edit.

Using the validation error message to store some JSON to say "these fields are incorrect", have a list of error messages, compile them in a way the UI can parse, that feels like a user friendly

Other possibilities: validate as you type. Calls the validate create comment function (as if it were validating, even though it isn't actually validating now)

What would be really cool - if we a schema definition for your entry types that would generate the validation code and the UI side as you type javascript code.


TODO:
### 5.3. Validating links?

(currently one dht is an isolated thing, but we can link from elsewhere, we just have to be content with that input being unvalidated)
    has to be data at the base address

4 dht entry action
store entry
store action
register agent activity
also sends a register update entry op to the holders of the original entry
creating a sort of a link from the old entry to the new entry
Those who receive the store action (validation authorities), they will run the validation.

---
-->


<!---
TODO: this looks like older stuff, cleanup?

---

Now that you've implemented the forum application, it's time to deploy it. To do this, you'll need to package your application and configure the conductor.

### 6.1. Packaging your application

Navigate to the `forum/dna` folder and run the following command:

hc dna pack my_forum_app.dna.workdir


This will create a `forum.dna` file, which is a packaged version of your application.

### 6.2. Configuring the conductor

Edit the `conductor/conductor-config.yml` file with the following content:

```yaml
---
environment_path: ./
use_dangerous_test_keystore: false
signing_service_uri: ~
encryption_service_uri: ~
decryption_service_uri: ~
dpki: ~
keystore_path: "./keystore"
passphrase_service: ~
admin_interfaces:
  - driver:
      type: websocket
      port: 0
network:
  bootstrap_service: https://bootstrap.holo.host
  transport_pool:
    - type: webrtc
      signal_url: wss://signal.holo.host
  network_type: quic_bootstrap
```

### 6.3. Running your application

To run your Holochain application, navigate to the forum/conductor folder and run the following command:

```shell
hc run
```

This will start your Holochain application and provide a WebSocket API for interacting with it.

Congratulations! You have now successfully created and deployed a forum application using Holochain. With this knowledge, you can continue exploring and building more complex applications using the Holochain framework.

## 7. Testing your application

To ensure that your application works as expected, you should write tests for the application's functionality. In Holochain, tests are written in a separate tests folder.

### 7.1. C

Navigate to the `my_forum_app/tests/` folder and create a new file called `my_forum_app_tests.rs`. This file will contain the test scenarios for your application.

First, add the necessary imports and create a test_scenario function that initializes the test environment:

```rust
use ::fixt::prelude::*;
use hdk::prelude::*;
use holochain::test_utils::conductor_testing::{conductor_test, HostFnCaller};
use holochain_types::app::InstalledCell;
use holochain_wasm_test_utils::TestWasm;

pub struct TestContext {
    pub cell: InstalledCell,
    pub call: HostFnCaller,
}

async fn test_scenario(
    test_fn: impl FnOnce(TestContext) -> BoxFuture<'static, ()> + Send + 'static,
) {
    conductor_test(test_fn, vec![(TestWasm::ForumZome, "my_forum_app.wasm")]).await;
}
```

### 7.2. W

Now, write test cases for creating and retrieving threads:

```rust
use my_forum_app::{CreateThreadInput, GetThreadInput};

#[tokio::test(threaded_scheduler)]
async fn test_create_and_get_threads() {
    test_scenario(|ctx: TestContext| {
        async move {
            // Create a new thread
            let thread_title = "Test Thread".to_string();
            let post_content = "This is a test post.".to_string();
            let create_input = CreateThreadInput {
                title: thread_title.clone(),
                content: post_content.clone(),
            };
            let thread_hash = ctx
                .call(TestWasm::ForumZome, "create_thread", create_input)
                .await
                .unwrap()
                .unwrap();

            // Retrieve all threads
            let threads = ctx
                .call(TestWasm::ForumZome, "get_all_threads", ())
                .await
                .unwrap()
                .unwrap();
            assert!(threads.contains(&thread_hash));

            // Retrieve the created thread
            let get_input = GetThreadInput { thread_hash };
            let thread = ctx
                .call(TestWasm::ForumZome, "get_thread", get_input)
                .await
                .unwrap()
                .unwrap();
            assert_eq!(thread.title, thread_title);
            assert_eq!(thread.initial_post.content, post_content);
        }
        .boxed()
    })
    .await;
}
```

8.3. Running Tests

To run the tests, navigate to the `my_forum_app/` folder and run the following command:

```shell
hc test
```

This will execute your tests and display the results in the terminal.

</div>
-->

## 6. Next steps

Congratulations! You've learned how to create a new Holochain application, understand its layout, work with core concepts, and deploy and test the application.

Now that you have a basic understanding of Holochain development, you can continue exploring more advanced topics, such as:

* Validating data
* Writing tests for a zome
* Implementing access and write privileges
* Building more complex data structures and relationships
* Optimizing your application for performance and scalability

### 6.1  Further exploration and resources

Now that you have successfully built a basic forum application using Holochain and integrated it with a frontend, you may want to explore more advanced topics and techniques to further enhance your application or create new ones. Here are some resources and ideas to help you get started:

#### Holochain developer documentation

The official Holochain developer documentation is a valuable resource for deepening your understanding of Holochain concepts, techniques, and best practices. Be sure to explore the documentation thoroughly:

* [Holochain Core Concepts](/concepts/1_the_basics/)
* [Holochain Developer Kit (HDK) reference](https://docs.rs/hdk/latest/hdk)

#### Community resources

The Holochain community is an excellent source of support, inspiration, and collaboration. Consider engaging with the community to further your learning and development:

* [Holochain GitHub repositories](https://github.com/holochain)
* [Holochain Discord server](https://discord.com/invite/k55DS5dmPH)

#### Example applications and tutorials

Studying existing Holochain applications and tutorials can provide valuable insights and inspiration for your projects. Here are some resources to explore:

* [Holochain Open Dev](https://github.com/holochain-open-dev)
* [Holochain Foundation sample apps](https://github.com/holochain-apps)
