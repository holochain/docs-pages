const debounce = (callback: (...params: any[]) => any, waitTime: number) => {
  let timeoutId: number | null = null;
  
  return (...args: any[]) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, waitTime);
  };
}

/** Query string parameter name holding the current search */
const PagefindSearchKey = "pagefind-search";

function setupPagefindUI() {
  const pagefindUIInstance = new PagefindUI({ 
    element: "#search", 
    showImages: false
  });
  
  const searchInput = window.document.querySelector<HTMLInputElement>("#search .pagefind-ui__search-input")!;
  const pagefindSearchQString = (new URL(window.location.toString())).searchParams.get(PagefindSearchKey);
  
  if (pagefindSearchQString) {
    pagefindUIInstance.triggerSearch(pagefindSearchQString);
  }

  const debouncedInputHandler = debounce(() => updateSearchQueryString(searchInput?.value), 1000);

  // Clear the query string if it is empty
  searchInput?.addEventListener("input", (e: Event) => {
    if (searchInput.value === "") {
      updateSearchQueryString("");
    } else {
      debouncedInputHandler();
    }
  });
  
  // if the Enter key is clicked then append the search to the QueryString
  searchInput?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      updateSearchQueryString(searchInput.value);
    }
  });
  
  // Clear the query string if clear button clicked
  window.document.querySelector<HTMLButtonElement>("#search .pagefind-ui__search-clear")?.addEventListener("click", () => {
    updateSearchQueryString("");
  });
  
  searchInput?.focus();

  function updateSearchQueryString(term: string) {
    const url = new URL(window.location.toString());
    if (term.trim() == "") {
      url.searchParams.delete(PagefindSearchKey);
    } else if (url.searchParams.get(PagefindSearchKey) !== term) {
      url.searchParams.set(PagefindSearchKey, term);
    }
    history.pushState({}, "", url);
  }
}

setupPagefindUI();