// smartart-engine.js
// Combined engine and plugin for SmartArt diagrams in Marp presentations

// Import the diagram processors
const { processPyramidDiagram } = require("./pyramid");
const { processVennDiagram } = require("./venn");
const { processChevronDiagram } = require("./chevron");

/**
 * SmartArt plugin function for Marpit
 * Enables rendering of custom diagram types in Marpit presentations
 */
function smartartPlugin(marpit) {
  // Get access to the markdown-it instance
  const { markdown } = marpit;

  // Store original fence renderer
  const originalFence = markdown.renderer.rules.fence;

  // Override fence renderer for smartart code blocks
  markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const code = token.content.trim();
    const firstLine = code.split("\n")[0].trim();

    if (token.info.trim() === "smartart") {
      // Map diagram types to their processors
      const processors = {
        "type: pyramid": processPyramidDiagram,
        "type: venn": processVennDiagram,
        "type: chevron": processChevronDiagram,
      };

      // Process the diagram if type is recognized
      if (processors[firstLine]) return processors[firstLine](code);

      // Fall back to original renderer if type not recognized
      return originalFence.call(self, tokens, idx, options, env, self);
    }

    // Use original renderer for non-smartart code blocks
    return originalFence.call(self, tokens, idx, options, env, self);
  };
}

/**
 * Engine function for Marp CLI
 * This is the entry point when used with --engine parameter
 */
module.exports = ({ marp }) => {
  // Apply the SmartArt plugin directly to the Marp instance
  smartartPlugin(marp);

  // Return the enhanced Marp instance
  return marp;
};

// Export the plugin function for direct use
module.exports.smartartPlugin = smartartPlugin;
