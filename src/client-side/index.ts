function copyCodeBlockClickHandler(e: Event) {
  const button = e.target as HTMLButtonElement;
  const codeEl = button.parentElement?.querySelector("code");
  navigator.clipboard.writeText(codeEl?.innerText || "")
}

function addCopyButtonsToCodeSections() {
  const codeElms = document.querySelectorAll('pre > code:not(.no-copy-button)');
  
  // console.log(codeElms);

  codeElms.forEach((codeEl: Element) => {
    console.log(codeEl);
    const preEl = codeEl.parentElement!;
    
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", copyCodeBlockClickHandler);

    preEl.appendChild(copyButton);
  });
}

addCopyButtonsToCodeSections();