const LayoutBlockShortcodes = require("./layout-block-shortcodes");
const CardShortcodes = require("./card-shortcodes");

module.exports = function(eleventyConfig) {
  LayoutBlockShortcodes(eleventyConfig);
  CardShortcodes(eleventyConfig);

  eleventyConfig.addNunjucksGlobal("callMacroByName", function(name) {
    if (!name) {
      return;
    }

    const otherArgs = [...arguments].slice(1);
    const member = this.ctx[name];
    if (typeof member === "function") {
      return member(...otherArgs);
    }
  })
}