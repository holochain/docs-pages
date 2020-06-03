\#S:MODE=test
\#S:EXTERNAL=rust=hello_gui.rs
\#S:EXTERNAL=javascript=hello_gui.js=test

# Hello GUI

!!! tip "Time & Level"
    Time: ~1 hours | Level: Beginner

Welcome to the first GUI tutorial. So far, you have interacted with your zome using `curl` or `hc test`, but that's not as nice as having a GUI.

### What will you learn
Today, you will learn how to interact with a Holochain app using a simple web page.
Using a WebSocket connection, data will be passed to and from a JavaScript/HTML web page.

### Why it matters
It's likely you will want to write a GUI for your future applications, so it's helpful to see how to connect a front end to your back end zome. This is not the only way to write a GUI for a Holochain app, but it should be familiar if you're used to web front ends.

## Create the HTML page

You will need somewhere for all your GUI code to live. This will be a different piece of software to your Holochain zome code so choose somewhere outside your Holochain application.

Create a folder for the GUI to live in:

```bash
cd ~/holochain/coreconcepts
mkdir gui
cd gui
```

Create a new file called `index.html` in your favorite editor. It should live at `gui/index.html`. Start by adding a simple HTML template to `index.html`.

Add this modern template:


```html
<!DOCTYPE html>

<html lang="en">
  <head>
    <meta charset="utf-8" />

    <title>Hello GUI</title>
    <meta name="description" content="GUI for a Holochain app" />
  </head>

  <body>
  </body>
</html>
```

\#S:INCLUDE,MODE=gui

\#S:HIDE

```html
<!DOCTYPE html>

<html lang="en">
  <head>
    <meta charset="utf-8" />

    <title>Hello GUI</title>
    <meta name="description" content="GUI for a Holochain app" />
```

To make things a bit easier on the eyes, you can add the `water.css` stylesheet.

Add this water.css link inside the `<head>` tag:

```html
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/dark.min.css"
    />
```
\#S:HIDE

```html
  </head>

  <body>
```
Inside the `<body>` tag, add a button that calls the hello function that we will add soon:

```html
  <button onclick="hello()" type="button">Say Hello</button>
```


\#S:EXTRA
```html
      </body>
    </html>
```

\#S:CHECK=html=gui


## hc-web-client

It's time to communicate with the app you built in the previous tutorials. To make this easy, you can use the [hc-web-client](https://github.com/holochain/hc-web-client). It's Holochain's JavaScript library that helps you easily set up a [WebSocket](https://en.wikipedia.org/wiki/WebSocket) connection to your app.

> #### Why WebSocket instead of HTTP?
>
> Having an open WebSocket connection allows your app to send messages to your GUI. While we are not doing that today, it's good to get familiar with the process.

To make this process is easy, we have precompiled a version of the hc-web-client for you.

Download it [here](/assets/files/hc-web-client-0.5.3.zip) or run this command:

```bash
curl https://developer.holochain.org/assets/files/hc-web-client-0.5.3.zip > hc-web-client-0.5.3.zip
```

Then unzip it and stick it in the root of your GUI directory:

```bash
unzip hc-web-client-0.5.3.zip
```

The files should live here:

```
gui/hc-web-client-0.5.3/hc-web-client-0.5.3.browser.min.js
gui/hc-web-client-0.5.3/hc-web-client-0.5.3.browser.min.js.map
```

Once that's done, you can easily link to the compiled js file by adding this `script` tag inside your `body` tag:

```html
    <script
      type="text/javascript"
      src="hc-web-client-0.5.3/hc-web-client-0.5.3.browser.min.js"
    ></script>
```

## Call the zome function

Now that you have linked the hc-web-client.js library, you can make a simple zome call with some vanilla JavaScript.

Add this script tag inside your `<body>` tag:

```html
    <script type="text/javascript" src="hello.js"></script>
```

\#S:EXTRA
```html
      </body>
    </html>
```

\#S:CHECK=html=gui


## Write the function that calls your zome
The hello function will connect to your app through WebSocket, call the hello zome function, and print the result to your browser's console.

Create a file in the same directory as the `index.html` called `hello.js`.

Add the following code to this file.

Make a WebSocket connection to Holochain :
```javascript
var holochain_connection = holochainclient.connect();
```

Add a `hello()` JavaScript function so you can call it from your HTML:

```javascript
function hello() {
```

Wait for Holochain to connect, and then make a zome call:

```javascript
  holochain_connection.then(({callZome, close}) => {
```

Call the `hello_holo` zome function in the `hello` zome running on the `test-instance` instance:

```javascript
    callZome(
      'test-instance',
      'hello',
      'hello_holo',
```

Log the result in the browser's console:

```javascript
    )({args: {}}).then(result => console.log(result));
  });
}
```

\#S:CHECK=javascript=gui


## Setup a bundle file

The Holochain CLI `hc` can run the conductor, your hApp and your GUI.
All you need to do is setup a bundle file to specify where things are.

Create a new file in your hApp's root folder `cc_tuts/` called `bundle.toml` and add the following lines.

