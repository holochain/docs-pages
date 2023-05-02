---
title: Getting Started with Holochain
layout: default-page-layout.njk
pageStyleId: get-started
---

Welcome to the Getting Started with Holochain guide! This guide will walk you through the process of creating a simple forum application using Holochain. By the end of this guide, you'll be familiar with the core concepts of Holochain and have a basic understanding of how to develop peer-to-peer applications using the Holochain framework.
### Table of Contents

1. Introduction to Holochain 
2. Installing Holochain 
    1. Hardware Requirements
    2. Windows Prerequisite: WSL2
    3. Install the Nix Package Manager and Set Up Holochain Binary Cache
    4. Verify Installation
3. Scaffold a Hello World Holochain Application
    1. Quick Create
4. Understanding the Layout of a Holochain Application 
5. Zero to Built: Creating a Forum App
    1. Scaffold a Custom Holochain Application
    2. Set Up the Developer Environment
    3. Scaffold a DNA
    4. Scaffold a Zome
    5. Scaffold Entry Types
    6. Scaffold Links
    7. Scaffold a Collection
    8. Integrate the Generated UI Elements
    9. Run the Application
6. Built to Beautiful: adjusting our User Interface
7. Deploying Your Holochain Application
    1. Packaging Your Application
    2. Configuring the Conductor
    3. Running Your Application
8. Testing Your Holochain Application
    1. Creating Test Scenarios

#### How to Use this Guide
Follow this guide step by step. All steps are essential to create the example applications. No additional code or steps are needed.

* The examples below use $ to represent your terminal prompt in a UNIX-like OS, though it may have been customized to appear differently. If you are using Windows, your prompt will look something like C:\source_code>. Type commands after the $ sign. 

### 1. Introduction to Holochain

Holochain is a framework for building peer-to-peer distributed applications, also known as hApps. It emphasizes agent-centric architecture, intrinsic data integrity, and scalability. Holochain enables developers to build applications that run on just the devices of the participants without relying on centralized servers or blockchain tokens and it provides a robust and efficient means of managing data. 
        
        
### 2. Installing Holochain Developer Environment

In this section, we'll walk you through the step-by-step process of installing Holochain and its dependencies on your system so that you can develop hApps.
#### 2.1. Hardware Requirements

Before you install the Holochain Developer Environtment, make sure your system meets the following hardware requirements:

* 8GB+ RAM (16GB+ recommended)
* 4+ cores CPU (6+ cores recommended)
* 30GB+ available disk space
* High-speed internet connection

#### 2.2. Windows Prerequisite: WSL2

