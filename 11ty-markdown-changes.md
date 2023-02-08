
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
  - coreconcepts-intro, coreconcepts-orientation, and coreconcepts-storysequence divs have been created as MD containers. Use:
    ```
    ::: coreconcepts-intro
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

## Open in new window 
- add `{target=_blank}` after link markdown parens

## Button for link
- add `{.btn-purple}` after link markdown parens

## Center an Image
```
![](/assets/img/concepts/8.8-assigned-capability.png)
{.center}
```
Note: The new line after the image is required to put the class in the enclosing <p>

## Items to add to README
- using callMacroByName



