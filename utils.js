/**
 * Shared utility functions for diagram rendering
 */

/**
 * Parse options from curly brace format to object
 */
function parseCurlyOptions(optionsStr) {
  if (!optionsStr) return {};
  
  const options = {};
  const optionPairs = optionsStr.split(',').map(pair => pair.trim());
  
  optionPairs.forEach(pair => {
    const [key, value] = pair.split(':').map(s => s.trim());
    if (key && value) {
      options[key] = /^\d+$/.test(value) ? parseInt(value, 10) : 
                   /^\d+\.\d+$/.test(value) ? parseFloat(value) :
                   value.replace(/['"]/g, ''); // Remove quotes from string values
    }
  });
  
  return options;
}

/**
 * Create an error message element
 */
const createError = (message, className = 'diagram-error') => 
  `<div class="${className}">Error: ${message}</div>`;

/**
 * Get default styles for diagram content
 */
function getDefaultStyles(fontSize, color = '', isVenn = false) {
  const baseStyles = `width:100%;height:100%;display:flex;align-items:center;justify-content:center;
    font-family:Arial,sans-serif;padding:10px;box-sizing:border-box;text-align:center;
    font-size:${fontSize}px;`;
  
  return `${baseStyles}${color ? `color:${color};` : ''}${isVenn ? 
    `max-width:100%;max-height:100%;display:inline-block;padding:3px;overflow:hidden;` : ''}`;
}

/**
 * Get default colors for diagrams
 */
const getDefaultColors = (isVenn = false) => isVenn ? 
  ['rgba(66, 133, 244, 0.5)', 'rgba(52, 168, 83, 0.5)', 'rgba(251, 188, 5, 0.5)'] :
  ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5F6368'];



/**
 * Process content lines for smartart diagrams (new format with curly braces)
 */
function processSmartArtContent(content, diagramType) {
  const lines = content.trim().split('\n');
  
  // Find the separator line
  const separatorIndex = lines.findIndex(line => line.trim() === '---');
  const startIndex = separatorIndex !== -1 ? separatorIndex + 1 : 0;
  
  // Extract global options before the separator
  let globalOptions = {};
  for (let i = 0; i < (separatorIndex !== -1 ? separatorIndex : 1); i++) {
    const line = lines[i].trim();
    if (line === `type: ${diagramType}`) continue;
    
    // Parse width, height, fontSize directly
    if (line.startsWith('width:')) {
      globalOptions.width = parseInt(line.split(':')[1].trim(), 10);
    } else if (line.startsWith('height:')) {
      globalOptions.height = parseInt(line.split(':')[1].trim(), 10);
    } else if (line.startsWith('fontSize:')) {
      globalOptions.fontSize = parseInt(line.split(':')[1].trim(), 10);
    }
  }
  
  // Process content lines after the separator
  const contentArray = [];
  const optionsArray = [];
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse content and options using the new format: Content { option: value }
    const contentMatch = line.match(/^(.*?)(?:\s*\{\s*(.*?)\s*\})?$/);
    
    if (contentMatch) {
      const content = contentMatch[1].trim();
      const optionsStr = contentMatch[2] || '';
      
      // Parse options
      const itemOptions = parseCurlyOptions(optionsStr);
      
      contentArray.push(content);
      optionsArray.push(itemOptions);
    }
  }
  
  return { contentArray, optionsArray, globalOptions };
}

module.exports = {
  createError,
  getDefaultStyles,
  getDefaultColors,
  processSmartArtContent
};
