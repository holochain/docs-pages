import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownItContainer from "markdown-it-container";
import markdownItAnchor from "markdown-it-anchor";
import slugify from '@sindresorhus/slugify';

// This config is shared by Eleventy and by the TOC generator in /src/pages/_data/eleventyComputed.js
// which is why it has no Eleventy stuff in it like the other files in this
// folder.

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
    const attrDefaults = { id: slugify(summary[1]) };
    if (blockName) {
      attrDefaults['class'] = `details ${blockName}`;
    }
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

/* Start responsive container code */

const renderResponsiveContainer = (tokens, idx) => {
  if (tokens[idx].nesting === 1) {
    // Ratio can be specified as a fraction (e.g., "16/9") or a percentage ("56.25%").
    const ratioMatch = tokens[idx].info.trim().match(/^responsive\s+(?:(\d+)\s*\/\s*(\d+)|(\d+)\s*%)\s*$/);
    let ratio;

    if (typeof ratioMatch[3] !== "undefined") {
      ratio = ratioMatch[3];
    } else {
      ratio = Number(ratioMatch[2]) / Number(ratioMatch[1]) * 100;
    }

    if (!ratioMatch) {
      return "";
    }

    return `<div class="responsive-container" style="padding-bottom: ${ratio}%">`;
  } else {
    return "</div><!-- what the -->";
  }
};

/* End responsive container code */

// Set up the Markdown-it parser here.

const mdLib = markdownIt();

// Set up sane defaults; most of these are borrowed from 11ty's defaults.
mdLib.set({
  html: true,
  linkify: true,
  typographer: true
});
mdLib.disable("code");

//Configure markdown-it plugins
mdLib.use(markdownItAttrs);
mdLib.use(markdownItAnchor, {
  tabIndex: false,
  slugify: s => slugify(s),
  permalink: markdownItAnchor.permalink.headerLink(),
});
mdLib.use(markdownItContainer, "intro");
mdLib.use(markdownItContainer, "orientation");
mdLib.use(markdownItContainer, "storystep");
mdLib.use(markdownItContainer, "h-author");
mdLib.use(markdownItContainer, "topic-list");
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
// Responsive container
mdLib.use(markdownItContainer, "responsive", { marker: "%", render: renderResponsiveContainer });

export default mdLib;