There's no bridges (connections between separate zomes) in our hApp so this is empty.
```toml
bridges = []

```
This is the one and only instance you need for this tutorial.
It contains the path to the dna and the hash (which needs to be updated as you make changes).
```toml
[[instances]]
name = "cc_tuts"
id = "__cc_tuts"
dna_hash = "QmQMHnyGd43Yuwc2YUrHxBxPzJBhtTkD21ftgU2qkTQZcb"
uri = "file:dist/cc_tuts.dna.json"

```
This is the GUI setup.
It points to the root folder of your GUI.
Mine is up one level (../) and in a folder called `gui`.
You might need to edit this to match where you GUI lives (where the index.html is).
```toml
[[UIs]]
name = "CC Tuts"
id = "cc_tuts_ui"
uri = "dir:../gui"
```
This links the GUI to the dna.

```toml
[[UIs.instance_references]]
ui_handle = "test-instance"
instance_id = "__cc_tuts"
```

??? question "Check your bundle.toml:"
    ```toml
    bridges = []

    [[instances]]
    name = "cc_tuts"
    id = "__cc_tuts"
    dna_hash = "QmQMHnyGd43Yuwc2YUrHxBxPzJBhtTkD21ftgU2qkTQZcb"
    uri = "file:dist/cc_tuts.dna.json"

    [[UIs]]
    name = "CC Tuts"
    id = "cc_tuts_ui"
    uri = "dir:../gui"

    [[UIs.instance_references]]
    ui_handle = "test-instance"
    instance_id = "__cc_tuts"
    ```


## Run the bundle
Make sure you are in you hApp's directory `cc_tuts/` and not the GUI directory.
Enter the nix-shell if you haven't already and package / run the hApp.

!!! note "Run in `nix-shell https://holochain.love`"
    Package the app:
    ```bash
    hc package
    ```
    Run the conductor:
    ```bash
    hc run
    ```

??? fail "Provided DNA hash does not match actual DNA hash!"
    If you get this error it means you need to update the dna hash in the `bundle.toml` file.
    You can get the hash with `hc hash`.
    Here is a convenient script to do it automatically:
    ```bash
    #!/bin/bash
    DNA_HASH=$(hc hash)
    LEN_OUT=${#DNA_HASH}
    echo ${DNA_HASH}
    HASH=${DNA_HASH:$(expr $LEN_OUT - 46):$LEN_OUT}
    sed -i "s/dna_hash = \".*/dna_hash = \"${HASH}\"/g" $1
    ```
    You can put this in a file called update_hash.sh and give it permission to run (`chmod 755 update_hash.sh`).
    Then call `./update_hash.sh bundle.toml` to update the hash.

## Make a zome call
Open your browser and head to `127.0.0.1:8888`

Open your developer console and click the button.
You should see something like this:

![](https://i.imgur.com/vhTaH0W.png)

> I'm using Firefox, so this might look a little different depending on your browser.

Woo-hoo! You've made a call to your Holochain app using a GUI.

## Render the output

It would be nicer to see the result of the `hello_holo` call on the page, so let's add somewhere to show it.

Add the following HTML below the button:

```html
    <div>Response: <span id="output"></span></div>
```


The `id="output"` is what we will use to update this element from a JavaScript function.

\#S:HIDE
```html
  </body>
</html>
```

\#S:CHECK=html=gui

## Add the show output function

Back in the hello.js file add the following lines below your `hello` function.

Add a `show_output` function that takes the result:

```javascript
function show_output(result) {
```

Get the element into which you'll be inserting the output:

```javascript
  var span = document.getElementById('output');
```

Parse the zome function result as JSON:

```javascript
  var output = JSON.parse(result);
```

Set the contents of the element to the zome function result:

```javascript
  span.textContent = output.Ok;
}
```
\#S:CHANGE
Finally, update the `hello` function to call your new `show_output` function instead of `console.log()`.
```diff
-    )({args: {}}).then(result => console.log(result));
+    )({args: {}}).then(result => show_output(result));
```

\#S:CHECK=javascript=gui

## Run the bundle
Make sure you are in you hApp's directory `cc_tuts/` and not the GUI directory.
Enter the nix-shell if you haven't already and package / run the hApp.

!!! note "Run in `nix-shell https://holochain.love`"
    Package the app:
    ```bash
    hc package
    ```
    Run the conductor:
    ```bash
    hc run
    ```

## Test the output works

Head over to `127.0.0.1:8888` in your web browser (you might need to refresh), and you should see this:

![](https://i.imgur.com/FMxeMx0.png)

Now, press the **Say Hello** button and you get your response:

![](https://i.imgur.com/mDBaVlD.png)

Well done! You have a working GUI that can talk to your Holochain app.

!!! success "Solution"
    You can check the full solution to this tutorial on [here](https://github.com/freesig/cc_tuts/tree/hello_gui).

## Key takeaways
- You can use regular, web front ends to connect to a conductor over WebSocket.
- The simplest web front end requires JavaScript and HTML.
- Zome functions are callable from the GUI in a similar way to curl.

## Learn more
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
