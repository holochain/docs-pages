module.exports = function(eleventyConfig) {
  
  eleventyConfig.addPairedShortcode('linkTile', function(content, href, classStringAddition = null) {
    const addedClassString = classStringAddition ? `link-tile ${classStringAddition}` : "link-tile";
    
    return `<a href="${href}" class="${addedClassString}">
      <div class="head-space"></div>
      <div class="content-wrapper">${content}</div>
    </a>`;
  });
}