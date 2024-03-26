import fs from "fs";
import path from "path";

export default function(eleventyConfig) {

  /**
   * Returns markup for a link tile card
   * @param href The url to set the href of the link to
   * @param classStringAddition (Optional) Class names to add to the card
   * @param iconPath (Optional) src relative path to the SVG icon file to insert into the head-space
   */
  eleventyConfig.addPairedShortcode('linkTile', function(content, href, classStringAddition = null, iconPath = "") {
    const addedClassString = !!classStringAddition ? `link-tile ${classStringAddition}` : "link-tile";

    let optionalSvgTag = "";
    if (!!iconPath) {
      if (path.extname(iconPath) != '.svg') {
        throw new Error("linkTile shortcode can only render an svg icon");
      }

      let conditionedFilePath = iconPath;
      if (iconPath.indexOf(".") !== 0) {
        const srcDir = `${eleventyConfig.dir.input}/`
        conditionedFilePath = `${srcDir}/${iconPath}`;
      }

      const svgData = fs.readFileSync(conditionedFilePath);
      optionalSvgTag = svgData.toString();
    }

    return `<a href="${href}" class="${addedClassString}">
      <div class="head-space">${optionalSvgTag}</div>
      <div class="content-wrapper">${content}</div>
    </a>`;
  });
};