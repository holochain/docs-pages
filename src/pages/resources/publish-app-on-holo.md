---
title: Publish an App on the Holo Hosting Network
---

Publishing a hApp means making it available on the Holo network for your registered website to connect to and interact with, similar to other cloud hosting platforms. Each user is its own separate app instance, called a [cell](/references/glossary/#cell), on one of our hosts, and Holo will automatically handle instance assignment, provisioning, and load balancing across hosts.

On the Holo network, users' cells run on hosts' devices. This context has security implications which require architectural changes compared to the standard Holochain setup, including:

* Holo has special client-side key management infrastructure to preserve users' agency. This is handled by a drop-in library that provides a full authentication process.
* The UI does not have direct access to the conductor's [admin API](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AdminRequest.html).
* Special read-only nodes can optionally be provisioned on the Holo network for high availability and public access to application data. These nodes must be given special exemption from any [membrane proofs](/references/glossary/#membrane-proof) (membership codes) your app has implemented.

These changes together, along with the fact that the Holo network is running the Holochain 0.2.x pre-release, mean that backends UIs need to be adapted for Holo. You can learn how to do this for your hApp in the [Enable Apps for Holo Hosting](/references/enable-holo/) guide.

This guide assumes that you've already adapted your Holochain app to work on the Holo network or have acquired a Holo-ready app and ready to deploy it to the Holo network. It will take you through the following steps to get your app live:

1. Register as a hApp Manager with Holo.
2. Request and receive a registration code.
3. Use your registration code to create an account with the Cloud Console.
4. Submit a hApp bundle and the URL of the hApp's UI to create a hApp listing in Cloud Console.

If you get stuck, reference our more robust step-by-step support document.

If you're still stuck, please reach out to us via the [hApp managers category of the Holo forum](https://forum.holo.host/c/happ-managers/64) or our [support email](mailto:help@holo.host) and let us know where you're stuck.

## Prerequisites

You must have:

* A hApp bundle (one or more DNAs compiled to a `.happ` file with the `hc app pack` tool) available for download at a publicly accessible URL (for example, a GitHub repository). This bundle must have been compiled with versions of the Holochain HDI and HDK libraries that are compatible with the Holo hosting network (currently running Holochain 0.2.4, which is compatible with HDI 0.3.4 and HDK 0.2.4).
* A UI that uses the latest version of Holo's [Web SDK](https://github.com/Holo-Host/web-sdk) to access the hApp's backend, hosted over HTTPS on its own domain. We recommend Cloudflare's [Free plan](https://www.cloudflare.com/en-ca/plans/free/) for hosting. The Chaperone URL must be `https://chaperone.holo.hosting`, as in this example:

    ```typescript
    const client: WebSdk = await WebSdk.connect({
      chaperoneUrl: 'https://chaperone.holo.hosting',
      authFormCustomization: {
        appName: 'my-app', // Display name on the credentials form. You can also set it in Cloud Console when deploying
      }
    });
    ```

    Learn more about [how to adapt your UI to Holo hosting](/references/enable-holo/#migrate-from-a-pure-holochain-app).
* Ability to edit the DNS records of the domain name that your UI is hosted at.

## 1. Register as a hApp manager

### New registrant --- register with Holo

If you've already registered for a different role (either a host or a HoloFuel user), you can skip this step and go on to [register yourself as a hApp manager](#).

To register, go to [register.holo.host](https://register.holo.host) and choose "Yes, it's my first time registering." Fill out the form, selecting **hApp Manager** when asked you're registering as a HoloPort, hApp manager, or HoloFuel user.

After completing all the fields, tick the box to acknowledge your acceptance of the Terms of Service, and click on **Submit**. You'll receive a confirmation email in your inbox with the subject "hApp Manager Registration Submission".

At this point someone from the Holo team will review and approve your submission. Once approved, you'll receive a registration code that you'll use in the next step. This will come in another email from Holo with the subject "Publisher Alpha Program - Registration Code".

### Previously registered with Holo --- register for an additional role

Holo Springboard is the application to use when you've already registered for a role in the Holo network and would like to register for additional roles (Host, hApp manager, or HoloFuel user). At [springboard.holo.host](https://springboard.holo.host), input the email you've used for a previous Holo registration and a "magic" login link will be sent to your email.

Click the link in the email and return to the previous tab, where you will have been logged into your Holo Springboard account. From there, select the option to add a hApp manager registration.

Next, you'll receive a hApp manager registration code that you'll use to sign up for your Cloud Console account. It's currently a manual process for us to generate and send you this code. When the code is ready, you'll receive another email from Holo with the subject line: "hApp Manager Alpha Program - Registration Code".

## 2. Sign up to Cloud Console

Once you've received your hApp manager registration code, go to [cloud-console.holo.host/signup](https://cloud-console.holo.host/signup). Input your registration code, the email you used for registration, and a strong password. **Please note this password cannot be changed, so protect it accordingly.**

Upon successfully signing into the app, you'll be in your Cloud Console account and asked to set your account display name before you can proceed to your dashboard.

Your account display name is the name that will optionally appear on the hApp login screen next to the words "published by: " under each of your hApps' names. Please note that it can't be changed at this time.

## 3. Deploy a hApp

Click on "Add a hApp" on your Cloud Console dashboard and fill in the form. You can save your hApp as a draft, or deploy your hApp immediately.

**IMPORTANT! What you enter in the following three fields can make the difference between a successful or unsuccessful deployment.**

* In the "Link to .hApp file" field, enter a publicly accessible URL that the hApp bundle can be downloaded from.
* The optional **network seed** acts like a group password, allowing you to reuse a hApp bundle while creating a separate, isolated network space. This can be used for 'white label' apps, for example a generic chat hApp bundle that communities can create their own deployments of. (Note that self-hosted users --- people using the hApp on their own devices rather than via Holo hosting --- will need to know this network seed and enter it at install time in order to get access. Holo-hosted users will not need to do this.)
* In the "URL of Hosted UI" field, enter the domain name that the UI is hosted at.

Once you've submitted the listing, you'll see the following success message. It will give you instructions for adding a `TXT` record to the domain name of the URL where your UI is hosted. Log into your DNS manager and add this record.

If all went well, you should be able to access and use your hApp at your hosted UI URL within 30 minutes. If you end up waiting a few hours and are not able to access your hApp, let us know so we can help troubleshoot.

Please provide us with any feedback you have about the overall UX of the form. Your feedback is sincerely appreciated and will be discussed. We want to know about any parts that are confusing or any inspiration you have that might make it easier for other hApp managers. You can do this via the [hApp managers category of the Holo forum](https://forum.holo.host/c/happ-managers/64).

## 4. Pause or remove a hApp

Pausing a hApp is straightforward. The change takes effect quite quickly (within minutes). You'll see the "Paused" label for your paused hApps listed on your dashboard.

At this time, only deployed or paused hApps can be removed from hosting (drafts cannot be removed). To remove a hApp from hosting, access the edit form of your paused or published hApp, scroll to the bottom, and click on "Stop Hosting". Follow the instructions, and upon successful removal you will no longer see the hApp show in your list of hApps on your dashboard view. The change should take effect within minutes.

(Note: Currently only three hApps show neatly within the frame of the dashboard view; you can view all hApps via the "See all" link.)