// mermaid-engine.js
// Elegant Marp engine for Mermaid diagram integration with Pyramid, Venn, and Chevron diagrams

// Import the diagram plugins
const markdownItPyramid = require('./pyramid-markdown-it');
const markdownItVenn = require('./venn-markdown-it');
const markdownItChevron = require('./chevron-markdown-it');

module.exports = ({ marp }) => {
  // Store original fence renderer
  const originalFence = marp.markdown.renderer.rules.fence;
  
  // Override fence renderer for mermaid code blocks
  marp.markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const code = token.content.trim();
    const firstLine = code.split('\n')[0].trim();
    
    if (token.info.trim() === 'mermaid') {
      // Check for specific diagram types
      if (firstLine === 'pyramid') {
        return markdownItPyramid.renderPyramid(code);
      } else if (firstLine === 'venn') {
        return markdownItVenn.renderVenn(code);
      } else if (firstLine === 'chevron') {
        return markdownItChevron.renderChevron(code);
      } else {
        // Default mermaid handling for other diagram types
        return `<div class="mermaid">${tokens[idx].content}</div>`;
      }
    }
    
    // Use original renderer for non-mermaid code blocks
    return originalFence.call(this, tokens, idx, options, env, self);
  };

  // Add mermaid script to HTML when needed
  marp.use(md => {
    const originalRender = md.renderer.render;
    md.renderer.render = function(...args) {
      const result = originalRender.apply(this, args);
      return result.includes('class="mermaid"')
        ? result + `
          <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
          <script>
            document.addEventListener('DOMContentLoaded', () => 
              mermaid.initialize({ startOnLoad: true, theme: 'default' })
            );
          </script>`
        : result;
    };
  });

  return marp;
};