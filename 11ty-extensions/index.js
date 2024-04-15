import CustomMarkdownIt from "./markdown-it-config.js";
import LayoutBlockShortcodes from "./layout-block-shortcodes.js";
import CardShortcodes from "./card-shortcodes.js";
import NunjucksExt from "./nunjucks-exts.js";
import Transforms from "./eleventy-transforms.js";

export default function(eleventyConfig) {
  eleventyConfig.setLibrary("md", CustomMarkdownIt);
  LayoutBlockShortcodes(eleventyConfig);
  CardShortcodes(eleventyConfig);
  NunjucksExt(eleventyConfig);
  Transforms(eleventyConfig);
};