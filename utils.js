/**
 * Shared utility functions for diagram rendering
 */

/**
 * Parse options from string format to object
 */
function parseOptions(optionsStr) {
  if (!optionsStr) return {};
  
  // Handle space-separated numeric values (width height fontSize)
  if (/^\d+(\s+\d+){0,2}$/.test(optionsStr)) {
    const values = optionsStr.split(/\s+/).map(Number);
    return {
      ...(values[0] && { width: values[0] }),
      ...(values[1] && { height: values[1] }),
      ...(values[2] && { fontSize: values[2] })
    };
  }
  
  // Handle key=value pairs
  const options = {};
  const optionPairs = optionsStr.match(/(\w+)=([^\s]+)/g) || [];
  
  optionPairs.forEach(pair => {
    const [key, value] = pair.split('=').map(s => s.trim());
    options[key] = /^\d+$/.test(value) ? parseInt(value, 10) : 
                 /^\d+\.\d+$/.test(value) ? parseFloat(value) :
                 value === 'true' ? true :
                 value === 'false' ? false : value;
  });
  
  return options;
}

/**
 * Check if a string is a valid hex color code
 */
const isColorCode = str => str && /^#([0-9A-F]{3}){1,2}$/i.test(str);

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
 * Process content lines for diagrams
 */
function processContentLines(lines, diagramType) {
  const contentArray = [];
  const optionsArray = [];
  
  // Find start index and check for options
  let startIndex = lines.findIndex(line => line.trim() === diagramType) + 1;
  if (startIndex === 0) startIndex = 1;
  
  // Parse global options if present
  let globalOptions = {};
  if (startIndex < lines.length && lines[startIndex]?.trim().startsWith('options:')) {
    globalOptions = parseOptions(lines[startIndex].substring(8).trim());
    startIndex++;
  }
  
  // Process content lines
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split('|').map(part => part.trim());
    let content = parts[0];
    let itemOptions = {};
    
    // Process options and content
    if (parts.length > 1) {
      if (isColorCode(parts[1])) {
        itemOptions.color = parts[1];
      } else if (parts[1].includes('=')) {
        itemOptions = parseOptions(parts[1]);
      }
    }
    
    if (parts.length > 2) {
      content = isColorCode(parts[2]) ? parts[0] : parts[2];
      if (isColorCode(parts[2])) itemOptions.color = parts[2];
    }
    
    contentArray.push(content);
    optionsArray.push(itemOptions);
  }
  
  return { contentArray, optionsArray, globalOptions };
}

module.exports = {
  createError,
  getDefaultStyles,
  getDefaultColors,
  processContentLines
};
