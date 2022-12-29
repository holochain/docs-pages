module.exports = function(eleventyConfig) {
  const layoutBlockContent = {};
  console.log("!!!!Init!!!", layoutBlockContent);
  
  /**
   * Stores the 
   * @param {string} blockName Name of block
   * @param {*} page Page object 
   * @param {string} content 
   */
  const storeLayoutContent = (blockName, page, content) => {
    layoutBlockContent[blockName] = layoutBlockContent[blockName] || {};
    layoutBlockContent[blockName][page.inputPath] = content;
  };

  const getLayoutContent = (blockName, page, defaultContent = "") => {
    const contentForBlockName = layoutBlockContent[blockName];
    const contentForBlockNameOnPage = contentForBlockName ? contentForBlockName[page.inputPath] : null;
    return contentForBlockNameOnPage || defaultContent;
  };
  /**
   * Called in Layout to render page specified content
   */
  eleventyConfig.addPairedShortcode('renderlayoutblock', function(content, name) {
    console.log('renderlayoutblock', name, this.page);
    
    return getLayoutContent(name, this.page, content);
  });

  eleventyConfig.addPairedShortcode('layoutblock', function(content, name) {
    //console.log('layoutblock', this.page);
    
    storeLayoutContent(name, this.page, content);
  });

}