const LayoutBlockShortcodes = require("./layout-block-shortcodes");
const CardShortcodes = require("./card-shortcodes");
const NunjucksExt = require("./nunjucks-exts");

module.exports = function(eleventyConfig) {
  LayoutBlockShortcodes(eleventyConfig);
  CardShortcodes(eleventyConfig);
  NunjucksExt(eleventyConfig);
}