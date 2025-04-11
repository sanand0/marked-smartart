/**
 * Chevron diagram renderer
 * Creates SVG chevron diagrams with customizable steps
 */

import { createError, getDefaultStyles, getDefaultColors, processSmartArtContent } from './utils.js';

/**
 * Creates an SVG chevron diagram
 */
function createChevronSVG(contentArray, optionsArray, globalOptions = {}) {
  // Validate input
  if (!Array.isArray(contentArray) || contentArray.length === 0) {
    return createError('No chevron content provided');
  }

  // Set and validate options
  const defaults = { width: 200, height: 100, fontSize: 14 };
  const options = { ...defaults, ...globalOptions };
  
  const { width, height } = options;
  const defaultColors = getDefaultColors();
  const chevronCount = contentArray.length;
  
  const chevronIndent = width * 0.2; // 20% indent for chevron shape
  const totalWidth = width * chevronCount - chevronIndent * (chevronCount - 1);

  // Start SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" 
    width="${totalWidth}" height="${height}" 
    viewBox="0 0 ${totalWidth} ${height}" 
    class="chevron-diagram">`;

  // Create each chevron
  let xPosition = 0;

  for (let i = 0; i < chevronCount; i++) {
    const chevronOptions = optionsArray[i] || {};
    
    // Get font size and color for this chevron
    const fontSize = chevronOptions.fontSize ? 
      Math.max(0, Number(chevronOptions.fontSize)) || options.fontSize : 
      options.fontSize;
    
    const color = chevronOptions.color || defaultColors[i % defaultColors.length];
    const nextX = xPosition + width - chevronIndent;

    // Draw chevron shape - ensure first chevron is flat on the left
    const chevronPath = i === 0 ?
      // First chevron - flat on the left
      `M ${xPosition},0
       L ${nextX},0
       L ${nextX + chevronIndent},${height / 2}
       L ${nextX},${height}
       L ${xPosition},${height}
       Z` :
      // Other chevrons - indented on the left
      `M ${xPosition},0
       L ${nextX},0
       L ${nextX + chevronIndent},${height / 2}
       L ${nextX},${height}
       L ${xPosition},${height}
       L ${xPosition + chevronIndent},${height / 2}
       Z`;

    // Add chevron shape
    svg += `<path d="${chevronPath}" fill="${color}" stroke="#333" stroke-width="1" />`;

    // Calculate foreignObject position and size
    const foreignX = xPosition + (i > 0 ? chevronIndent : 0);
    const foreignWidth = width - (i > 0 ? chevronIndent : 0) - (i < chevronCount - 1 ? chevronIndent : 0);

    // Add content with foreignObject
    if (contentArray[i]?.trim()) {
      svg += `
        <foreignObject x="${foreignX}" y="0" width="${foreignWidth}" height="${height}">
          <div xmlns="http://www.w3.org/1999/xhtml" 
            style="${getDefaultStyles(fontSize)}">
            <div class="chevron-content">${contentArray[i]}</div>
          </div>
        </foreignObject>
      `;
    }

    // Move to next position
    xPosition = nextX;
  }

  return svg + '</svg>';
}

/**
 * Process chevron diagram content from code block
 */
function processChevronDiagram(content) {
  const { contentArray, optionsArray, globalOptions } = processSmartArtContent(content, 'chevron');
  
  return createChevronSVG(contentArray, optionsArray, globalOptions);
}

export {
  createChevronSVG,
  processChevronDiagram
};