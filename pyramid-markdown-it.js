/**
 * Pyramid Diagram Plugin for markdown-it
 * Renders SVG pyramid diagrams using Mermaid syntax in markdown code blocks
 */

/**
 * Creates an SVG pyramid diagram with customizable layers
 */
function createPyramidSVG(contentArray, optionsArray, globalOptions = {}) {
  // Validate input
  if (!Array.isArray(contentArray) || contentArray.length === 0) {
    return '<div class="pyramid-error">Error: No pyramid content provided</div>';
  }

  // Set and validate options
  const defaults = { width: 400, height: 200, fontSize: 14 };
  const options = { ...defaults };
  
  // Process numeric options
  ['width', 'height', 'fontSize'].forEach(prop => {
    if (globalOptions[prop]) {
      const value = Number(globalOptions[prop]);
      if (!isNaN(value) && value > 0) options[prop] = value;
    }
  });

  const layerCount = contentArray.length;
  const layerHeight = options.height / layerCount;

  // Default colors if none provided
  const defaultColors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5F6368'];

  // Start SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${options.width}" height="${options.height}" viewBox="0 0 ${options.width} ${options.height}"
    class="pyramid-diagram">`;

  // Create each layer
  for (let i = 0; i < layerCount; i++) {
    const layerOptions = optionsArray[i] || {};
    
    // Get font size for this layer
    let layerFontSize = options.fontSize;
    if (layerOptions.fontSize) {
      const size = Number(layerOptions.fontSize);
      if (!isNaN(size) && size > 0) layerFontSize = size;
    }
    
    // Get color for this layer
    const color = layerOptions.color || defaultColors[i % defaultColors.length];
    const y = i * layerHeight;

    // Calculate widths for current and next layer
    const widthPercent = i / layerCount;
    const layerWidth = options.width * widthPercent;
    const xOffset = (options.width - layerWidth) / 2;

    // Draw layer path
    let path;
    if (i === 0) {
      // Top layer - triangle
      const nextWidth = options.width * (1 / layerCount);
      const nextXOffset = (options.width - nextWidth) / 2;
      path = `
        M ${options.width / 2},${y}
        L ${nextXOffset + nextWidth},${y + layerHeight}
        L ${nextXOffset},${y + layerHeight}
        Z
      `;
    } else {
      // Middle layers - trapeziums
      const nextWidth = options.width * ((i + 1) / layerCount);
      const nextXOffset = (options.width - nextWidth) / 2;
      path = `
        M ${xOffset},${y}
        L ${xOffset + layerWidth},${y}
        L ${nextXOffset + nextWidth},${y + layerHeight}
        L ${nextXOffset},${y + layerHeight}
        Z
      `;
    }

    // Add layer shape
    svg += `<path d="${path}" fill="${color}" stroke="#333" stroke-width="1" />`;

    // Calculate content dimensions
    const contentWidth = i === 0 ? options.width * 0.3 : layerWidth; // Smaller width for top triangle
    const contentXOffset = i === 0 ? (options.width - contentWidth) / 2 : xOffset;

    // Add content with foreignObject
    svg += `
      <foreignObject x="${contentXOffset}" y="${y}" width="${contentWidth}" height="${layerHeight}">
        <div xmlns="http://www.w3.org/1999/xhtml"
          style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
          color:white;font-family:Arial,sans-serif;padding:10px;box-sizing:border-box;
          text-align:center;font-size:${layerFontSize}px;">
          <div class="pyramid-content">${contentArray[i]}</div>
        </div>
      </foreignObject>
    `;
  }

  svg += '</svg>';
  return svg;
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
 * Process pyramid diagram content from Mermaid code block
 */
function processPyramidDiagram(content) {
  const lines = content.trim().split('\n');
  const contentArray = [];
  const optionsArray = [];
  let globalOptions = {};
  
  // Find the start index (after 'pyramid' line)
  let startIndex = lines.findIndex(line => line.trim() === 'pyramid') + 1;
  if (startIndex === 0) startIndex = 1; // Default to 1 if 'pyramid' not found
  
  // Check for options line
  if (startIndex < lines.length && lines[startIndex]?.trim().startsWith('options:')) {
    globalOptions = parseOptions(lines[startIndex].substring(8).trim());
    startIndex++;
  }
  
  // Process content lines
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse the line content and options
    const parts = line.split('|').map(part => part.trim());
    let content = parts[0];
    let layerOptions = {};
    
    // Process options and content from parts
    if (parts.length > 1) {
      if (isColorCode(parts[1])) {
        layerOptions.color = parts[1];
      } else if (parts[1].includes('=')) {
        layerOptions = parseOptions(parts[1]);
      }
    }
    
    if (parts.length > 2) {
      if (isColorCode(parts[2])) {
        layerOptions.color = parts[2];
      } else {
        content = parts[2];
      }
    }
    
    contentArray.push(content);
    optionsArray.push(layerOptions);
  }
  
  return createPyramidSVG(contentArray, optionsArray, globalOptions);
}

// Export the markdown-it plugin
module.exports = function markdownItPyramid(md) {
  const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules);
  
  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const code = token.content.trim();
    const firstLine = code.split('\n')[0].trim();
    
    return (token.info.trim() === 'mermaid' && firstLine === 'pyramid') 
      ? processPyramidDiagram(code)
      : defaultFence(tokens, idx, options, env, self);
  };
};

// Expose the render function for direct use
module.exports.renderPyramid = processPyramidDiagram;
