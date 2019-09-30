# Install Holochain

## Select your operating system

## Install Holochain tools

Now that you have installed Nix, you can run a development shell that contains all the prerequisites, including the correct Rust version and the Holochain tools. This shell won’t interfere with your current Rust installation. Run this command:

```
nix-shell https://holochain.love
```

The first time you run this command it will take some time to download and build, but it will be much faster the next time. When it’s complete, you will see a new prompt starting with:

<code>[nix-shell:</code>

Test that Holochain is working by running:

```
[nix-shell:hc --version
```

and:

```
[nix-shell:holochain --version
```

You should see something like:

<code>[nix-shell: hc 0.0.29-alpha2</code>

<code>[nix-shell: holochain 0.0.29-alpha2</code>

### Update/Uninstall
With nix-shell, you don’t need to worry about updating or uninstalling; when you enter the nix-shell, everything is the latest release and is then cleaned up when you exit.

### Editor
In most cases you can run your editor as normal. However, if you are using an integrated developer environment or IDE that needs to communicate with the Holochain dependencies then you should launch it from inside the nix-shell.

<blockquote>To do this just open your editor while you are in the nix-shell like:</blockquote>

```
[nix-shell:vim my_file.rs
```

## Build your first DNA

### Your first app

The hc tool can generate the basics of a new Holochain app.<br>
hc is available from the previous step.

<blockquote>If you are using nix-shell, enter it before continuing.</blockquote>

The command to generate a new app is <code>hc init</code><br>
Let’s create a new app called <code>my_first_app</code>

