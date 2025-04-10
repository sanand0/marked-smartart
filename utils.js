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
 * Process content lines for diagrams (old format with pipe separator)
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
  processContentLines,
  processSmartArtContent
};
