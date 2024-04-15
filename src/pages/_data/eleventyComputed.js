import CustomMarkdownIt from "../../../11ty-extensions/markdown-it-config.js";
import DOM from "fauxdom";

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