For Windows users, please note that the Nix package manager, which is used to install and manage Holochain development tools, only supports macOS and Linux. You will need to [install Linux under Windows with WSL2 (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install) (recommended) or dual boot a Linux Operating System, alongside your [Windows 10](https://www.freecodecamp.org/news/how-to-dual-boot-windows-10-and-ubuntu-linux-dual-booting-tutorial/) or [Windows 11](https://www.xda-developers.com/dual-boot-windows-11-linux/) OS to proceed.

Holochain is supported for the Ubuntu distribution under WSL2. 

#### 2.3. Set up Development Environment

Once you've ensured that your system meets the hardware requirements and set up WSL2 on Windows or a dual boot Linux OS (if applicable), you can proceed with the installation of the Nix package manager and Holochain binary cache.

Open a [command line terminal](https://hackmd.io/c15fobj9QtmOuEuiNAkaQA) and run the following command by pasting or typing the following text in and hitting **<enter>**:
```
$ bash <(curl https://holochain.github.io/holochain/setup.sh)
```
This command downloads the setup script and runs it, installing the Nix package manager and setting up the Holochain binary cache.

#### 2.4. Verify Installation

To verify that the Holochain development environment is installed correctly, open a new shell session and run the following command:
```
$ nix develop github:holochain/holochain -c $SHELL -c "holochain --version"
```
If you see the following output:
```
Holochain development shell spawned. Type exit to leave.
```
Congratulations! The Holochain development environment is now set up successfully on your system.


### 3. Scaffold a Simple "Hello, World!" Holochain Application
In this section, we'll use Holochain's scaffolding tool to generate a simple "Hello, World!" application.

When getting started, seeing a simple, but fully-functional app can be very helpful.  
You can have Holochain's scaffold tool generate a "hello world" application (but for a distributed multi-agent world), by typing the following in your command line terminal:
```       
nix run github:holochain/holochain#hc-scaffold -- example hello-world
```   
The scaffolding app should print out these instructions:
```
  cd hello-world
  nix develop 
  npm install
  npm start
```

When you follow them, you should see two windows pop up representing two agents, both of which will have published a "Hello World" entry to the network, and when you click on the "get hellos" button, you should be able to see the hellos:
[image of hellos?]

### 4. Understanding the Layout of a Holochain Application

To understand the layout of a Holochain application, let's explore the different files and directories that make up the structure of the Hello, World! hApp that you just created.

If you are new to navigating directories and files using the command line, check out [Navigating with the Command Line (Mac + Linux)](https://hackmd.io/c15fobj9QtmOuEuiNAkaQA)

Here's a table describing the purpose of the folders and files in the "Hello, World!" Holochain application (including details of the DNAs folder since that makes up the bulk of the "holochain" part of an application, but only a high level overview of the node_modules/, target/, tests/, and ui/ folders):

| File/Folder                 | Purpose                                                                                       |
|-----------------------------|-----------------------------------------------------------------------------------------------|
|├──`hello-world/`              | Root directory of the "Hello, World!" application. All other files and folders will reside here. |
|└──`dnas/`                 | This folder contains the DNA configuration and source code for the application. DNAs are one of the most important building blocks in Holochain. Simply put, **a DNA is the source-code for the game you are playing with your peers in Holochain.** And here is the twist: in Holochain, **every DNA creates its own peer-to-peer network** (for the validation, storage, and serving of content).  Every Holochain Application contains at least one DNA. In this example hApp, we have just one: "hello_world". |
| │├──`hello_world/`  | Folder for the "Hello, World!" DNA. This folder contains modules (zomes) that define the rules of this application. ~~This enables people to agree to "the rules of the game" before actually joining the network and beginning to interact with other peers.~~ |
| ││└── workdir | A working directory containing configuration files and compiled artifacts related to the DNA. |
| │││└── `dna.yaml`      | DNA configuration file. A YAML configuration file that defines the properties and zomes of the DNA. YAML is a human-readable data serialization language. |   
| │││├── `hello_world.dna`      | The compiled DNA file, which includes both the integrity and coordination zomes. This file is used by Holochain to run the hApp. | 
| ││├──`zomes/`        | The executable code modules in a DNA are called zomes (short for chromosomes), each with its own name like profile or chat or in our case "hello" (below). Zomes define the core business logic in a DNA. This folder contains zomes for the hello_world DNA. Zome modules can be composed together to create more powerful functionality. DNAs in Holochain are always composed out of one or more zomes. |
| ││└── `coordinator/`| This folder contains the coordination zomes, which are responsible for this DNA's controller layer, such as committing data and handling communication between peers. |
| │││├──`hello_world/`| Folder containing the "hello_world" coordination zome. |
| ││││└── `src/`| Source code folder for the "hello_world" coordination zome. |
| │││││├── `lib.rs`| The main source code file for the "hello_world!" coordination zome. |    
| ││││├──`Cargo.toml`| The manifest file for the "hello_world!" coordination zome, containing metadata, dependencies, and build options. |
| ││├──`integrity/`| This folder contains the integrity zomes, which are responsible for the application's model layer, such as defining data structures and validation rules. |
| │││├──`hello_world/`| Folder containing the "hello_world!" integrity zome. |
| ││││└── `src/`| Source code folder for the "hello_world" integrity zome. |
| │││││├── `lib.rs`| The main source code file for the "hello_world!" integrity zome. |    
| ││││├──`Cargo.toml`| The configuration file for Rust, containing dependencies and build options for the "hello_world!" integrity zome. |
| └──`node_modules`  | A folder containing JavaScript packages and dependencies for the user interface. |
| └──`target`  | A folder containing the compiled output from the Rust build process. |
| └──`tests`  | A folder containing test code for the "Hello, World!" application. |
| └──`ui`  | A folder containing the source code and assets for the user interface of the "Hello, World!" application. |
| └──`workdir`  | A temporary working directory used by Holochain during the build process. |
| └──`Cargo.lock` | A file generated by Cargo, Rust's package manager, that lists the exact versions of dependencies used in the project. |
| └──`Cargo.toml` | The main configuration file for the Rust project, containing dependencies, build options, and other metadata for the "Hello, World!" application. |
| └──`flake.lock` | A file generated by Nix, a package manager, that lists the exact versions of dependencies used in the project. |
| └──`flake.nix` | A Nix expression that defines the project's build environment, dependencies, and how the project should be built. |
| └──`package.json` | The main configuration file for the JavaScript/Node.js project, containing dependencies, scripts, and other metadata for the user interface of the "Hello, World!" application. |
| └── `package-lock.json` | A file generated by npm, Node.js package manager, that lists the exact versions of dependencies used in the user interface project. |
| └──`README.md` | A markdown file containing the documentation and instructions for the "Hello, World!" application, including how to build, run, and test the project. |

These files and folders make up the structure of a Holochain application, with the main logic being defined in the DNAs (in the dnas/ folder) and the User Interface being defined in the ui/ folder. By understanding the layout and purpose of each file and folder, you can effectively develop and maintain your Holochain application.


In this section, we'll walk you through creating a forum application from scratch using Holochain's scaffolding tool, step-by-step.

### 5. Scaffold a Custom Holochain Application
    
!!!
pre-requisite
First, ensure you have Holochain installed as per section 2.
!!!
    
Next up, Let's dive into building a Holochain application step-by-step. We will be building a forum application where participants can have text based conversations. 

The Holochain scaffold tool will do a lot of the heavy lifting in terms of generating folders, files and writing boiler plate code. It will walk us through each step in the hApp generation process.
    
First, let's use the scaffolding tool to generate the basic folders and files for our hApp.

#### 5.1. Scaffolding a hApp
To start, run the following command in your terminal:
```
nix run github:/holochain/holochain#hc-scaffold -- web-app
```

You should then see:
```
? App name (no whitespaces): 
```

Enter the name of your forum application using snake_case. Let's enter: 
```
my_forum_app. 
```

#### 5.2. Select User Interface Framework            
You'll then be prompted to choose a User Interface (UI) framework for your front-end.

For this example, use the arrow keys to choose **Svelte** and press **<enter>**. 

#### 5.3. Set up Holonix Development Environment
Next, you'll be asked if you want to set up the Holonix development environment for the project. 

Choose **"Yes (recommended)"** and press **<enter>**.

You should see `Setting up nix development environment...` along with some details of what is being added. Follow the instructions to set up the development environment for your hApp and continue to scaffold more of its elements. First, enter the hApp project directory::
```
cd my_forum_app
```
Now, fire up the nix development shell, which makes all scaffolding tools and the Holochain binaries directly available from the command line:

```
nix develop
```
You should see:

Holochain development shell spawned. Type exit to leave.

Next, install the npm dependencies with:

```
npm install
```
Now you're ready to continue scaffolding your forum application.

#### 6.3. Scaffold a DNA

Create a new DNA using the scaffolding tool:

```bash
hc scaffold dna
```

You should then see:

```java
? DNA name (snake_case): 
```

Enter a name for the DNA, for example: forum. You should then see:

```arduino
DNA "forum" scaffolded!
```

#### 6.4. Scaffold a Zome

DNAs are comprised of code modules, which we call zomes. For our forum application, we'll create two zomes: one for threads and another for posts. First, let's create the threads zome:

```bash
hc scaffold zome
```

You should then see:

```bash
? What do you want to scaffold? ›
❯ Integrity/coordinator zome-pair (recommended)
  Only an integrity zome
  Only a coordinator zome
```

Press Enter to select "Integrity/coordinator zome-pair." You should then see:

```java
? Enter coordinator zome name (snake_case):
 (The integrity zome will automatically be named '{name of coordinator zome}_integrity')
```

Enter the name threads. You should then see prompts asking if you want to scaffold the integrity and coordinator zomes in their respective default folders. Press 'y' for both prompts.

Now, let''s create the posts zome. Repeat the same steps as above, but this time enter the name posts when asked for the coordinator zome name.

#### 6.5. Scaffold Entry Types

For our forum application, we'll have two entry types: one for thread and another for post. Let's create the thread entry type first:

```bash
hc scaffold entry-type
```

You should see:

```bash
✔ Entry type name (snake_case):
```

Enter the name thread. You'll then be prompted to add fields to the thread entry type. For our example, we'll add a title and a description field.

For the title field, select String as the field type, and enter title as the field name. Choose 'y' for the field to be visible in the UI, and select TextField as the widget to render the field.

Next, add the description field by selecting String as the field type and entering description as the field name. Choose 'y' for the field to be visible in the UI, and select TextArea as the widget to render the field.

After adding the title and description fields, press 'n' when asked if you want to add another field. Press Enter to generate the default CRUD functions for the thread entry type.

Now, let's create the post entry type. Repeat the steps above, but this time enter the name post for the entry type. Add a content field with the String field type and TextArea widget, and a thread_id field with the EntryHash field type.

#### 6.6. Scaffold Links

For our forum application, we'll create a link between threads and their posts. Run the following command:

```bash
hc scaffold link
```

You should see:

```bash
? Choose base entry type: ›
❯ Thread
  Post
```

Select Thread and press Enter. Then, you should see:

```bash
? Choose target entry type: ›
  Thread
❯ Post
```

Select Post and press Enter. Next, you should see:

```bash
? Choose link tag: ›
```

Enter post_link as the link tag.

#### 6.7. Scaffold a Collection

Now, let's create a collection that can be used to render all the threads and their respective posts. To create a collection, type:

```bash
hc scaffold collection
```

You should then see:

```java
Collection name (snake_case, eg. "all_posts"): › 
```

Enter all_threads and press Enter. You should then see:

```sql
? Which type of collection should be scaffolded? ›
❯ Global (get all entries of the selected entry types)
  By author (get entries of the selected entry types that a given author has created)
```

Select Global and press Enter. You should then see:

```mathematica
? Which entry type should be collected? ›
❯ Thread
  Post
```

Select Thread and press Enter. You should then see:

```arduino
Collection "all_threads" scaffolded!
```

#### 6.8. Integrate the Generated UI Elements

Now, let's integrate the generated UI elements into our forum application. Open the Svelte app file in ui/src/App.svelte and add the following imports near the top, just below `<script lang="ts">`:

```javascript
import AllThreads from './forum/threads/AllThreads.svelte';
import CreateThread from './forum/threads/CreateThread.svelte';
import ThreadPosts from './forum/posts/ThreadPosts.svelte';
import CreatePost from './forum/posts/CreatePost.svelte';
```

Replace the "EDIT ME" text with:

```html
<CreateThread></CreateThread>
<AllThreads on:selectThread="{(e) => selectedThread = e.detail}"></AllThreads>
{#if selectedThread}
  <ThreadPosts thread="{selectedThread}"></ThreadPosts>
  <CreatePost thread="{selectedThread}"></CreatePost>
{/if}
```

Save the file, and you should see that the application now includes the forum functionality.

Finally, add a selectedThread reactive variable at the beginning of the script section:

```javascript
let selectedThread = null;
```

This will handle thread selection and display the selected thread's posts along with the form to create a new post.

#### 6.9. Run the Application

Now that everything is set up, you can run your forum application. To start the Holochain conductor, run:

```bash
hc run
```

In a new terminal window, navigate to the my_forum_app directory, and start the nix development shell:

```bash
cd my_forum_app
nix develop
```

Start the Svelte development server by running:

```bash
npm run dev
```

You should see the server starting and outputting a URL. Open the provided URL in your web browser to see your forum application in action.

You can now create threads, view all threads, and create posts within a selected thread.

That's it! You have successfully built a basic forum application using Holochain's scaffolding tool. You can expand the functionality and customize the UI as needed for your specific use case.


## ???? Should we creat a section like the one below

### 7. Manually Creating additional Components of a Holochain Application

Now that you've built a simple hApp and have gained some familiarity with the core concepts, let's expand upon our forum application by generating some additional components. We'll do this manually, so that you get a more thorough introduction to the functions and files that are being created and the folders where those will be stored.

#### 7.1. Creating a Zome

A zome is a module within your Holochain application that contains the application's logic. To create a zome for our forum application, navigate to the my_forum_app.dna.workdir directory and create a new directory called forum_zome. Inside the forum_zome directory, create a src directory and a zome_manifest.json file.

#### 6.1. Writing the Zome Manifest

Edit the zome_manifest.json file with the following content:

```json
{
  "name": "forum_zome",
  "description": "Zome for the forum application",
  "language": "rust",
  "code_file": "src/lib.rs"
}
```

#### 6.2. Defining the Data Structures

Inside the forum_zome/src directory, create a new file called lib.rs. This file will contain the Rust code for our zome. Start by defining the data structures for our forum application:

```rust
use hdk::prelude::*;

#[hdk_entry(id = "post")]
pub struct Post {
    pub author: AgentPubKey,
    pub content: String,
    pub timestamp: Timestamp,
}

#[hdk_entry(id = "thread")]
pub struct Thread {
    pub title: String,
    pub initial_post: HeaderHash,
}
```

#### 6.3. Implementing the Application Logic

Now, implement the functions for creating and retrieving forum threads and posts:

```rust
// Create a new forum thread
pub fn create_thread(title: String, content: String) -> ExternResult<HeaderHash> {
    // Create the initial post for the thread
    let post = Post {
        author: agent_info()?.agent_initial_pubkey,
        content,
        timestamp: sys_time()?,
    };
    let post_header_hash = create_entry(&post)?;

    // Create the thread with a reference to the initial post
    let thread = Thread {
        title,
        initial_post: post_header_hash.clone(),
    };
    let thread_header_hash = create_entry(&thread)?;

    // Link the thread to an anchor for easy retrieval
    let anchor_entry = Entry::App(Anchor("forum_threads".to_string()).into());
    let anchor_hash = create_entry(&anchor_entry)?;
    create_link(anchor_hash, thread_header_hash.clone(), ())?;

    Ok(thread_header_hash)
}

// Retrieve a list of all forum threads
pub fn get_all_threads() -> ExternResult<Vec<(EntryHash, Thread)>> {
    let anchor_entry = Entry::App(Anchor("forum_threads".to_string()).into());
    let anchor_hash = hash_entry(&anchor_entry)?;
    let links = get_links(anchor_hash, None)?;
    let mut threads = Vec::new();
    for link in links {
        let thread: Thread = get_entry(link.target.clone())?.unwrap().into_option()?;
        threads.push((link.target, thread));
    }
    Ok(threads)
}
// Retrieve a specific forum thread
pub fn get_thread(thread_hash: EntryHash) -> ExternResult<Thread> {
    let thread: Thread = get_entry(thread_hash)?.unwrap().into_option()?;
    Ok(thread)
}
```

#### 6.4. Exposing the Functions

Lastly, expose the implemented functions as public API functions:

```rust
entry_defs![Post::entry_def(), Thread::entry_def()];

#[hdk_extern]
pub fn create_thread(input: CreateThreadInput) -> ExternResult<HeaderHash> {
    create_thread(input.title, input.content)
}

#[hdk_extern]
pub fn get_all_threads(_: ()) -> ExternResult<Vec<(EntryHash, Thread)>> {
get_all_threads()
}

#[hdk_extern]
pub fn get_thread(input: GetThreadInput) -> ExternResult<Thread> {
get_thread(input.thread_hash)
}

// Input structs for our functions
#[derive(Clone, Debug, Serialize, Deserialize, SerializedBytes)]
pub struct CreateThreadInput {
pub title: String,
pub content: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, SerializedBytes)]
pub struct GetThreadInput {
pub thread_hash: EntryHash,
}
```

### 7. Deploying Your Holochain Application

Now that you've implemented the forum application, it's time to deploy it. To do this, you'll need to package your application and configure the conductor.

#### 7.1. Packaging Your Application

Navigate to the `my_forum_app/dna` directory and run the following command:

```bash
hc dna pack my_forum_app.dna.workdir
```

This will create a `my_forum_app.dna` file, which is a packaged version of your application.

#### 7.2. Configuring the Conductor

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
  network_type: quic_bootstrap
  transport_pool:
    - type: proxy
      sub_transport:
        type: quic
      proxy_config:
        type: remote_proxy_client
        proxy_url: "kitsune-quic://0.0.0.0:0"
```

### 7.3. Running Your Application

To run your Holochain application, navigate to the my_forum_app/conductor directory and run the following command:
```
hc run
```
This will start your Holochain application and provide a WebSocket API for interacting with your application.

Congratulations! You have now successfully created and deployed a forum application using Holochain. With this knowledge, you can continue exploring and building more complex applications using the Holochain framework.


### 8. Testing Your Holochain Application

To ensure that your application works as expected, you should write tests for the application's functionality. In Holochain, tests are written in a separate tests directory.

#### 8.1. Creating Test Scenarios

Navigate to the my_forum_app/tests directory and create a new file called my_forum_app_tests.rs. This file will contain the test scenarios for your application.

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
#### 8.2. Writing Test Cases

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

To run the tests, navigate to the my_forum_app directory and run the following command:

```bash
hc test
```

This will execute your tests and display the results in the terminal.
Next Steps

Congratulations! You've successfully built and tested a forum application using Holochain. You've learned how to create a new Holochain application, understand its layout, work with core concepts, and deploy and test the application.

Now that you have a basic understanding of Holochain development, you can continue exploring more advanced topics, such as:

    Implementing user authentication and authorization
    Integrating your Holochain application with a frontend user interface
    Building more complex data structures and relationships
    Optimizing your application for performance and scalability

For more information and resources, visit the official Holochain developer documentation: https://developer.holochain.org/


9. Integrating with a Frontend User Interface

To create a more user-friendly experience, you can integrate your Holochain application with a frontend user interface. In this section, we'll discuss how to create a basic web frontend for your forum application using React.
9.1. Setting up the React Application

First, install Node.js and npm on your system if you haven't already. Then, install the create-react-app package globally using the following command:

```lua
npm install -g create-react-app
```

Next, navigate to the parent directory of your my_forum_app and run the following command to create a new React application:

```lua
create-react-app forum_frontend
```

This will create a new directory named forum_frontend with a basic React application.
9.2. Installing the Holochain Conductor API

To interact with your Holochain application, you'll need to install the @holochain/conductor-api package. Navigate to the forum_frontend directory and run the following command:

```bash
npm install @holochain/conductor-api
```

9.3. Creating the Frontend Components

Now, create the necessary components for your forum frontend. For the sake of simplicity, we'll create a basic layout with a form for creating new threads and a list of existing threads.

Replace the contents of src/App.js with the following code:

```javascript
import React, { useState, useEffect } from 'react';
import { ConductorApi } from '@holochain/conductor-api';
import './App.css';

function App() {
  const [conductor, setConductor] = useState(null);
  const [threads, setThreads] = useState([]);

  // Initialize the Conductor API when the component mounts
  useEffect(() => {
    async function initConductor() {
      const conductorApi = await ConductorApi.connect('ws://localhost:YOUR_WEBSOCKET_PORT');
      setConductor(conductorApi);
    }
    initConductor();
  }, []);

  // Fetch the list of threads when the conductor is set
  useEffect(() => {
    if (conductor) {
      async function fetchThreads() {
        const fetchedThreads = await conductor.call('forum_zome', 'get_all_threads', {});
        setThreads(fetchedThreads);
      }
      fetchThreads();
    }
  }, [conductor]);

  // Handles submitting the "create thread" form
  async function handleCreateThread(title, content) {
    if (conductor) {
      await conductor.call('forum_zome', 'create_thread', { title, content });
      const newThreads = await conductor.call('forum_zome', 'get_all_threads', {});
      setThreads(newThreads);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Forum App</h1>
      </header>
      <main>
        <ThreadForm onSubmit={handleCreateThread} />
        <ThreadList threads={threads} />
      </main>
    </div>
  );
}

function ThreadForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(title, content);
    setTitle('');
    setContent('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title:
        <input type="text" value={title} onChange={event => setTitle(event.target.value)} />
      </label>
      <label>
        Content:
        <textarea value={content} onChange={event => setContent(event.target.value)} />
      </label>
      <button type="
      
submit">Create Thread</button>
</form>
);
}

function ThreadList({ threads }) {
return (
<ul>
{threads.map(([hash, thread]) => (
<li key={hash}>
<h3>{thread.title}</h3>
<p>{thread.initial_post.content}</p>
</li>
))}
</ul>
);
}

export default App;
```

Make sure to replace `YOUR_WEBSOCKET_PORT` with the actual port number where your Holochain conductor WebSocket is running.

### 9.4. Running the Frontend Application

To start your frontend application, navigate to the `forum_frontend` directory and run the following command:

```bash
npm start
```

This will start a development server and open your web browser to `http://localhost:3000`. You should now see your forum application's frontend interface, where you can create new threads and view existing ones.

## 10. Conclusion

You've now built a basic forum application using Holochain, complete with a frontend user interface. You've learned how to create and deploy a Holochain application, understand its layout, work with core concepts, and integrate it with a web frontend.

As you continue your Holochain development journey, you can explore more advanced topics and techniques to build more complex and feature-rich applications. Good luck, and happy coding!

11. Further Exploration and Resources

Now that you have successfully built a basic forum application using Holochain and integrated it with a frontend, you may want to explore more advanced topics and techniques to further enhance your application or create new ones. Here are some resources and ideas to help you get started:
11.1. Holochain Developer Documentation

The official Holochain developer documentation is a valuable resource for deepening your understanding of Holochain concepts, techniques, and best practices. Be sure to explore the documentation thoroughly:

    Developer guide: https://developer.holochain.org/docs/guide/
    Core concepts: https://developer.holochain.org/docs/concepts/
    API reference: https://developer.holochain.org/docs/api/

11.2. Advanced Topics

Here are some advanced topics to consider as you continue your Holochain development journey:

    User authentication and authorization: Learn how to implement secure and user-friendly authentication and authorization mechanisms in your Holochain applications.
    Modular Holochain applications: Explore the concept of "hApp bundles" and how to create modular applications that can be easily composed and shared.
    Holochain bridges: Understand how to connect multiple Holochain applications and create bridges between them.
    Optimizing performance and scalability: Investigate techniques for optimizing the performance and scalability of your Holochain applications, including efficient data structures, sharding, and caching.

11.3. Community Resources

The Holochain community is an excellent source of support, inspiration, and collaboration. Consider engaging with the community to further your learning and development:

    Holochain Forum: https://forum.holochain.org/
    Holochain GitHub repositories: https://github.com/holochain
    Holochain Discord server: https://holo.host/discord

11.4. Example Applications and Tutorials

Studying existing Holochain applications and tutorials can provide valuable insights and inspiration for your projects. Here are some resources to explore:

    Holochain Open Dev: https://github.com/holochain-open-dev
    Elemental Chat: https://github.com/holochain/elemental-chat
    PeerShare: https://github.com/ZAFOH/peershare
    Holo-REA: https://github.com/holo-rea/holo-rea
    
    