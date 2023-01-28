module.exports = function(eleventyConfig) {
  const layoutBlockContent = {};
  
  /**
   * Stores the content for a layout block for a given page. 
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
   * @param {string} content The slot data in the pair. Used as default. Can be empty.
   * @param {string} name Layout Block name
   */
  eleventyConfig.addPairedShortcode('renderlayoutblock', function(content, name) {
    //console.log('renderlayoutblock', name, this.page);
  
    return getLayoutContent(name, this.page, content);
  });


  /**
   * Called in page to specify content to insert into block in layout creagted with renderlayoutblock.
   * @param {string} content
   * @param {string} name Layout Block name
   */
  eleventyConfig.addPairedShortcode('layoutblock', function(content, name) {
    //console.log('layoutblock', this.page);
    
    storeLayoutContent(name, this.page, content);
    return '';
  });
}