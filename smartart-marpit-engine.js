// smartart-marpit-engine.js
// Custom engine for Marp presentations with SmartArt diagrams

// Import the SmartArt Marpit plugin
const smartartPlugin = require('./smartart-marpit-plugin');

/**
 * Custom Marp engine with SmartArt diagram support
 */
module.exports = ({ marp }) => {
  // Apply the SmartArt plugin to Marpit using the proper plugin pattern
  marp.use(smartartPlugin());
  
  // Return the enhanced Marp instance
  return marp;
};
