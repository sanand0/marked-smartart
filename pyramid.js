/**
 * Pyramid Diagram Plugin for Marked.js
 * Allows creating SVG pyramid diagrams with four layers using a simple syntax in markdown code blocks
 *
 * Usage:
 * ```pyramid
 * Base | Middle | Upper | Top
 * ```
 * 
 * Or with named parameters:
 * ```pyramid width=500 height=400 fontSize=14
 * Base | Middle | Upper | Top
 * ```
 * 
 * Where each pipe-separated value represents content for a layer of the pyramid (from bottom to top)
 */

(function() {
  /**
   * Creates an SVG representation of a 4-layer pyramid with HTML content in each layer
   * @param {string[]} htmlStrings - Array of HTML strings to place in each layer (from bottom to top)
   * @param {number} width - Width of the SVG in pixels
   * @param {number} height - Height of the SVG in pixels
   * @param {number} fontSize - Base font size for text (increases with each layer)
   * @returns {string} SVG string representation of the pyramid
   */
  function createPyramidSVG(htmlStrings = [], width = 400, height = 300, fontSize = 12) {
    // Define colors
    const layerColors = ['#f8c471', '#f5b041', '#e67e22', '#d35400'];
    
    // Calculate dimensions for each layer
    const baseWidth = width * 0.8;
    const layerHeight = height / 6; // Slightly smaller layers to avoid gaps
    
    // Calculate width for each layer
    const layerWidths = [
      baseWidth,                // Bottom layer (widest)
      baseWidth * 0.75,         // Second layer
      baseWidth * 0.5,          // Third layer
      baseWidth * 0.25          // Top layer width (for triangle base)
    ];
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="pyramid-diagram">`;
    
    // Add a light background
    svg += `<rect width="${width}" height="${height}" fill="#f9f9f9" />`;
    
    // Start position from bottom
    const startY = height - layerHeight;
    
    // Create each layer of the pyramid (bottom to top)
    for (let i = 0; i < 4; i++) {
      const currentWidth = layerWidths[i];
      const xPosition = (width - currentWidth) / 2;
      const yPosition = startY - (i * layerHeight);
      
      // For the top layer (i=3), create a triangle
      if (i === 3) {
        // Triangle (top layer)
        // Create triangle points
        const topX = width / 2;
        const topY = yPosition - layerHeight;
        const leftX = xPosition;
        const leftY = yPosition;
        const rightX = xPosition + currentWidth;
        const rightY = yPosition;
        
        svg += `<polygon 
          points="${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}" 
          fill="${layerColors[i]}" 
          stroke="#333" 
          stroke-width="1" />`;
          
        // Add the HTML content using foreignObject for the triangle
        const textPadding = 5;
        const foreignWidth = currentWidth - (textPadding * 2);
        const foreignHeight = layerHeight - (textPadding * 2);
        const foreignX = xPosition + textPadding;
        const foreignY = yPosition - layerHeight/2;
        
        // Calculate font size for this layer (increases with each layer)
        const layerFontSize = fontSize + i;
        
        svg += `<foreignObject 
          x="${foreignX}" 
          y="${foreignY}" 
          width="${foreignWidth}" 
          height="${foreignHeight}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-family:Arial,sans-serif; color:#333; font-size:${layerFontSize}px; overflow:hidden;">
            ${htmlStrings[3] || '<div style="text-align:center">Top</div>'}
          </div>
        </foreignObject>`;
      } else {
        // Get the width of the layer above
        const nextWidth = layerWidths[i+1];
        const nextXPosition = (width - nextWidth) / 2;
        
        // Create trapezium points
        const topLeft = `${nextXPosition},${yPosition - layerHeight}`;
        const topRight = `${nextXPosition + nextWidth},${yPosition - layerHeight}`;
        const bottomRight = `${xPosition + currentWidth},${yPosition}`;
        const bottomLeft = `${xPosition},${yPosition}`;
        
        svg += `<polygon 
          points="${topLeft} ${topRight} ${bottomRight} ${bottomLeft}" 
          fill="${layerColors[i]}" 
          stroke="#333" 
          stroke-width="1" />`;
        
        // Add the HTML content using foreignObject for the trapezium
        const textPadding = 10;
        const foreignWidth = currentWidth - (textPadding * 2);
        const foreignHeight = layerHeight - (textPadding * 2);
        const foreignX = xPosition + textPadding;
        const foreignY = yPosition - layerHeight + textPadding;
        
        // Calculate font size for this layer (increases with each layer)
        const layerFontSize = fontSize + i;
        
        svg += `<foreignObject 
          x="${foreignX}" 
          y="${foreignY}" 
          width="${foreignWidth}" 
          height="${foreignHeight}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-family:Arial,sans-serif; color:#333; font-size:${layerFontSize}px; overflow:hidden;">
            ${htmlStrings[i] || `<div style="text-align:center">Layer ${i+1}</div>`}
          </div>
        </foreignObject>`;
      }
    }
    
    // Close the SVG tag
    svg += '</svg>';
    
    return svg;
  }

  /**
   * Parse options from a string of space-separated key=value pairs
   * @param {string} optionsStr - String containing options (e.g., "width=500 height=400")
   * @returns {Object} Object with parsed options
   */
  function parseOptions(optionsStr) {
    if (!optionsStr) return {};

    const options = {};
    
    // Check for legacy format (just width and height as numbers)
    if (/^\d+\s+\d+$/.test(optionsStr)) {
      const [width, height] = optionsStr.split(/\s+/).map(Number);
      return { width, height };
    }

    // Parse named parameters (key=value format)
    const optionPairs = optionsStr.match(/(\w+)=([^\s]+)/g) || [];

    optionPairs.forEach(pair => {
      const [key, value] = pair.split('=');
      // Convert numeric values to numbers
      if (/^\d+$/.test(value)) {
        options[key] = parseInt(value, 10);
      } else if (/^\d+\.\d+$/.test(value)) {
        options[key] = parseFloat(value);
      } else if (value === 'true') {
        options[key] = true;
      } else if (value === 'false') {
        options[key] = false;
      } else {
        options[key] = value;
      }
    });

    return options;
  }

  /**
   * Register the pyramid diagram renderer with marked.js
   */
  function pyramidPlugin(options) {
    return {
      name: 'pyramid',
      level: 'block',
      start(src) {
        return src.match(/^```pyramid/)?.index;
      },
      tokenizer(src, tokens) {
        const match = src.match(/^```pyramid(?:\s+(.*?))?\n([\s\S]+?)\n```/);
        if (match) {
          const token = {
            type: 'pyramid',
            raw: match[0],
            options: match[1] || '',
            text: match[2],
            tokens: []
          };
          return token;
        }
        return undefined;
      },
      renderer(token) {
        // Parse global options
        const globalOptions = parseOptions(token.options);
        
        // Set defaults if not provided
        const width = globalOptions.width || 400;
        const height = globalOptions.height || 300;
        const fontSize = globalOptions.fontSize || 12;

        // Parse content for the pyramid diagram
        const content = token.text.trim().split('|').map(part => part.trim());
        
        // Create the pyramid diagram
        return createPyramidSVG(content, width, height, fontSize);
      }
    };
  }

  // Export the plugin and createPyramidSVG function if in a module environment
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = { pyramidPlugin, createPyramidSVG };
  } else if (typeof window !== 'undefined') {
    window.pyramidPlugin = pyramidPlugin;
    window.createPyramidSVG = createPyramidSVG;
    
    // Auto-register with marked if available
    if (window.marked) {
      window.marked.use({ extensions: [pyramidPlugin()] });
    }
  }
})();