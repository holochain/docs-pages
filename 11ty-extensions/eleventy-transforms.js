const postHtml = require("posthtml")();
const { noopener } = require("posthtml-noopener");

module.exports = function(eleventyConfig) {

  eleventyConfig.addTransform("addRelNoopener", async function(content, outputPath) {
    const noopenerInst = noopener();

    if (outputPath.endsWith(".html")) {
      const result = await postHtml.use(noopenerInst).process(content);
      return result.html;
    }

    return content;
  });
}