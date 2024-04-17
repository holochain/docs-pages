import CustomMarkdownIt from "./markdown-it-config.js";
import LayoutBlockShortcodes from "./layout-block-shortcodes.js";
import CardShortcodes from "./card-shortcodes.js";
import NunjucksExt from "./nunjucks-exts.js";
import Transforms from "./eleventy-transforms.js";

export default function(eleventyConfig) {
  // The markdown-it-config.js file isn't set up as an Eleventy extension.
  // Instead, it just loads up Markdown-it and adds extensions, then exports
  // that extended config. This is so it can be used by both Eleventy here, and
  // by the TOC generator in /src/pages/_data/eleventyComputed.js
  eleventyConfig.setLibrary("md", CustomMarkdownIt);
  LayoutBlockShortcodes(eleventyConfig);
  CardShortcodes(eleventyConfig);
  NunjucksExt(eleventyConfig);
  Transforms(eleventyConfig);
};