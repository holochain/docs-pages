const postHtml = require("posthtml")();
const htmlMin = require("html-minifier");
const { noopener } = require("posthtml-noopener");
const dom = require("fauxdom");
const hljs = require("highlight.js");

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

  let exampleWasLogged = false;
  eleventyConfig.addTransform("highlight", async function(content) {
    if (this.page.outputPath.endsWith(".html")) {
      console.log(`Adding syntax highlighting to ${this.page.inputPath}`);
      try {
        const document = new dom(content);
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach((code) => {
          code.outerHTML = hljs.highlightElement(code.outerHTML).value;
        });
        const output = document.toString();
        if (!exampleWasLogged) {
          exampleWasLogged = true;
          console.log(output);
        }
        return output;
      } catch (e) {
        console.error(e);
        return content;
      }

    }
    return content;
  });
}