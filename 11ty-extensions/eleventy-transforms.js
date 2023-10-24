const postHtml = require("posthtml")();
const htmlMin = require("html-minifier");
const { noopener } = require("posthtml-noopener");
const highlightjs = require("highlightjs");

module.exports = function(eleventyConfig) {

  eleventyConfig.addTransform("addRelNoopener", async function(content) {
    const noopenerInst = noopener();

    if (this.page.outputPath.endsWith(".html")) {
      const result = await postHtml.use(noopenerInst).process(content);
      return result.html;
    }

    return content;
  });

  eleventyConfig.addTransform("htmlmin", async function(content) {
    if (this.page.outputPath.endsWith(".html")) {
      return htmlMin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true
      });
    }

    return content;
  });

  eleventyConfig.addTransform("highlight", async function(content) {
    if (this.page.outputPath.endsWith(".html")) {
      return highlightjs.highlightAuto(content).value;
    }
    return content;
  });
}