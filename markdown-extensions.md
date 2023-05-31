# Markdown Extensions

Some `markdown-it` plugins have been added to extend the markdown we can use. This page is to document the markdown syntax itself, as opposed to the implementation details.

## Details
Creates a `details` block [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details).
It takes a title after the `details` keyword and multiline markdown in between the !!! markers. The title is slugified and 
added as an `id` attribute to the summary tag. 
The following:
```
!!! details Hi
Blah blah
!!!
```
renders as 
```
<details>
  <summary id="hi">Hi</summary>
  <p>Blah blah</p>
</details>
```