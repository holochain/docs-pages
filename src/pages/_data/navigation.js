const footerLinks = require("./navigation/footerLinks.json5");
const mainNav = require("./navigation/mainNav.json5");
const headerNav = require("./navigation/headerNav.json5");

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

function findTopLinkRecordFor(url) {
  return mainNav.links.find((l) => {
    const isPage = l.url === url;
    const isChildPage = l?.children?.some((cl) => cl.url === url);
    return isPage || isChildPage;
  });
}

const headerNavObj = { 
  ...headerNav,
  getActiveParentLink(pageUrlRendering) {
    return findTopLinkRecordFor(pageUrlRendering);
  }
 };

module.exports = {
  footerNav: {
    columns: footerLinks.columns
  },
  mainNav: cleanUpNav(mainNav),
  headerNav: headerNavObj
}