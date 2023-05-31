const markdownItAttrs = require("markdown-it-attrs");
const markdownItContainer = require("markdown-it-container");
const markdownItAnchor = require("markdown-it-anchor");
const slugify = require('@sindresorhus/slugify');

/* Start Admonition code */

function generateAdmonitionTitleRegex(admonitionName) {
  return new RegExp("^" + admonitionName + "\\s+(.*)$");
}

const renderAdmonition = (name, tokens, idx) => {
  const titleMatcher = tokens[idx].info.trim().match(generateAdmonitionTitleRegex(name));
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const title = titleMatcher ? titleMatcher[1] : (nameCapitalized);

  //If the opening tag
  if(tokens[idx].nesting === 1) {
    const titleTag = title ? `<p class='admonition-title'>${ title }</p>` : '';
    return `<div class="admonition ${name}">${titleTag}` + '\n\n<div class="admonition-content">';
  } else {
    return '\n</div></div>\n';
  }
};

const renderDetailsBlock = (tokens, idx) => {
  const titleMatcher = tokens[idx].info.trim().match(generateAdmonitionTitleRegex("details"));
  const submittedTitle = titleMatcher ? titleMatcher[1] : "";
  const blockId = slugify(submittedTitle);
  const title = submittedTitle ?? "Details";

  //If the opening tag
  if(tokens[idx].nesting === 1) {
    const idAttr = blockId ? ` id="${blockId}"` : '';
    return `<details><summary ${idAttr}>${ title }</summary>` + '\n\n';
  } else {
    return '\n</details>\n';
  }
};

function composeDetailsRenderFunc() {
  return function(tokens, idx) { return renderDetailsBlock(tokens, idx); }
}

/**
 * Wires up a generic markdownItContainer render function for a specified admonition.
 * @param {string} admonitionName The "tag" of the admonition to be rendered
 * @returns render function for the admonition type that works with markdownItContainer
 */
function composeGenericAdmonitionRenderFunc(admonitionName) {
  return function(tokens, idx) { return renderAdmonition(admonitionName, tokens, idx); }
}

/* End Admonition code */


/**
 * Configures Markdown-it lib plugins etc. Meant to be called from .eleventy.js 
 * @param {*} eleventyConfig 
 */
module.exports = function(eleventyConfig) {
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
    
    mdLib.use(markdownItContainer, "details", { marker: "!", render: composeDetailsRenderFunc() });
  });
 
}