// The posthtml package just exports a function that receives a list of plugins
// and returns a PostHTML engine instance. We're adding plugins later, so we
// just call the function.
import postHtmlSetup from "posthtml";
const postHtml = postHtmlSetup();
import htmlMin from "html-minifier";
import { noopener } from "posthtml-noopener";
import dom from "fauxdom";
import he from "he";
import hljsOrig from "highlight.js";
// Add Svelte language formatting support to highlight.js
import hljsSvelte from "highlightjs-svelte";
hljsSvelte(hljsOrig);
// Allow diff *and* original highlighting language
import hljsCodeDiff from "highlightjs-code-diff";
const hljs = hljsCodeDiff(hljsOrig);

export default function(eleventyConfig) {

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
      const document = new dom(content);
      const preBlocks = document.querySelectorAll('pre:has(code)');
      preBlocks.forEach((pre) => {
        pre.className += ' hljs-container';
        const code = pre.querySelector('code');
        const maybeLanguage = code.className.match(/(?<=\blanguage-)[A-Za-z0-9_-]+/);
        let blockText = he.decode(code.textContent);
        // Erase cspell directives from sample code.
        blockText = blockText.replace(/(#|\/\/|\/\*)\s+(cspell|spell-?checker):\s*[a-z-]+(\s+\*\/)?/gmi, "");
        if (maybeLanguage) {
          code.innerHTML = hljs.highlight(blockText, {language: maybeLanguage[0]}).value;
        } else {
          code.innerHTML = hljs.highlightAuto(blockText).value;
        }
        code.className += ' hljs';
      });
      return document.innerHTML;
    }
    return content;
  });
};