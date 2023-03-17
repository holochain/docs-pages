---
title: Holochain Dev Portal Design System - Code Fences 
layout: ds-layout.njk
layoutId: ds-layout-type
pageStyleId: design-system-code-fences
---

Examples of code fence look and feel

<div class="code-blocks">

## Code Blocks

### With Copy button

Single line
```bash
nix run github:/holochain/holochain#hc-scaffold -- web-app
```

Multiple line
```text 
? Choose UI framework: ›
❯ Vue
  Svelte
  Lit
```

### Without Copy button

To surpress the copy buttom you can wrap the code block in a `::: no-copy-button` container

Single line
::: no-copy-button
```bash
nix run github:/holochain/holochain#hc-scaffold -- web-app
```

Multiple line
```text 
? Choose UI framework: ›
❯ Vue
  Svelte
  Lit
```
:::

</div>