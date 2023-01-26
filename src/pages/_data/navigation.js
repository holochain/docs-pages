const footerLinks = require("./navigation/footerLinks.json5");
const mainNav = require("./navigation/mainNav.json5");
const headerNav = require("./navigation/headerNav.json5");

function findTopLinkRecordFor(url) {
  return mainNav.links.find((l) => {
    if (l.url === url) { return true; }

    return l?.children?.some((cl) => cl.url === url);
  });
}

const mainNavObj = {
  ...mainNav,
  links: mainNav.links.map((l) => ({
    ...l,
    hasChildren: (l.children && l.children.length > 0)
  })),
  getActiveParentLink(pageUrlRendering) {
    return findTopLinkRecordFor(pageUrlRendering);
  }
};

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
  mainNav: mainNavObj,
  headerNav: headerNavObj
}