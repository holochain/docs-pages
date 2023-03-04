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
      // Handle the open/close state
      const openedChildLevels = document.querySelectorAll("ul.nav-child-level.open");
      const clickedChildLevel = btn.parentElement?.querySelector("ul.nav-child-level");
      const currentStateOpen = clickedChildLevel?.classList.contains("open");

      openedChildLevels.forEach((ul) => ul.classList.remove("open"));
      clickedChildLevel?.classList.toggle("open", !currentStateOpen);

      // Handle the arrow direction
      const openedButtons = document.querySelectorAll("#main-nav ul.nav-top-level > li > button.up-arrow");
      openedButtons.forEach((btn) => btn.classList.remove("up-arrow"));
      btn.classList.toggle("up-arrow", !currentStateOpen);
    });
  });
}

setupNavHandlers();

function openModalIFrame(url:string) {
  const template = document.querySelector<HTMLTemplateElement>('#modal-iframe-template');

  const frag =  template?.content.cloneNode(true) as DocumentFragment;
  console.log(frag)
  if (frag) {
    const div = frag.querySelector(".modal-iframe");
    const iframe = frag.querySelector<HTMLIFrameElement>(".modal-iframe iframe");
    const closeBtn = frag.querySelector<HTMLButtonElement>(".modal-iframe .modal-iframe-close");
    if (div && iframe && closeBtn) {
      iframe.src = url;
      closeBtn.addEventListener("click", (e) => {
        document.querySelector(".modal-iframe")?.remove();
      });
      document.body.appendChild(frag);
    }
  }
}

document.querySelector<HTMLButtonElement>(".take-the-survey")?.addEventListener("click", (e) => {
  e.preventDefault(); 
  openModalIFrame("https://form.typeform.com/to/AL0HFFy8"); 
});
// openModalIFrame("https://form.typeform.com/to/AL0HFFy8");
//openModalIFrame("https://en.wikipedia.org/wiki/Address_bar");

declare var PagefindUI: any;

function setupPagefindUI() {
  new PagefindUI({ 
    element: "#search", 
    showImages: false,
    processTerm(term: string) {
      //store the search term 
      updateSearchQueryString(term);

      return term;
    }
  });
  
  setTimeout(() => {
    const searchInput = window.document.querySelector<HTMLInputElement>("#search .pagefind-ui__search-input");
    // Clear the query string if it is empty
    searchInput?.addEventListener("input", () => {
      if (searchInput?.value === "") {
        updateSearchQueryString("");
      }
    })
    
    searchInput?.focus();
  }, 400);

  function updateSearchQueryString(term: string) {
    const url = new URL(window.location.toString());
    if (term.trim() == "") {
      url.searchParams.delete("pagefind-search");
    } else {
      url.searchParams.set("pagefind-search", term);
    }
    history.pushState({}, "", url);
  }
}