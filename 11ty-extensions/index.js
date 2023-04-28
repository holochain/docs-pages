const ConfigMarkdownIt = require("./markdown-it-config");
const LayoutBlockShortcodes = require("./layout-block-shortcodes");
const CardShortcodes = require("./card-shortcodes");
const NunjucksExt = require("./nunjucks-exts");
const Transforms = require("./eleventy-transforms");

module.exports = function(eleventyConfig) {
  ConfigMarkdownIt(eleventyConfig);
  LayoutBlockShortcodes(eleventyConfig);
  CardShortcodes(eleventyConfig);
  NunjucksExt(eleventyConfig);
  Transforms(eleventyConfig);
}