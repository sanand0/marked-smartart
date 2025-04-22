/**
 * Pyramid diagram renderer
 * Creates SVG pyramid diagrams with customizable layers
 */

import { createError, getDefaultStyles, getDefaultColors, processSmartArtContent } from './utils.js';

/**
 * Creates an SVG pyramid diagram
 */
function createPyramidSVG(contentArray, optionsArray, globalOptions = {}) {
  // Validate input
  if (!Array.isArray(contentArray) || contentArray.length === 0) {
    return createError('No pyramid content provided');
  }

  // Set and validate options
  const defaults = { width: 400, height: 200, fontSize: 14 };
  const options = { ...defaults, ...globalOptions };
  
  const layerCount = contentArray.length;
  const layerHeight = options.height / layerCount;
  const defaultColors = getDefaultColors();

  // Start SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${options.width}" height="${options.height}" viewBox="0 0 ${options.width} ${options.height}"
    class="pyramid-diagram">`;

  // Create each layer from top to bottom
  for (let i = 0; i < layerCount; i++) {
    const layerOptions = optionsArray[i] || {};
    
    // Get font size and color for this layer
    const layerFontSize = layerOptions.fontSize ? 
      Math.max(0, Number(layerOptions.fontSize)) || options.fontSize : 
      options.fontSize;
    
    const color = layerOptions.color || defaultColors[i % defaultColors.length];
    const y = i * layerHeight;

    // Calculate widths for current and next layer
    const widthPercent = i / layerCount;
    const layerWidth = options.width * widthPercent;
    const xOffset = (options.width - layerWidth) / 2;

    // Draw layer path
    const nextWidth = options.width * ((i + 1) / layerCount);
    const nextXOffset = (options.width - nextWidth) / 2;
    
    // Create path based on layer position
    const path = i === 0 ?
      // Top layer - triangle
      `M ${options.width / 2},${y}
       L ${nextXOffset + nextWidth},${y + layerHeight}
       L ${nextXOffset},${y + layerHeight}
       Z` :
      // Middle layers - trapeziums
      `M ${xOffset},${y}
       L ${xOffset + layerWidth},${y}
       L ${nextXOffset + nextWidth},${y + layerHeight}
       L ${nextXOffset},${y + layerHeight}
       Z`;

    // Add layer shape
    svg += `<path d="${path}" fill="${color}" stroke="#333" stroke-width="1" />`;

    // Calculate content dimensions
    const contentWidth = i === 0 ? options.width * 0.3 : layerWidth; // Smaller width for top triangle
    const contentXOffset = i === 0 ? (options.width - contentWidth) / 2 : xOffset;

    // Add content with foreignObject
    svg += `
      <foreignObject x="${contentXOffset}" y="${y}" width="${contentWidth}" height="${layerHeight}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="${getDefaultStyles(layerFontSize)}">
          <div class="pyramid-content">${contentArray[i]}</div>
        </div>
      </foreignObject>
    `;
  }

  return svg + '</svg>';
}

/**
 * Process pyramid diagram content from code block
 */
function processPyramidDiagram(content) {
  const { contentArray, optionsArray, globalOptions } = processSmartArtContent(content, 'pyramid');
  
  return createPyramidSVG(contentArray, optionsArray, globalOptions);
}

export {
  createPyramidSVG,
  processPyramidDiagram
};