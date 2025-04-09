// smartart-map-engine.js
// Custom diagram engine for Marp presentations

// Import the unified SmartArt plugin
const markdownItSmartArt = require('./smartart-markdown-it');

module.exports = ({ marp }) => {
  // Store original fence renderer
  const originalFence = marp.markdown.renderer.rules.fence;
  
  // Override fence renderer for mermaid code blocks
  marp.markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const code = token.content.trim();
    const firstLine = code.split('\n')[0].trim();
    
    if (token.info.trim() === 'mermaid') {
      // Map diagram types to their processors
      const processors = {
        'pyramid': markdownItSmartArt.renderPyramid,
        'venn': markdownItSmartArt.renderVenn,
        'chevron': markdownItSmartArt.renderChevron
      };
      
      return processors[firstLine]?.(code) || originalFence.call(this, tokens, idx, options, env, self);
    }
    
    // Use original renderer for non-mermaid code blocks
    return originalFence.call(this, tokens, idx, options, env, self);
  };

  return marp;
};