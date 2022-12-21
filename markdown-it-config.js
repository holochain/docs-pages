const markdownItAttrs = require("markdown-it-attrs");
const markdownItContainer = require("markdown-it-container");

const admonitionRegex = {
  "tip": /^tip\s+(.*)$/,
  "note": /^note\s+(.*)$/
};

const renderAdmonition = (name, tokens, idx) => {
  var titleMatcher = tokens[idx].info.trim().match(admonitionRegex[name]);
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const title = titleMatcher ? titleMatcher[1] : (nameCapitalized);

  if(tokens[idx].nesting === 1) {
    const titleTag = title ? `<p class='admonition-title'>${ title }</p>` : '';
    return `<div class="admonition ${name}">${titleTag}` + '\n\n';
  } else {
    return '\n</div>\n';
  }
};

const renderTip = (tokens, idx) => {
  const result = renderAdmonition("tip", tokens, idx);
  console.log(result);
  return result;
};

const renderNote = (tokens, idx) => {
  return renderAdmonition("note", tokens, idx);
};

/**
 * Configures Markdown-it lib plugins etc. Meant to be called from .eleventy.js 
 * @param {*} eleventyConfig 
 */
module.exports = function(eleventyConfig) {
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItAttrs);
    mdLib.use(markdownItContainer, "coreconcepts-intro");
    mdLib.use(markdownItContainer, "coreconcepts-orientation");
    mdLib.use(markdownItContainer, "coreconcepts-storysequence");
    
    mdLib.use(markdownItContainer, "tip", { marker: "!", render: renderTip });
    mdLib.use(markdownItContainer, "note", { marker: "!", render: renderNote });
  });
 
}