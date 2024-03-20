import escapeHtml from "escape-html";
import markdownItAttrs from "markdown-it-attrs";
import markdownItContainer from "markdown-it-container";
import markdownItAnchor from "markdown-it-anchor";
import puppeteer from "puppeteer";
import { renderMermaid } from "@mermaid-js/mermaid-cli";
import slugify from '@sindresorhus/slugify';

/**
 * Composes the attributes string for an html tag from the markdown-it-container token and default attributes
 * @param {*} token token from markdown-it-container
 * @param {*} defaultAttrs attributes to be merged in with token.attrs
 * @returns attributes string for the html tag
 */
function composeAttributeString(token, defaultAttrs ={}) {
  //convert token.attrs to an object and merge with defaultAttrs
  const attrs = token.attrs ? token.attrs.reduce((acc, attr) => { acc[attr[0]] = attr[1]; return acc; }, {}) : {};
  const mergedAttrs = Object.assign({}, defaultAttrs, attrs);

  return Object.keys(mergedAttrs).reduce((acc, key) => acc + ` ${key}="${mergedAttrs[key]}"`, "");
}

/* Start Admonition code */

function generateContainerTitleRegex(blockName) {
  return new RegExp("^" + blockName + "\\s+(.*)$");
}

const renderAdmonition = (name, tokens, idx) => {
  const titleMatcher = tokens[idx].info.trim().match(generateContainerTitleRegex(name));
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const title = titleMatcher ? titleMatcher[1] : (nameCapitalized);

  //If the opening tag
  if(tokens[idx].nesting === 1) {
    const titleTag = title ? `<p class='admonition-title'>${ title }</p>` : '';
    const attrString = composeAttributeString(tokens[idx], { class: `admonition ${name}` });

    return `<div ${attrString}>${titleTag}` + '\n\n<div class="admonition-content">';
  } else {
    return '\n</div></div>\n';
  }
};

/**
 * Wires up a generic markdownItContainer render function for a specified admonition.
 * @param {string} admonitionName The "tag" of the admonition to be rendered
 * @returns render function for the admonition type that works with markdownItContainer
 */
function composeGenericAdmonitionRenderFunc(admonitionName) {
  return function(tokens, idx) { return renderAdmonition(admonitionName, tokens, idx); }
}

/* End Admonition code */

/* Start Details Block code */

function composeDetailsBlockRenderFunc(blockName  = "details") {
  return function(tokens, idx) { return renderDetailsBlock(blockName, tokens, idx); }
}

const renderDetailsBlock = (blockName, tokens, idx) => {
  if(tokens[idx].nesting === 1) {
    const summary = tokens[idx].info.trim().match(generateContainerTitleRegex(blockName));
    const attrDefaults = blockName ? { class: `details ${blockName}` } : {};
    const attrString = composeAttributeString(tokens[idx], attrDefaults);

    const summaryTag = summary ? `<summary>${ summary[1] }</summary>` : '';
    return `<details ${attrString}>${summaryTag}` + '\n\n<div class="details-content">';
  } else {
    return '\n</div></details>\n';
  }
};

const validateDetailsBlock = (params) => {
  const validationResults = params.trim().match(/^details\s+(.*)$/);
  return validationResults;
}

/* End Details Block code */

/**
 * Configures Markdown-it lib plugins etc. Meant to be called from .eleventy.js
 * @param {*} eleventyConfig
 */
