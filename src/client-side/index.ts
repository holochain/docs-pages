function copyCodeBlockClickHandler(e: Event) {
  const button = e.target as HTMLButtonElement;
  const codeEl = button.parentElement?.querySelector("code");
  navigator.clipboard.writeText(codeEl?.innerText || "")
}

function addCopyButtonsToCodeSections() {
  const codeElms = document.querySelectorAll('pre > code:not(.no-copy-button)');
  
  codeElms.forEach((codeEl: Element) => {
    const preEl = codeEl.parentElement!;
    const copyButtonFrag = document.querySelector<HTMLTemplateElement>("#copy-button-template")?.content.cloneNode(true);

    if (copyButtonFrag) {
      preEl.appendChild(copyButtonFrag);
      const btnEl = preEl.querySelector<HTMLButtonElement>("button[data-purpose]");
      console.log(btnEl);
      btnEl?.addEventListener("click", copyCodeBlockClickHandler);
    }
  });
}

addCopyButtonsToCodeSections();

function setUpMenuToggle() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.hamburger-activate');

  const openedClassName = "opened";
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isOpen = btn.classList.contains(openedClassName);
      btn.classList.toggle(openedClassName, !isOpen);
      btn.setAttribute("aria-expanded", isOpen.toString());
    })
  }) 
}

setUpMenuToggle();