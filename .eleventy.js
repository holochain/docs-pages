const { EleventyRenderPlugin } = require("@11ty/eleventy");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const configMarkdownIt = require("./markdown-it-config");
const registerExtensions = require("./11ty-extensions");

module.exports = function(eleventyConfig) {
  
  eleventyConfig.addPassthroughCopy({"./src/assets/": "assets"});
  eleventyConfig.addPassthroughCopy({"./node_modules/font-awesome/css": "assets/font-awesome/css"});
  eleventyConfig.addPassthroughCopy({"./node_modules/font-awesome/fonts": "assets/font-awesome/fonts"});

  eleventyConfig.addPassthroughCopy({"./client-side-compiled/**/*": "scripts"});
  eleventyConfig.addPassthroughCopy({"./styles-compiled/**/*": "styles"});
  eleventyConfig.addPassthroughCopy({"./src/copy-to-root/*": "."});

  /* If you have any libs being pulled from node_modules you might do it like below */
  eleventyConfig.addPassthroughCopy({"./node_modules/lunr/lunr.min.js": "scripts/libs/lunr.min.js"});

  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.setDataDeepMerge(false);

  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.setServerOptions({
    showAllHosts: true
  });

  configMarkdownIt(eleventyConfig);
  registerExtensions(eleventyConfig);
    
  return {
    dir: {
      input: "src",
    }
  }
};