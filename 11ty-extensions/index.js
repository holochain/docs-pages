const LayoutBlockShortcodes = require("./layout-block-shortcodes");
const CardShortcodes = require("./card-shortcodes");

module.exports = function(eleventyConfig) {
  LayoutBlockShortcodes(eleventyConfig);
  CardShortcodes(eleventyConfig);
}