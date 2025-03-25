/**
 * Venn Diagram Plugin for Marked.js
 * Allows creating SVG Venn diagrams with three circles using a simple syntax in markdown code blocks
 *
 * Usage:
 * ```venn {width} {height}
 * A∩B | B∩C | A∩C | A∩B∩C
 * ```
 * 
 * Or with named parameters:
 * ```venn width=600 height=400 fontSize=14
 * A∩B | B∩C | A∩C | A∩B∩C
 * ```
 * 
 * Where each pipe-separated value represents content for an intersection area
 */

(function() {
  /**
   * Creates an SVG string with a Venn diagram of three circles containing HTML content
   * @param {string[]} htmlStrings - Array of HTML strings for each region of the Venn diagram
   * @param {number} width - Width of the SVG
   * @param {number} height - Height of the SVG
   * @param {number} fontSize - Font size for text content
   * @returns {string} SVG string representation of the Venn diagram
   */
  function createVenn(htmlStrings, width = 600, height = 400, fontSize = 14) {
    // Validate input
    if (!Array.isArray(htmlStrings) || htmlStrings.length === 0) {
      return '<div class="venn-error">Error: No content provided for Venn diagram</div>';
    }

    // Default colors for the circles
    const defaultColors = ['rgba(66, 133, 244, 0.5)', 'rgba(52, 168, 83, 0.5)', 'rgba(251, 188, 5, 0.5)'];

    // Calculate circle dimensions
    const radius = Math.min(width, height) / 4;
    const overlap = radius * 0.4; // Amount of overlap between circles

    // Calculate circle centers to ensure proper overlap
    const centers = [
      { x: width / 2 - radius + overlap, y: height / 2 - radius + overlap }, // Circle A
      { x: width / 2 + radius - overlap, y: height / 2 - radius + overlap }, // Circle B
      { x: width / 2, y: height / 2 + radius - overlap }                     // Circle C
    ];

    // Start SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="venn-diagram">`;

    // Draw the circles
    for (let i = 0; i < 3; i++) {
      svg += `<circle cx="${centers[i].x}" cy="${centers[i].y}" r="${radius}" fill="${defaultColors[i]}" stroke="#333" stroke-width="1" />`;
    }

    // Calculate positions for intersection regions only
    const regions = [
      { id: "AB", x: (centers[0].x + centers[1].x)/2, y: (centers[0].y + centers[1].y)/2, width: radius, height: radius }, // A and B intersection
      { id: "BC", x: (centers[1].x + centers[2].x)/2, y: (centers[1].y + centers[2].y)/2, width: radius, height: radius }, // B and C intersection
      { id: "AC", x: (centers[0].x + centers[2].x)/2, y: (centers[0].y + centers[2].y)/2, width: radius, height: radius }, // A and C intersection
      { id: "ABC", x: (centers[0].x + centers[1].x + centers[2].x)/3, y: (centers[0].y + centers[1].y + centers[2].y)/3, width: radius, height: radius } // Center intersection
    ];

    // Add HTML content for each intersection region using foreignObject
    for (let i = 0; i < Math.min(htmlStrings.length, regions.length); i++) {
      if (htmlStrings[i] && htmlStrings[i].trim()) {
        const region = regions[i];
        
        svg += `
          <foreignObject x="${region.x - region.width/2}" y="${region.y - region.height/2}" width="${region.width}" height="${region.height}">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;padding:5px;box-sizing:border-box;text-align:center;overflow:hidden;font-size:${fontSize}px;">
              <div class="venn-content" style="max-width:100%;max-height:100%;display:inline-block;">
                ${htmlStrings[i]}
              </div>
            </div>
          </foreignObject>
        `;
      }
    }

    // Close SVG
    svg += '</svg>';
    return svg;
  }

  /**
   * Parse options from a string of space-separated key=value pairs
   * @param {string} optionsStr - String containing options (e.g., "width=600 height=400")
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
   * Register the venn diagram renderer with marked.js
   */
  function vennPlugin(options) {
    return {
      name: 'venn',
      level: 'block',
      start(src) {
        return src.match(/^```venn/)?.index;
      },
      tokenizer(src, tokens) {
        const match = src.match(/^```venn(?:\s+(.*?))?\n([\s\S]+?)\n```/);
        if (match) {
          const token = {
            type: 'venn',
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
        const width = globalOptions.width || 600;
        const height = globalOptions.height || 400;
        const fontSize = globalOptions.fontSize || 14;

        // Parse content for the Venn diagram
        const content = token.text.trim().split('|').map(part => part.trim());
        
        // Create the Venn diagram
        return createVenn(content, width, height, fontSize);
      }
    };
  }

  // Export the plugin and createVenn function if in a module environment
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = { vennPlugin, createVenn };
  } else if (typeof window !== 'undefined') {
    window.vennPlugin = vennPlugin;
    window.createVenn = createVenn;
    
    // Auto-register with marked if available
    if (window.marked) {
      window.marked.use({ extensions: [vennPlugin()] });
    }
  }
})();