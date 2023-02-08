
module.exports = function(eleventyConfig) {

  eleventyConfig.addNunjucksGlobal("callMacroByName", function(name) {
    if (!name) {
      return;
    }

    const otherArgs = [...arguments].slice(1);
    const member = this.ctx[name];
    if (typeof member === "function") {
      return member(...otherArgs);
    }
  });

  eleventyConfig.addNunjucksGlobal("ConsoleLog", function() {
    console.log(...arguments);
  });

}