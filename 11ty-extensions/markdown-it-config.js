const markdownItAttrs = require("markdown-it-attrs");
const markdownItContainer = require("markdown-it-container");
const markdownItAnchor = require("markdown-it-anchor");
const slugify = require('@sindresorhus/slugify');
import { renderMermaid } from '@mermaid-js/mermaid-cli';
const puppeteer = require('puppeteer');

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

/* Start Mermaid parser code */

// This plugin takes a first stab at code blocks, intercepting anything that
// might be MermaidJS and feeding it through the mermaid parser and replacing
// the block with the rendered SVG diagram.

const mermaidCodeBlock = function(md) {
  const defaultFenceRenderer = md.renderer.rules.fence;
  // One single puppeteer instance for the whole site -- otherwise it would get
  // costly to launch it for every markdown page.
  puppeteer.launch({headless: 1}).then(browser => {
    md.renderer.rules.fence = function(tokens, idx, options, env, self) {
      const token = tokens[idx];
      const info = token.info ? String(token.info).trim() : '';
      // This is all the stuff after the starting code fence, including the
      // language.
      const maybeLang = info.match(/^[a-z-]+/g);
      // Extract the language.
      if (maybeLang && maybeLang[0] == 'mermaid') {
        return renderMermaid(browser, token.content, 'svg')
          .then(
            ({svg}) => svg,
            (error) => '<div>Couldn\'t render mermaid</div>'
          );
      } else {
        defaultFenceRenderer(tokens, idx, options, env, self);
      }
    };
  });
};

/* End Mermaid parser code */

/**
 * Configures Markdown-it lib plugins etc. Meant to be called from .eleventy.js
 * @param {*} eleventyConfig
 */
module.exports = function(eleventyConfig) {
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.set({ typographer: true });

    //Configure markdown-it plugins
    mdLib.use(markdownItAttrs);
    mdLib.use(mermaidCodeBlock);
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

}