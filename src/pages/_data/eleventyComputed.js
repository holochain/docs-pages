import CustomMarkdownIt from "../../../11ty-extensions/markdown-it-config.js";
import DOM from "fauxdom";

// This file generates on-page TOC for every Markdown page that doesn't disable
// this feature via a `tocData` property in the front matter.
// See the `Table of contents` section of `/11ty-markdown-changes.md` for info.
//
// Note that this passes the `data.page.rawInput` data property through
// Markdown-it so it has access to the HTML for generating the outline.
// `rawInput` is a new property as of 11ty 3.0.0: https://github.com/11ty/eleventy/issues/1206#issuecomment-1885269900
// So that means it parses every Markdown page twice. Yes, I know that's a
// performance hit, but 11ty doesn't let you generate computed data from the
// content _after_ it's been converted to HTML.

function generateOutline(content) {
  const doc = new DOM(content);
  let headers = doc.querySelectorAll(":is(h2, h3, h4, h5, h6)[id]:not([data-no-toc])")
    .map(el => {
      return {
        level: Number(el.tagName.substring(1, 2)),
        text: el.textContent.trim(),
        href: el.id
      };
    });

  function buildOutlineRecursive(headers, currentLevel = 2) {
    const nestedSection = [];

    if (headers.length) {
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];

        if (header.level < currentLevel) {
          break;
        }

        if (header.level == currentLevel) {
          let node = {
            text: header.text,
            href: header.href
          };

          let children = buildOutlineRecursive(
            headers.slice(i + 1),
            header.level + 1
          );

          if (children.length) {
            node.children = children;
          }

          nestedSection.push(node);
        }
      }
    }

    return nestedSection;
  }

  return buildOutlineRecursive(headers);
}

export default {
  generatedTocData: function(data) {
    if (data.page.templateSyntax.endsWith("md") && data.tocData === undefined) {
      const html = CustomMarkdownIt.render(data.page.rawInput);
      return generateOutline(html);
    }
  }
};