export default async function(eleventyConfig) {
  // Get one instance of puppeteer for all files, so startup isn't so expensive.
  const browser = await puppeteer.launch({ headless: 1 });
  console.info("got browser");

  // Now wrap the default Markdown template engine with our custom parser that
  // handles Mermaid first. The only thing we need to override is the `compile`
  // function.

  const preprocessMermaid = async function (markdown) {
    console.log("USING preprocessMermaid!!!");
    // I've adapted this from mermaid-cli's `run` function, which is capable of
    // handling Markdown files while its `renderMermaid` function isn't.
    const mermaidChartsInMarkdownRegexGlobal = /^[^\S\n]*[`:]{3}(?:mermaid)([^\S\n]*\r?\n([\s\S]*?))[`:]{3}[^\S\n]*$/gm;
    const imagePromises = [];
    for (const mermaidCodeblockMatch of markdown.matchAll(mermaidChartsInMarkdownRegexGlobal)) {
      const mermaidDefinition = mermaidCodeblockMatch[2];

      const imagePromise = (async () => {
        return await renderMermaid(browser, mermaidDefinition, "svg", parseMMDOptions);
      })();

      imagePromises.push(imagePromise);
    }

    if (imagePromises.length) {
      console.info(`Found ${imagePromises.length} mermaid charts in Markdown input`);
    } else {
      console.info('No mermaid charts found in Markdown input');
    }

    const images = Promise.all(imagePromises);

    const processedMarkdown = markdown.replace(mermaidChartsInMarkdownRegexGlobal, (_) => {
      // Pop first image from front of array.
      // We repeat the same regex search as we used to find the Mermaid block,
      // so we will never try to get too many objects from the array.
      // (aka `images.shift()` will never return `undefined`.)
      const { _title, desc, data } = images.shift();
      if (desc) {
        return `<figure>
  ${data}
  <figcaption>${escapeHtml(desc)}</figcaption>
</figure>
`;
      } else {
        return data;
      }
    });

    return processedMarkdown;
  };

  let MermaidPreprocessingMarkdown = {
    // I've basically pulled this from the 11ty codebase.
    compile: async function(str, inputPath, preTemplateEngine, bypassMarkdown) {
      console.log("❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️trying to compile--------------------");
      let mdlib = this.mdLib;

      if (preTemplateEngine) {
        let engine;
        if (typeof preTemplateEngine === "string") {
          engine = await this.engineManager.getEngine(
            preTemplateEngine,
            this.dirs,
            this.extensionMap,
          );
        } else {
          engine = preTemplateEngine;
        }

        let fnReady = engine.compile(str, inputPath);

        if (bypassMarkdown) {
          return async function (data) {
            let fn = await fnReady;
            return fn(data);
          };
        } else {
          return async function (data) {
            let fn = await fnReady;
            let preTemplateEngineRender = await fn(data);
            // This is the only thing I added.
            let mermaidPreprocessed = await preprocessMermaid(fn(preTemplateEngineRender));
            let finishedRender = mdlib.render(mermaidPreprocessed, data);
            return finishedRender;
          };
        }
      } else {
        if (bypassMarkdown) {
          return function () {
            return str;
          };
        } else {
          return function (data) {
            return mdlib.render(str, data);
          };
        }
      }
    }
  };

  // Use the parser we just created.
  eleventyConfig.addExtension("md", MermaidPreprocessingMarkdown);

  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.set({ typographer: true });
    //Configure markdown-it plugins
    mdLib.use(markdownItAttrs);
    mdLib.use(markdownItAnchor, { tabIndex: false, slugify: s => slugify(s) });
    mdLib.use(markdownItContainer, "coreconcepts-intro");
    mdLib.use(markdownItContainer, "coreconcepts-orientation");
    mdLib.use(markdownItContainer, "coreconcepts-storysequence");
    mdLib.use(markdownItContainer, "h-author");
    mdLib.use(markdownItContainer, "output-block");

    // Admonitions
    mdLib.use(markdownItContainer, "tip", { marker: "!", render: composeGenericAdmonitionRenderFunc("tip") });
    mdLib.use(markdownItContainer, "note", { marker: "!", render: composeGenericAdmonitionRenderFunc("note") });
    mdLib.use(markdownItContainer, "info", { marker: "!", render: composeGenericAdmonitionRenderFunc("info") });
    mdLib.use(markdownItContainer, "learn", { marker: "!", render: composeGenericAdmonitionRenderFunc("learn") });

    // Details block
    mdLib.use(markdownItContainer, "details", { marker: "!", render: composeDetailsBlockRenderFunc() });
    // Create a specialized synonym for details block with a class of "dig-deeper"
    mdLib.use(markdownItContainer, "dig-deeper", { marker: "!", render: composeDetailsBlockRenderFunc("dig-deeper") });
  });
};