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
cd holochain/coreconcepts
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

Inside the `<body>` tag, add a button:

```html
  <button type="button">Say Hello</button>
```

To make things a bit easier on the eyes, you can add the `water.css` stylesheet.

Add this water.css link inside the `<head>` tag:

```html
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/dark.min.css"
    />
```

## Run a simple server

??? question "Your `index.html` should now look like:"
    ```html
    <!DOCTYPE html>

    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <title>Hello GUI</title>
        <meta name="description" content="GUI for a Holochain app" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/dark.min.css"
        />
      </head>

      <body>
        <button type="button">Say Hello</button>
      </body>
    </html>
    ```

Enter the `nix-shell` to make sure you have all the available dependencies:
```bash
nix-shell https://holochain.love
```

Once that is all up and running, you can fire up a simple server:

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    python -m SimpleHTTPServer
    ```
    Or if you use Python 3, use this command instead:
    ```bash
    python -m http.server
    ```

Go have a look in your browser at `http://0.0.0.0:8000/`. You will see something like this:

![](https://i.imgur.com/Tfjd2ZX.png)

## hc-web-client

It's time to communicate with the app you built in the previous tutorials. To make this easy, you can use the [hc-web-client](https://github.com/holochain/hc-web-client). It's Holochain's JavaScript library that helps you easily set up a [WebSocket](https://en.wikipedia.org/wiki/WebSocket) connection to your app.

> #### Why WebSocket instead of HTTP?
>
> Having an open WebSocket connection allows your app to send messages to your GUI. While we are not doing that today, it's good to get familiar with the process.

To make this process is easy, we have precompiled a version of the hc-web-client for you.

Download it [here](/assets/files/hc-web-client.zip), then unzip it and stick it in the root of your GUI directory:
```bash
unzip hc-web-client.zip
```
The files should live here:
```
gui/hc-web-client/hc-web-client-0.5.1.browser.min.js
gui/hc-web-client/hc-web-client-0.5.1.browser.min.js.map
```

Once that's done, you can easily link to the compiled js file by adding this `script` tag inside your `body` tag:

```html
    <script
      type="text/javascript"
      src="hc-web-client/hc-web-client-0.5.1.browser.min.js"
    ></script>
```

## Call the zome function

Now that you have linked the hc-web-client.js library, you can make a simple zome call with some vanilla JavaScript.

Add this function inside your `<body>` tag:
\#S:INCLUDE,MODE=gui

```html
    <script type="text/javascript">
```

Make a WebSocket connection to Holochain on port 3401:

```javascript
      var holochain_connection = holochainclient.connect({
        url: 'ws://localhost:3401',
      });
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
      callZome('test-instance', 'hello', 'hello_holo')({args: {}})
```

Log the result in the browser's console:

```javascript
          .then((result) => console.log(result))
        })
      }
```

Close the script tag:

```html
    </script>
```

This hello function will connect to your app through WebSocket on port `3401`, call the hello zome function, and print the result to your browser's console.

Let's make your button call this function by adding an `onclick` event handler.

Add this button inside the `<body>` tag:

```diff
-  <button type="button">Say Hello</button>
+  <button onclick="hello()" type="button">Say Hello</button>
```

## Run your app

??? question "Check your index.html:"
    ```html
    <!DOCTYPE html>

    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <title>Hello GUI</title>
        <meta name="description" content="GUI for a Holochain app" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/dark.min.css"
        />
      </head>

      <body>
        <button onclick="hello()" type="button">Say Hello</button>
        <script
          type="text/javascript"
          src="hc-web-client/hc-web-client-0.5.1.browser.min.js"
        ></script>
        <script type="text/javascript">
          var holochain_connection = holochainclient.connect({
            url: 'ws://localhost:3401',
          });
          function hello() {
            holochain_connection.then(({callZome, close}) => {
          callZome('test-instance', 'hello', 'hello_holo')({args: {}})
              .then((result) => console.log(result))
            })
          }
        </script>
      </body>
    </html>
    ```

Your Holochain app must be running to make a call from the GUI. So open up a new terminal window, navigate to the app you built in the previous tutorials, and enter the nix-shell:

```bash
cd holochain/core_concepts/cc_tuts
nix-shell https://holochain.love
```

Now, run your app:

!!! note "Run in `nix-shell https://holochain.love`"
    Package the app:
    ```bash
    hc package
    ```
    Run the server on port 3401:
    ```bash
    hc run -p 3401
    ```

## Make a zome call
In your other terminal window, the one with the GUI code, start the `SimpleHTTPServer` if it's not still running:

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    python -m SimpleHTTPServer
    ```

Open your browser and head to `0.0.0.0:8000` (or refresh the page if it's already open). The page will look the same.

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

Add the following lines below your `hello` function.

Add an `show_output` function that takes the result:

```javascript
      function show_output(result) {
```

Get the element into which you'll be inserting the output into:

```javascript
        var span = document.getElementById('output');
```

Parse the zome function result as JSON:

```javascript
        var output = JSON.parse(result);
```

Set the contents of the element to the zome function result:

```javascript
        span.textContent = ' ' + output.Ok;
      }
```

Finally, update the `hello` function to call your new `show_output` function instead of `console.log()`.
```diff
-            result => console.log(result),
+            result => show_output(result),
```

<script id="asciicast-oTse2TbmFJImX9Ra04cUc7xRo" src="https://asciinema.org/a/oTse2TbmFJImX9Ra04cUc7xRo.js" async data-autoplay="true" data-loop="true"></script>

## Test the output works

Head over to `0.0.0.0:8000` in your web browser (you might need to refresh), and you should see this:

![](https://i.imgur.com/FMxeMx0.png)

Now, press the **Say Hello** button and you get your response:

![](https://i.imgur.com/mDBaVlD.png)

Well done! You have a working GUI that can talk to your Holochain app.

## Key takeaways
- You can use regular, web front ends to connect to a conductor over WebSocket.
- The simplest web front end requires JavaScript and HTML.
- Zome functions are callable from the GUI in a similar way to curl.

## Learn more
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
