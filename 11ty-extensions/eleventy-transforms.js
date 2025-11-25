// The posthtml package just exports a function that receives a list of plugins
// and returns a PostHTML engine instance. We're adding plugins later, so we
// just call the function.
import postHtmlSetup from "posthtml";
const postHtml = postHtmlSetup();
import htmlMin from "html-minifier-terser";
import { noopener } from "posthtml-noopener";
import dom from "fauxdom";
import he from "he";
import hljsOrig from "highlight.js";
// Add Svelte language formatting support to highlight.js
import svelte from "highlight.svelte/dist/index.mjs";
hljsOrig.registerLanguage('svelte', svelte);
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
        const maybeLanguage = code.className.match(/(?<=\blanguage-)[\:A-Za-z0-9_-]+/);
        let blockText = he.decode(code.textContent);
        // Erase cspell directives from sample code.
        blockText = blockText.replace(/(#|\/\/|\/\*)\s+(cspell|spell-?checker):\s*[a-z-]+(\s+\*\/)?/gmi, "");

        if (maybeLanguage) {
          if (maybeLanguage[0].match(/^diff\b/)) {
            // This is a diff, and we want to show it differently --
            // add tabs that let you switch between diff and final version.

            // First, make a copy of the code block.
            const preForAppliedDiff = pre.cloneNode(true);
            const codeForAppliedDiff = preForAppliedDiff.querySelector('code');

            // Apply the diff.
            const diffAppliedCode = blockText
              .split(/\r?\n/)
              .reduce(
                (acc, line) => {
                  if ([" ", "+"].includes(line.substring(0, 1))) {
                    return `${acc}${line.substring(1)}\n`;
                  }
                  return acc;
                },
                ""
              );

            // Then find its target language, if any.
            const maybeLanguageForAppliedDiff = codeForAppliedDiff.className.match(/(?<=\blanguage-diff:)[A-Za-z0-9_-]+/)?.[0];
            if (maybeLanguageForAppliedDiff) {
              // Change the language class name of the new code block so it's
              // not a diff anymore.
              codeForAppliedDiff.className = codeForAppliedDiff.className.replace("language-diff:", "language-");

              // Replace the raw code with the highlighted, diff-applied code.
              codeForAppliedDiff.innerHTML = hljs.highlight(diffAppliedCode, { language: maybeLanguageForAppliedDiff }).value;
              // And highlight the original diff using diff+language highlighting.
              code.innerHTML = hljs.highlight(blockText, {language: maybeLanguage[0]}).value;
            } else {
              // If it's an unlanguaged diff, just cram the code
              // into the diff-applied block verbatim without highlighting.
              codeForAppliedDiff.textContent = diffAppliedCode;
              // Remove the now non-useful language class.
              codeForAppliedDiff.className = codeForAppliedDiff.className.replace("language-diff", "");
              // Highlight the original code as a diff.
              code.innerHTML = hljs.highlight(blockText, { language: 'diff' }).value;
            }

            code.className += ' hljs';
            codeForAppliedDiff.className += ' hljs';

            // Now that we've got both of them, put them in a container that
            // lets us tab between the two of them.
            pre.classList.add("diff-diff");
            preForAppliedDiff.classList.add("diff-final");
            const tabContainer = document.createElement('div');
            tabContainer.className = "diff-container";
            tabContainer.innerHTML = `
              <div class="diff-tab-strip">
                <button class="diff-show-diff" title="Show code with highlighted deletions and addition">Diff</button><button class="diff-show-final" title="Show ready-to-copy code with changes applied">Final</button>
              </div>
              <div class="diff-tab diff-tab-diff">${pre.outerHTML}</div>
              <div class="diff-tab diff-tab-final">${preForAppliedDiff.outerHTML}</div>
            `;

            // Now replace the original code block with the diff+applied version.
            pre.replaceWith(tabContainer);
          } else {
            code.innerHTML = hljs.highlight(blockText, {language: maybeLanguage[0]}).value;
          }
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