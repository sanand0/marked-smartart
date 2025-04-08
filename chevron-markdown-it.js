/**
 * Chevron Diagram Plugin for markdown-it
 * Renders SVG chevron diagrams using Mermaid syntax in markdown code blocks
 */

/**
 * Creates an SVG chevron diagram with customizable steps
 */
function createChevronSVG(contentArray, optionsArray, globalOptions = {}) {
  // Validate input
  if (!Array.isArray(contentArray) || contentArray.length === 0) {
    return '<div class="chevron-error">Error: No chevron content provided</div>';
  }

  // Set and validate options
  const defaults = { width: 200, height: 100, fontSize: 14 };
  const options = { ...defaults };
  
  // Process numeric options
  ['width', 'height', 'fontSize'].forEach(prop => {
    if (globalOptions[prop]) {
      const value = Number(globalOptions[prop]);
      if (!isNaN(value) && value > 0) options[prop] = value;
    }
  });

  const chevronCount = contentArray.length;

  // Calculate chevron dimensions
  const chevronWidth = options.width;
  const chevronHeight = options.height;
  const chevronIndent = chevronWidth * 0.2; // 20% indent for chevron shape
  const totalWidth = chevronWidth * chevronCount - chevronIndent * (chevronCount - 1);

  // Default colors if none provided
  const defaultColors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5F6368', '#185ABC'];

  // Start SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
    width="${totalWidth}" height="${chevronHeight}" viewBox="0 0 ${totalWidth} ${chevronHeight}" 
    class="chevron-diagram">`;

  // Create each chevron
  let xPosition = 0;

  for (let i = 0; i < chevronCount; i++) {
    const chevronOptions = optionsArray[i] || {};
    
    // Get font size for this chevron
    let fontSize = options.fontSize;
    if (chevronOptions.fontSize) {
      const size = Number(chevronOptions.fontSize);
      if (!isNaN(size) && size > 0) fontSize = size;
    }
    
    // Get color for this chevron
    const color = chevronOptions.color || defaultColors[i % defaultColors.length];
    const nextX = xPosition + chevronWidth - chevronIndent;

    // Draw chevron shape - ensure first chevron is flat on the left
    let chevronPath;
    if (i === 0) {
      // First chevron - flat on the left
      chevronPath = `
        M ${xPosition},0
        L ${nextX},0
        L ${nextX + chevronIndent},${chevronHeight / 2}
        L ${nextX},${chevronHeight}
        L ${xPosition},${chevronHeight}
        Z
      `;
    } else {
      // Other chevrons - indented on the left
      chevronPath = `
        M ${xPosition},0
        L ${nextX},0
        L ${nextX + chevronIndent},${chevronHeight / 2}
        L ${nextX},${chevronHeight}
        L ${xPosition},${chevronHeight}
        L ${xPosition + chevronIndent},${chevronHeight / 2}
        Z
      `;
    }

    // Add chevron shape
    svg += `<path d="${chevronPath}" fill="${color}" stroke="#333" stroke-width="1" />`;

    // Calculate foreignObject position and size
    const foreignX = xPosition + (i > 0 ? chevronIndent : 0);
    const foreignWidth = chevronWidth - (i > 0 ? chevronIndent : 0) - (i < chevronCount - 1 ? chevronIndent : 0);

    // Add content with foreignObject
    svg += `
      <foreignObject x="${foreignX}" y="0" width="${foreignWidth}" height="${chevronHeight}">
        <div xmlns="http://www.w3.org/1999/xhtml" 
          style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
          font-family:Arial,sans-serif;padding:10px;box-sizing:border-box;
          text-align:center;font-size:${fontSize}px;">
          <div class="chevron-content">${contentArray[i]}</div>
        </div>
      </foreignObject>
    `;

    // Move to next position
    xPosition = nextX;
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
 * Process chevron diagram content from Mermaid code block
 */
function processChevronDiagram(content) {
  const lines = content.trim().split('\n');
  const contentArray = [];
  const optionsArray = [];
  let globalOptions = {};
  
  // Find the start index (after 'chevron' line)
  let startIndex = lines.findIndex(line => line.trim() === 'chevron') + 1;
  if (startIndex === 0) startIndex = 1; // Default to 1 if 'chevron' not found
  
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
    let chevronOptions = {};
    
    // Process options and content from parts
    if (parts.length > 1) {
      if (isColorCode(parts[1])) {
        chevronOptions.color = parts[1];
      } else if (parts[1].includes('=')) {
        chevronOptions = parseOptions(parts[1]);
      }
    }
    
    if (parts.length > 2) {
      if (isColorCode(parts[2])) {
        chevronOptions.color = parts[2];
      } else {
        content = parts[2];
      }
    }
    
    contentArray.push(content);
    optionsArray.push(chevronOptions);
  }
  
  return createChevronSVG(contentArray, optionsArray, globalOptions);
}

// Export the markdown-it plugin
module.exports = function markdownItChevron(md) {
  const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules);
  
  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const code = token.content.trim();
    const firstLine = code.split('\n')[0].trim();
    
    return (token.info.trim() === 'mermaid' && firstLine === 'chevron') 
      ? processChevronDiagram(code)
      : defaultFence(tokens, idx, options, env, self);
  };
};

// Expose the render function for direct use
module.exports.renderChevron = processChevronDiagram;
