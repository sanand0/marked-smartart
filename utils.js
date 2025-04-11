/**
 * Shared utility functions for SmartArt diagram rendering
 */

// Convert string value to appropriate type (number or string)
const parseValue = (value) => 
  /^\d+$/.test(value) ? parseInt(value, 10) : 
  /^\d+\.\d+$/.test(value) ? parseFloat(value) :
  value.replace(/['"]/g, '');

// Parse options from key-value format to object
const parseOptions = (optionsStr, separator = ',') => {
  if (!optionsStr) return {};
  
  const options = {};
  optionsStr.split(separator)
    .map(pair => pair.trim())
    .forEach(pair => {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && value) {
        options[key] = parseValue(value);
      }
    });
  
  return options;
};

// Create HTML error message
const createError = (message, className = 'diagram-error') => 
  `<div class="${className}">Error: ${message}</div>`;

// Get default styles for diagram content
const getDefaultStyles = (fontSize, color = '', isVenn = false) => {
  const baseStyles = `width:100%;height:100%;display:flex;align-items:center;justify-content:center;
    font-family:Arial,sans-serif;padding:10px;box-sizing:border-box;text-align:center;
    font-size:${fontSize}px;`;
  
  return `${baseStyles}${color ? `color:${color};` : ''}${isVenn ? 
    `max-width:100%;max-height:100%;display:inline-block;padding:3px;overflow:hidden;` : ''}`;
};

// Get default colors for diagrams
const getDefaultColors = (isVenn = false) => isVenn ? 
  ['rgba(66, 133, 244, 0.5)', 'rgba(52, 168, 83, 0.5)', 'rgba(251, 188, 5, 0.5)'] :
  ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5F6368'];

// Process content lines for smartart diagrams
const processSmartArtContent = (content, diagramType) => {
  const lines = content.trim().split('\n');
  const separatorIndex = lines.findIndex(line => line.trim() === '---');
  const startIndex = separatorIndex !== -1 ? separatorIndex + 1 : 0;
  
  // Extract global options before the separator
  let globalOptions = {};
  for (let i = 0; i < (separatorIndex !== -1 ? separatorIndex : 1); i++) {
    const line = lines[i].trim();
    if (line === `type: ${diagramType}`) continue;
    
    if (line.includes(':')) {
      const [key, valueStr] = line.split(':').map(part => part.trim());
      if (key && valueStr) {
        globalOptions[key] = parseValue(valueStr);
      }
    }
  }
  
  // Process content lines after the separator
  const contentArray = [];
  const optionsArray = [];
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse content and options using format: Content { option: value }
    const contentMatch = line.match(/^(.*?)(?:\s*\{\s*(.*?)\s*\})?$/);
    
    if (contentMatch) {
      contentArray.push(contentMatch[1].trim());
      optionsArray.push(parseOptions(contentMatch[2] || ''));
    }
  }
  
  return { contentArray, optionsArray, globalOptions };
};

module.exports = {
  createError,
  getDefaultStyles,
  getDefaultColors,
  processSmartArtContent
};
