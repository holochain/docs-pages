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

export default {
  footerNav: {
    ...footerLinks
  },
  mainNav: mainNavObj,
  headerNav: headerNavObj
};