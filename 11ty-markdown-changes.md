
## Titles go in Front Matter
  - H1s will be in higher level layouts. Do not include in md body.
  - Page title should go in Front Matter at top of MD file.
    Example:
    ```
    ---
    title: Create a New App
    ---
    ```

## Divs
  - No more `markdown=1`, instead leave a blank line after.
  - Core Concepts intro and orientation divs have had their `coreconcepts-` prefixes removed and can now be created as MD containers. `coreconcepts-storysequence` blocks have been replaced with individual `storystep` blocks around each step in a story sequence. Use:
    ```
    ::: intro
    words words
    :::
    ```
    If you need to nest containers add an additional `:` on each outer layer.

## Admonitions
  - Do NOT indent contents of Admonitions
  - Admonitions must be closed with `!!!`
  - You can add a title (Example: ```!!! note Run in `nix-shell https://holochain.love` ```), Otherwise it will use the name of the Admonition.

## Code Fences
  - Include language (i.e.: `bash`) always.
  - If you want to surpress the copy button wrap the code block in a `::: output-block` container
  - Code blocks meant to be copied and pasted into a terminal should use `shell` rather than `bash`; they'll automatically get styled with a non-copyable `$` at the beginning of the first line.

## Open in new window
- add `{target=_blank}` after link markdown parens

## Button for link
- add `{.btn-purple}` after link markdown parens

## Center an Image
```
![](/assets/img/concepts/8.8-assigned-capability.png)
{.center}
```
Note: The new line after the image is required to put the class in the enclosing `<p>`

## Tweak the size of an image
Obviously it would be optimal to actually resize the image. But you can tweak the max-width with the classes
`sz10p` (10%) through `sz200p` (200%)
```
![](/assets/img/concepts/8.1-calls.png){.sz50p}
```

## Table of contents
An on-page table of contents is generated automatically for every page from all `h2` to `h6` elements that have `id` attributes. If you don't want this to happen, put `tocData: false` in your page's front matter.

If you want to craft a custom table of contents, instead assign a nested array to `tocData` that looks like this:

```yaml
tocData:
  - text: First section header
    href: first-section-header
    children:
      - text: Subsection header 1
        href: subsection-header-1
      - text: Subsection header 2
        href: subsection-header-2
  - text: Second section header
    href: second-section-header
  - text: Conclusion
    href: conclusion
```

There are two things to note about the above:

* IDs are automatically generated for all headers; they'll be the slug of the header text. You can override a header's ID with a `{#custom-id}` attribute.
* Although the `href` property suggests it should be a resolvable URL, don't put the `#` at the beginning of its value.

## Items to add to README
- using callMacroByName



