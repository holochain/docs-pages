
# Hello GUI

Welcome to the first GUI tutorial. So far you have interacted with your zome using `curl` or `hc test`, but that's not as nice as having a GUI. Today you will learn how to interact with a Holochain app using a super simple web page.

## Create the HTML page

You will need somewhere for all your GUI code to live. This will be a different piece of software to your Holochain zome code. So choose somewhere outside your Holochain application.

Create a folder for our GUI to live in:

```bash
cd holochain/coreconcepts
mkdir gui
cd gui
```

Create a new file called `index.html` in your favourite editor. It should live at `gui/index.html`. Start by adding a simple HTML template to `index.html`.

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

Inside the `<body>` tag add a button:

```html
  <button type="button">Say Hello</button>
```

To make things a bit nicer on the eyes you can add the `water.css` stylesheet.

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

Enter the `nix-shell` to make sure you have all the dependencies available:
```bash
nix-shell https://holochain.love
```

Once that is all up and running, you can fire up a simple server:

!!! note "Run in `nix-shell`"
    ```bash
    python -m SimpleHTTPServer
    ```

And go have a look in your browser at `http://0.0.0.0:8000/`. You will see something like this:

![](https://i.imgur.com/Tfjd2ZX.png)

## hc-web-client

Time to communicate with the app that you built in the previous tutorials. To make this easy you can use the [hc-web-client](https://github.com/holochain/hc-web-client). It's Holochain's JavaScript library that helps you easily setup a [WebSocket](https://en.wikipedia.org/wiki/WebSocket) connection to your app.

> #### Why WebSocket instead of HTTP?
>
> Having a WebSocket connection open allows your app to send messages to your GUI. While we are not doing that today, it's good to get familiar with this process.

To make this process easy we have precompiled a version of the hc-web-client for you.

Download it [here](/assets/files/hc-web-client.zip), then unzip it and stick it in the root of your GUI directory:
```bash
unzip hc-web-client.zip
```
The files should live here:
```
gui/hc-web-client/hc-web-client-0.5.1.browser.min.js
gui/hc-web-client/hc-web-client-0.5.1.browser.min.js.map
```

Once that's done you can easily link to the compiled js file by adding this `script` tag inside your `body` tag:

```html
    <script
      type="text/javascript"
      src="hc-web-client/hc-web-client-0.5.1.browser.min.js"
    ></script>
```

## Call the zome function

Now that you have linked the hc-web-client.js library you can make a simple zome call with some vanilla JavaScript.

Add this function inside your `<body>` tag:

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

Wait for Holochain to connect and then make a zome call:

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

To make a call from the GUI, your Holochain app must be running. So open up a new terminal window, navigate to the app you built in the previous tutorials, and enter the nix-shell:

```bash
cd holochain/core_concepts/cc_tuts
nix-shell https://holochain.love
```

Now run your app:

!!! note "Run in `nix-shell`"
    Package the app:
    ```bash
    hc package
    ```
    Run the server on port 3401:
    ```bash
    hc run -p 3401
    ```

## Make a zome call
In your other terminal window (the one with the GUI code), start the `SimpleHTTPServer` if it's not still running:

!!! note "Run in `nix-shell`"
    ```bash
    python -m SimpleHTTPServer
    ```

Open up your browser and head to `0.0.0.0:8000` (or refresh the page if it's already open). The page will look the same.

Open you your developer console and click the button. 
You should see something like this:

![](https://i.imgur.com/vhTaH0W.png)

> I'm using Firefox so this might look a little different depending on your browser

Woohoo! You have made a call to your Holochain app using a GUI.

## Render the output

It would be nicer to see the result of the `hello_holo` call on the page. So let's add a somewhere to show it.

Add the following HTML below the button:

```html
    <div>Response: <span id="output"></span></div>
```

The `id="output"` is what we will use to update this element from a JavaScript function.

Add the following lines below you `hello` function.

Add an `show_output` function that takes the result:

```javascript
      function show_output(result) {
```

Get the element that you'll be inserting the output into:

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

Head over to `0.0.0.0:8000` in your web browser (you might need to refresh) and you should see this:

![](https://i.imgur.com/FMxeMx0.png)

Now press the **Say Hello** button and you get your response:

![](https://i.imgur.com/mDBaVlD.png)

Well done! You have a working GUI that can talk to your Holochain app.
