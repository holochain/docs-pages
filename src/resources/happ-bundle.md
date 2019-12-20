# hApp Bundle

A Holochain app is typically made from multiple DNAs that each provide a domain of functionality, similarly to microservices, along with a UI. A hApp bundle lets developers specify all the required components of an application, along with file locations, internal handles, and communication channels. This allows a user to install the hApp without needing to edit a config file.

<div class="coreconcepts-orientation" markdown=1>
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. How hApp bundles act as a manifest for your application's code
2. How hApp bundles make deployment easier for you and your users

### <i class="far fa-atom"></i> Why it matters

[hApp bundles](https://github.com/holochain/holoscape/tree/master/example-bundles) make it easier for users to install and begin working with their Holochain application. Instead of asking them to manually tweak their conductor config file, all you need to do is supply the expected config and let the conductor adjust itself. This makes deployment and execution more consistent.
</div>

## A cargo ship without a manifest

We've talked previously about how applications are built in Holochain, giving users flexibility and autonomy when it comes to their experience. Keeping all the moving parts coordinated is crucial for ensuring that that experience stays constant as code is updated and environments change. 

To see why this is so important, imagine you're the captain of a cargo boat. You've loaded your ship full of containers with all kinds of goods—TVs, refrigerators, clothing, toys, etc. You sail from one part of the world to another. When you arrive, you need to know exactly what you have in your ship's hold—how many of each kind of thing and where they’re located—in order to offload quickly and get them to their proper destinations. How do you accomplish this? You could go by memory, but that would drag out the process and any memory lapse would cause even more delays or errors in shipment. Instead, you create a manifest, a detailed list specifying every item of cargo on board the ship. Now, offloading can be fast and accurate. 

A hApp bundle is like a manifest for the various components of your application. It lets you specify the exact components, where to find them, and how they relate to one another.

## Deployment made easy

Without hApp bundles, you would have to ensure that every part of your application, including each DNA instance and UI, is calling up the correct resource every time, even when deployed in a different environment. This would be a big headache, not just for you, but for your users. 

Fortunately, a hApp bundle takes care of this work for you. It lets you specify:

- [DNA instances](../../glossary/#dna-instance) that comprise the back-end, along with the location of the DNA files
- [bridges](../../glossary/#bridge) between instances
- an optional, web-based UI package for the front-end
- internal IDs for instances and bridges so other components of the application can reference them consistently

hApp bundles also give you some leeway in terms of how you can deploy your application. If you want your hApp to download all its code from repos at the time of installation, you can deploy with just a manifest file containing links to the various repos. On the other hand, if you want your hApp to have all its DNAs and UIs in one self-contained archive, you just specify the file path for each component relative to its location in the archive.

## Key takeaways

hApp bundles make the process of deploying an application in Holochain much easier in the following ways:

- They identify which DNAs will be used by a particular application and how they will be instantiated and bridged.
- They point to a web-based UI package.
- They let developers identify their components in a consistent manner, independent of how their end user's environment is set up. 
- They give developers flexibility as to whether their hApps are deployed as a self-contained archive or as separately downloaded files.

## Learn more

- [Core Concept: Application Architecture](../../concepts/2_application_architecture/)
- [Core Concept: Hello Me Tutorial](../../tutorials/coreconcepts/hello_me/)
- [Core Concept: Hello Gui Tutorial](../../tutorials/coreconcepts/hello_gui/) 
- [hApp Bundle Definition](https://github.com/holochain/holoscape/blob/master/example-bundles/README.md)
