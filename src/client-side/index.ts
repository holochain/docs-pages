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

/**
 * Sets up the hamburger menu to show/hide the navigation
 */
function setUpMenuToggle() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.hamburger-activate');

  const openedClassName = "opened";
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Handle button change
      const isOpen = btn.classList.contains(openedClassName);
      btn.classList.toggle(openedClassName, !isOpen);
      btn.setAttribute("aria-expanded", isOpen.toString());

      // Handle the desired effect
      const sideBarEl = document.querySelector<HTMLElement>(".default-page-type .side-bar");
      sideBarEl?.classList.toggle("show", !isOpen);
      
    })
  }) 
}

setUpMenuToggle();

/**
 * Sets up the Navigation open child buttons
 */
function setupNavHandlers() {
  document.querySelectorAll<HTMLButtonElement>("button[data-children-opener]").forEach((btn) => {
    btn.addEventListener("click", (e: Event) => {
      const openedChildLevels = document.querySelectorAll("ul.nav-child-level.open");
      const clickedChildLevel = btn.parentElement?.querySelector("ul.nav-child-level");
      const currentState = clickedChildLevel?.classList.contains("open");
      openedChildLevels.forEach((ul) => ul.classList.remove("open"));
      clickedChildLevel?.classList.toggle("open", !currentState);
    });
  });
}

setupNavHandlers();