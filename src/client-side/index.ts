function copyCodeBlockClickHandler(e: Event) {
  const button = e.target as HTMLButtonElement;
  const codeEl = button.parentElement?.querySelector("code");
  navigator.clipboard.writeText(codeEl?.innerText || "")
}

function addCopyButtonsToCodeSections() {
  const copyButtonTemplate = document.querySelector<HTMLTemplateElement>("#copy-button-template");

  const codeElms = document.querySelectorAll('pre > code');
  codeElms.forEach((codeEl: Element) => {
    // If there is a output-block class as an ancestor anywhere then don't add button
    if (codeEl.closest('.output-block')) {
      return;
    }

    const copyButtonFrag = copyButtonTemplate?.content.cloneNode(true);

    if (copyButtonFrag) {
      const preEl = codeEl.parentElement!;
      // insert the copyButtonFrag right before the code fence
      preEl.parentElement?.insertBefore(copyButtonFrag, preEl);
      const codeFenceWrapper = preEl.previousElementSibling!;
      // move the preEl into the new Node
      codeFenceWrapper.appendChild(preEl);
      const btnEl = codeFenceWrapper.querySelector<HTMLButtonElement>("button[data-purpose]")!;
      btnEl.addEventListener("click", copyCodeBlockClickHandler);
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

const inPageToc = document.querySelector("#in-page-toc");
if (inPageToc) {
  const tocLinks = inPageToc.querySelectorAll("li > a");

  const setCurrentSection = (sectionId: string) => {
    console.log("Setting current section to", sectionId);
    tocLinks.forEach((link) => {
      link.classList.toggle("current", link.getAttribute("href") === `#${sectionId}`);
    });
  }

  //set up intersection observer to highlight the current section
  const observerCallback = (entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      setCurrentSection(entries[0].target.id);
    }
  };

  const observer = new IntersectionObserver(observerCallback, { rootMargin: "0px 0px 0px 0px" });

  tocLinks.forEach((link) => {
    const linkId = link.getAttribute("href")?.replace("#", "");
    const htag = document.querySelector(`[id="${linkId}"]`);
    console.log(htag, link);
    if (htag) {
      observer.observe(htag);
    } else {
      console.warn("No htag found for link", link);
    }
  });
}

const openDetailsOnFragmentIdNavigation = () => {
  if (location.hash) {
    const targetedDetailsElement = document.querySelector("details" + location.hash);
    if (targetedDetailsElement) {
      targetedDetailsElement.setAttribute("open", "open");
    }
  }
};

// Open details elements when they have an ID that's navigated to.
openDetailsOnFragmentIdNavigation();
window.addEventListener("hashchange", openDetailsOnFragmentIdNavigation);