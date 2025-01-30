import JSON5 from "json5";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function loadJson5(filename) {
  const content = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), filename), 'utf8');
  try {
      return JSON5.parse(content);
  } catch (err) {
      err.message = filename + ': ' + err.message;
      throw err;
  }
}

const footerLinks = loadJson5("./navigation/footerLinks.json5");
const mainNav = loadJson5("./navigation/mainNav.json5");
const headerNav = loadJson5("./navigation/headerNav.json5");

function findTopLinkRecordFor(nav, url) {
  function urlInNodeOrChildren(item) {
    if (item.url === url) { return true; }
    return item.hasChildren && item.children.some(urlInNodeOrChildren);
  };

  return nav.children.find(urlInNodeOrChildren);
}

// Iteratively add the `hasChildren` property and `getActiveParentLink` method
// to a nav node.
function mapNavChildren(item) {
  return {
    ...item,
    children: item.children && item.children.length > 0 && item.children.map(mapNavChildren),
    hasChildren: item.children && item.children.length > 0,
    getActiveParentLink(pageUrlRendering) {
      return findTopLinkRecordFor(this, pageUrlRendering);
    },
  };
}

const mainNavObj = mapNavChildren(mainNav);

const headerNavObj = mapNavChildren(headerNav);

export default {
  footerNav: {
    ...footerLinks
  },
  mainNav: mainNavObj,
  headerNav: headerNavObj
};