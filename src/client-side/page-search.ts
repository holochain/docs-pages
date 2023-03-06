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

setupPagefindUI();