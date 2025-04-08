/**
 * Venn Diagram Plugin for markdown-it
 * Renders SVG Venn diagrams using Mermaid syntax in markdown code blocks
 */

/**
 * Creates an SVG Venn diagram with three circles and four intersection regions
 */
function createVennSVG(contentArray, optionsArray, globalOptions = {}) {
  // Validate input
  if (!Array.isArray(contentArray) || contentArray.length === 0) {
    return '<div class="venn-error">Error: No venn content provided</div>';
  }

  // Set and validate options
  const defaults = { width: 600, height: 400, fontSize: 14 };
  const options = { ...defaults };
  
  // Process numeric options
  ['width', 'height', 'fontSize'].forEach(prop => {
    if (globalOptions[prop]) {
      const value = Number(globalOptions[prop]);
      if (!isNaN(value) && value > 0) options[prop] = value;
    }
  });
  
  // Set up diagram parameters
  const { width, height, fontSize } = options;
  const defaultColors = ['rgba(66, 133, 244, 0.5)', 'rgba(52, 168, 83, 0.5)', 'rgba(251, 188, 5, 0.5)'];
  const radius = Math.min(width, height) / 4;
  const overlap = radius * 0.4;

  // Calculate circle centers
  const centers = [
    { x: width / 2 - radius + overlap, y: height / 2 - radius + overlap },
    { x: width / 2 + radius - overlap, y: height / 2 - radius + overlap },
    { x: width / 2, y: height / 2 + radius - overlap }
  ];

  // Start SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
    width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="venn-diagram">`;

  // Draw the three circles with default colors
  centers.forEach((center, i) => {
    svg += `<circle cx="${center.x}" cy="${center.y}" r="${radius}" 
      fill="${defaultColors[i]}" stroke="#333" stroke-width="1" />`;
  });

  // Define intersection regions
  const regions = [
    { id: "AB", x: (centers[0].x + centers[1].x)/2, y: (centers[0].y + centers[1].y)/2 - overlap/2, width: radius*0.8, height: radius*0.8 },
    { id: "BC", x: (centers[1].x + centers[2].x)/2, y: (centers[1].y + centers[2].y)/2, width: radius*0.8, height: radius*0.8 },
    { id: "AC", x: (centers[0].x + centers[2].x)/2, y: (centers[0].y + centers[2].y)/2, width: radius*0.8, height: radius*0.8 },
    { id: "ABC", x: (centers[0].x + centers[1].x + centers[2].x)/3, y: (centers[0].y + centers[1].y + centers[2].y)/3, width: radius*0.7, height: radius*0.7 }
  ];

  // Add content to regions (maximum of 4 intersection points)
  const contentCount = Math.min(contentArray.length, 4);
  
  for (let i = 0; i < contentCount; i++) {
    if (!contentArray[i]?.trim()) continue;
    
    const region = regions[i];
    const regionOptions = optionsArray[i] || {};
    
    // Get font size for this region
    let regionFontSize = fontSize;
    if (regionOptions.fontSize) {
      const size = Number(regionOptions.fontSize);
      if (!isNaN(size) && size > 0) regionFontSize = size;
    }
    
    // Apply text color if specified
    const textColor = regionOptions.color ? `color:${regionOptions.color};` : '';
    
    // Add content with foreignObject
    svg += `<foreignObject x="${region.x - region.width/2}" y="${region.y - region.height/2}" width="${region.width}" height="${region.height}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
        font-family:Arial,sans-serif;padding:5px;box-sizing:border-box;text-align:center;overflow:hidden;font-size:${regionFontSize}px;">
        <div class="venn-content" style="max-width:100%;max-height:100%;display:inline-block;padding:3px;${textColor}">${contentArray[i]}</div>
      </div>
    </foreignObject>`;
  }

  return svg + '</svg>';
}

/**
 * Parse options from string format to object
 */
function parseOptions(optionsStr) {
  if (!optionsStr) return {};
  
  // Handle space-separated numeric values (width height fontSize)
  if (/^\d+(\s+\d+){0,2}$/.test(optionsStr)) {
    const values = optionsStr.split(/\s+/).map(Number);
    const result = {};
    if (values.length > 0) result.width = values[0];
    if (values.length > 1) result.height = values[1];
    if (values.length > 2) result.fontSize = values[2];
    return result;
  }
  
  // Handle key=value pairs
  const options = {};
  const optionPairs = optionsStr.match(/(\w+)=([^\s]+)/g) || [];
  
  optionPairs.forEach(pair => {
    const [key, value] = pair.split('=');
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
function isColorCode(str) {
  return str && /^#([0-9A-F]{3}){1,2}$/i.test(str);
}

/**
 * Process venn diagram content from Mermaid code block
 */
function processVennDiagram(content) {
  const lines = content.trim().split('\n');
  const contentArray = [];
  const optionsArray = [];
  let globalOptions = {};
  
  // Find the start index (after 'venn' line)
  let startIndex = lines.findIndex(line => line.trim() === 'venn') + 1;
  if (startIndex === 0) startIndex = 1; // Default to 1 if 'venn' not found
  
  // Check for options line
  if (startIndex < lines.length && lines[startIndex]?.trim().startsWith('options:')) {
    globalOptions = parseOptions(lines[startIndex].substring(8).trim());
    startIndex++;
  }
  
  // Process content lines - limit to 4 items for Venn diagram
  for (let i = startIndex; i < lines.length && contentArray.length < 4; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse the line content and options
    const parts = line.split('|').map(part => part.trim());
    let content = parts[0];
    let itemOptions = {};
    
    // Process options and content from parts
    if (parts.length > 1) {
      if (isColorCode(parts[1])) {
        itemOptions.color = parts[1];
      } else if (parts[1].includes('=')) {
        itemOptions = parseOptions(parts[1]);
      }
    }
    
    if (parts.length > 2) {
      if (isColorCode(parts[2])) {
        itemOptions.color = parts[2];
      } else {
        content = parts[2];
      }
    }
    
    contentArray.push(content);
    optionsArray.push(itemOptions);
  }
  
  // Ensure exactly 4 content items
  while (contentArray.length < 4) {
    contentArray.push('');
    optionsArray.push({});
  }
  
  return createVennSVG(contentArray, optionsArray, globalOptions);
}

// Export the markdown-it plugin
module.exports = function markdownItVenn(md) {
  const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules);
  
  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const code = token.content.trim();
    const firstLine = code.split('\n')[0].trim();
    
    return (token.info.trim() === 'mermaid' && firstLine === 'venn') 
      ? processVennDiagram(code)
      : defaultFence(tokens, idx, options, env, self);
  };
};

// Expose the render function for direct use
module.exports.renderVenn = processVennDiagram;
