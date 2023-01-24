const footerLinks = require("./navigation/footerLinks.json5");
const mainNav = require("./navigation/mainNav.json5");

// console.log(mainNav);
function cleanUpNav(mainNav) {
  return {
    ...mainNav,
    links: mainNav.links.map((l) => ({
      ...l,
      hasChildren: (l.children && l.children.length > 0)
    }))
  }
}



module.exports = {
  footerNav: {
    columns: footerLinks.columns
  },
  mainNav: cleanUpNav(mainNav)
}