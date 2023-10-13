---
title: Holochain Dev Portal Design System - Code Fences 
layout: ds-layout.njk
layoutId: ds-layout-type
pageStyleId: design-system-containers
---

!!! note
To avoid the meta-ness of trying to code-fence markdown, please look at the source .md files for how to write the markdown. The browser version will serve as reference of what it will look like. Also note that most of these elements are not standard md so they will not show up in their final expression in the Github or VS Code previews.
!!!

There are a number of custom extensions to the `markdown-it-container` plugin that we have implemented. 
Note: `markdown-it-container` requires that each container be specifically implemented, so you can't just use `!!! newblock` or simular. 

Accept as noted attribute blocks (exp: `{#an-id .a-class target=_blank}`) will be honored and express as attributes in the resulting tag.

## Details
Render a Detail/Summary block. 
!!! details The summary text
sit amet tellus cras adipiscing enim eu turpis egestas pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices eros in cursus turpis massa tincidunt dui ut ornare lectus sit
!!!

The contents of the details tag after the summary tag is wrapped in a div with a class of `details-content`. If an attributes block is applied to the `details` line the attributes are applied to overall `<details>` tag.

Details synonyms: These get the block name as an extra class name.
!!! dig-deeper The Dig Deeper summary text
sit amet tellus cras adipiscing enim eu turpis egestas pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices eros in cursus turpis massa tincidunt dui ut ornare lectus sit
!!!

## Output Block
Can wrap around code fences to prevent Copy buttons form being added to the code block. See [Code Fences](../code-fences/) for details.

## Admonitions

- ### Tip
  #### No Title
  !!! tip {#tip}
  Tip contents
  !!!

  #### With a Title
  !!! tip Very Impressive Title Text
  Tip contents
  !!!

- ### Note
  #### No Title
  !!! note 
  Note contents
  !!!

  #### With a Title
  !!! note Very Impressive Title Text
  Note contents
  !!!

- ### Info
  #### No Title
  !!! info 
  Info contents
  !!!

  #### With a Title
  !!! info Very Impressive Title Text
  Info contents
  !!!

- ### Learn
  #### No Title
  !!! learn 
  Learn contents
  !!!

  #### With a Title
  !!! learn Very Impressive Title Text
  Learn contents
  !!!

## Site content specific containers
All the below just apply a specific class to a surrounding div. These were implemented for very specific site style needs. More such can be created if need be.

- ### coreconcepts-intro
  ::: coreconcepts-intro
  Sit amet tellus cras adipiscing enim eu turpis egestas. Pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices eros in cursus turpis massa tincidunt dui ut ornare lectus sit.
  :::

- ### coreconcepts-orientation
  ::: coreconcepts-orientation
  Sit amet tellus cras adipiscing enim eu turpis egestas. Pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices eros in cursus turpis massa tincidunt dui ut ornare lectus sit.
  :::

- ### coreconcepts-storysequence
  ::: coreconcepts-storysequence
  Sit amet tellus cras adipiscing enim eu turpis egestas. Pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices eros in cursus turpis massa tincidunt dui ut ornare lectus sit.
  :::

