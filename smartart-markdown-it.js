/**
 * SmartArt Plugin for markdown-it
 * Combines all diagram types into a single plugin
 */
const { processPyramidDiagram } = require('./pyramid');
const { processChevronDiagram } = require('./chevron');
const { processVennDiagram } = require('./venn');

/**
 * Markdown-it plugin for rendering all SmartArt diagram types
 */
function markdownItSmartArt(md) {
  const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules);
  
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const code = token.content.trim();
    const firstLine = code.split('\n')[0].trim();
    
    if (token.info.trim() === 'smartart') {
      // Map diagram types to their processors
      const processors = {
        'type: pyramid': processPyramidDiagram,
        'type: chevron': processChevronDiagram,
        'type: venn': processVennDiagram
      };
      
      return processors[firstLine]?.(code) || defaultFence(tokens, idx, options, env, self);
    }
    
    return defaultFence(tokens, idx, options, env, self);
  };
}

// Export the plugin and render functions
module.exports = markdownItSmartArt;
module.exports.renderPyramid = processPyramidDiagram;
module.exports.renderChevron = processChevronDiagram;
module.exports.renderVenn = processVennDiagram;