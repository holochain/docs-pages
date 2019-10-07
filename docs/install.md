# Install Holochain

<div class="h-tile-container">
	<div class="h-tile tile-active">
		<a href="#">
			<h3><img src="/custom/icon-apple.svg"> Mac & Linux</h3>
		</a>
	</div>
	<div class="h-tile">
		<a href="#">
			<h3><img src="/custom/icon-windows.svg"> Windows <span>or Vagrant/Docker</span></h3>
		</a>
	</div>
</div>

### System Requirements

#### Hardware:

* 8GB+ RAM (16GB+ recommended)
* 4+ CPU (6+ CPU recommended)
* 30GB+ available disk space
* Internet connection

#### Pre-installed software:

* xCode developer tools (Mac only)

### Mac / Linux Environment Setup

We use Nix toolkit to manage the installation of our dev tools. Install the Nix package manager with this command:

```
curl https://nixos.org/nix/install
```

Check that it installed correctly:

```
nix-env --versioncopy
```

You should see something like:

<code>nix-env (Nix) 2.2.2</code>

If you’d like to know more about NixOS and why we use it, you can find information on Nix here.

---

## Install Holochain Tools

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

> To do this just open your editor while you are in the nix-shell like:

```
[nix-shell:vim my_file.rs
```

---

## Build Your First DNA

### Your first app

The hc tool can generate the basics of a new Holochain app.<br>
hc is available from the previous step.

> If you are using nix-shell, enter it before continuing.

The command to generate a new app is <code>hc init</code><br>
Let’s create a new app called <code>my_first_app</code>

To do this with hc, run:

```
hc init my_first_app
```

> Note: If you get this <code>Error: directory is not empty</code>, it’s because the <code>my_first_app</code> directory already exists. To remove it, simply run <code>rm -fr my_first_app</code>.

The basic structure of a Holochain project is now in the “my_first_app” folder. Explore it in a file browser or text editor.

Once you have a feel for what was created, try generating a "zome."
A “zome” is what we call the source code of a Holochain app.

First, make sure your terminal is working from the <code>my_first_app</code> folder.

Run the following to move to the apps directory:

```
cd my_first_app
```

To generate a zome, run the following command:

```
hc generate zomes/my_zome
```

This will add a Rust project into the <code>zomes/my_zome</code> sub-folder.
You can now open the generated code in a text editor and start building!

The generated zomes come with a simple automated test suite.
The tests can be found in <code>my_first_app/test/index.js</code>.
The tests can be run with the test command:

```
hc test
```

To learn more about the hc tool, run the help command:

```
hc help
```

---

## Next Steps

1. **Read through the [Holochain Core Concepts](../concepts/introduction/).**
2. Learn more about Holochain development in the [Guidebook](../guide/welcome/).
3. Learn more about Rust in Holochain [API Reference Documentation](../api/latest/hdk/), [Crates.io](https://crates.io/search?q=Holochain), and the [Rust book](https://doc.rust-lang.org/book/).
4. Learn more about Nix as a dev dependency and why we’re using it in the [Holonix documentation](https://github.com/holochain/holonix).