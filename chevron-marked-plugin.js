/**
 * Chevron Process Diagram Plugin for Marked.js
 * Allows creating SVG chevron diagrams using a simple syntax in markdown code blocks
 *
 * Usage:
 * ```chevron {width} {height}
 * Step 1: Planning
 * Step 2: Development | #4285F4
 * Step 3: Testing | #34A853 | <strong>Test</strong><br>Phase
 * Step 4: Deployment
 * ```
 */

(function() {
  /**
   * Creates an SVG string with chevron shapes containing HTML content with auto-sizing text
   * @param {string[]} contentArray - Array of content for each chevron
   * @param {Object[]} optionsArray - Array of options for each chevron
   * @param {Object} globalOptions - Global options for the diagram
   * @param {number} globalOptions.width - Width of each chevron
   * @param {number} globalOptions.height - Height of each chevron
   * @param {number} globalOptions.fontSize - Font size for text
   * @returns {string} SVG string representation of the chevron process diagram
   */
  function createChevronSVG(contentArray, optionsArray, globalOptions = {}) {
    // Validate input
    if (!Array.isArray(contentArray) || contentArray.length === 0) {
      return '<div class="chevron-error">Error: No chevron content provided</div>';
    }

    const chevronCount = contentArray.length;

    // Apply defaults to global options
    const defaults = {
      width: 200,
      height: 100,
      fontSize: 14
    };

    const options = { ...defaults, ...globalOptions };

    // Calculate chevron dimensions
    const chevronWidth = options.width;
    const chevronHeight = options.height;
    const chevronIndent = chevronWidth * 0.2; // 20% indent for chevron shape
    const totalWidth = chevronWidth * chevronCount - chevronIndent * (chevronCount - 1);

    // Default colors if none provided
    const defaultColors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5F6368', '#185ABC'];

    // Start SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="${chevronHeight}" viewBox="0 0 ${totalWidth} ${chevronHeight}" class="chevron-diagram">`;

    // Create each chevron
    let xPosition = 0;

    for (let i = 0; i < chevronCount; i++) {
      // Get options for this chevron
      const chevronOptions = optionsArray[i] || {};

      // Use provided color or default
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

      // Add HTML content using foreignObject
      // Calculate foreignObject position and size
      const foreignX = xPosition + (i > 0 ? chevronIndent : 0);
      const foreignWidth = chevronWidth - (i > 0 ? chevronIndent : 0) - (i < chevronCount - 1 ? chevronIndent : 0);

      // Get font size for this chevron or use global
      const fontSize = chevronOptions.fontSize || options.fontSize;

      // Add the content
      svg += `
        <foreignObject x="${foreignX}" y="0" width="${foreignWidth}" height="${chevronHeight}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-family:Arial,sans-serif;padding:10px;box-sizing:border-box;text-align:center;overflow:hidden;font-size:${fontSize}px;">
            <div class="chevron-content" style="max-width:100%;max-height:100%;display:inline-block;">
              ${contentArray[i]}
            </div>
          </div>
        </foreignObject>
      `;

      // Move to next position
      xPosition = nextX;
    }

    // Close SVG
    svg += '</svg>';
    return svg;
  }

  /**
   * Parse options from a string of space-separated key=value pairs
   * @param {string} optionsStr - String containing options (e.g., "width=300 height=150")
   * @returns {Object} Object with parsed options
   */
  function parseOptions(optionsStr) {
    if (!optionsStr) return {};

    const options = {};
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
      } else if (key === 'color' && !value.startsWith('#')) {
        // Convert color names to hex if needed
        options[key] = value;
      } else {
        options[key] = value;
      }
    });

    return options;
  }

  /**
   * Register the chevron renderer with marked.js
   */
  function chevronPlugin(options) {
    return {
      name: 'chevron',
      level: 'block',
      start(src) {
        return src.match(/^```chevron/)?.index;
      },
      tokenizer(src, tokens) {
        const match = src.match(/^```chevron(?:\s+(.*?))?\n([\s\S]+?)\n```/);
        if (match) {
          const token = {
            type: 'chevron',
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

        // Parse each line as a chevron step
        const lines = token.text.trim().split('\n');
        const contentArray = [];
        const optionsArray = [];

        lines.forEach(line => {
          // Format: "Step text | options"
          const parts = line.split('|').map(part => part.trim());

          // Default content is the step text
          let content = parts[0];
          let chevronOptions = {};

          // Check for options or HTML content
          if (parts.length > 1) {
            // Check if second part is HTML or options
            if (parts[1].includes('=')) {
              // It's options
              chevronOptions = parseOptions(parts[1]);
            } else if (parts[1].startsWith('#')) {
              // Legacy format: it's a color
              chevronOptions.color = parts[1];
            }

            // Check if there's HTML content
            if (parts.length > 2 && parts[2]) {
              if (parts[2].includes('=')) {
                // It's options
                chevronOptions = { ...chevronOptions, ...parseOptions(parts[2]) };
              } else {
                // It's HTML content
                content = parts[2];
              }
            }
          }

          // Add content to array
          contentArray.push(content);
          optionsArray.push(chevronOptions);
        });

        // Create the chevron SVG
        return createChevronSVG(contentArray, optionsArray, globalOptions);
      }
    };
  }

  // Export the plugin if in a module environment
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = { chevronPlugin };
  } else if (typeof window !== 'undefined' && window.marked) {
    window.marked.use({ extensions: [chevronPlugin()] });
  }
})();
