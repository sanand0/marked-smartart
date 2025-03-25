/**
 * Pyramid Diagram Plugin for Marked.js
 * Allows creating SVG pyramid diagrams using a simple syntax in markdown code blocks
 *
 * Usage:
 * ```pyramid width=400 height=300
 * Top layer: Planning | #4285F4
 * Second layer: Development | #34A853 | <strong>Dev</strong><br>Phase
 * Third layer: Testing | #FBBC05
 * Bottom layer: Deployment | #EA4335
 * ```
 */

(function() {
  function createPyramidSVG(contentArray, optionsArray, globalOptions = {}) {
    if (!Array.isArray(contentArray) || contentArray.length === 0) {
      return '<div class="pyramid-error">Error: No pyramid content provided</div>';
    }

    const defaults = {
      width: 400,
      height: 200,
      fontSize: 14
    };

    const options = { ...defaults, ...globalOptions };
    const layerCount = contentArray.length;
    const layerHeight = options.height / layerCount;

    // Default colors if none provided
    const defaultColors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5F6368'];

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      width="${options.width}" height="${options.height}" viewBox="0 0 ${options.width} ${options.height}"
      class="pyramid-diagram">`;

    // Create each layer
    for (let i = 0; i < layerCount; i++) {
      const layerOptions = optionsArray[i] || {};
      const color = layerOptions.color || defaultColors[i % defaultColors.length];
      const y = i * layerHeight;

      // Calculate widths for current and next layer
      const widthPercent = i / layerCount;
      const layerWidth = options.width * widthPercent;
      const xOffset = (options.width - layerWidth) / 2;

      let path;

      if (i === 0) {
        // Top layer - triangle
        const nextWidth = options.width * (1 / (layerCount));
        const nextXOffset = (options.width - nextWidth) / 2;
        path = `
          M ${options.width / 2},${y}
          L ${nextXOffset + nextWidth},${y + layerHeight}
          L ${nextXOffset},${y + layerHeight}
          Z
        `;
      } else {
        // Middle layers - regular trapeziums
        const nextWidth = options.width * ((i + 1) / (layerCount));
        const nextXOffset = (options.width - nextWidth) / 2;
        path = `
          M ${xOffset},${y}
          L ${xOffset + layerWidth},${y}
          L ${nextXOffset + nextWidth},${y + layerHeight}
          L ${nextXOffset},${y + layerHeight}
          Z
        `;
      }

      svg += `<path d="${path}" fill="${color}" stroke="#333" stroke-width="1" />`;

      // Adjust foreignObject position and width for content
      let contentWidth = i === 0 ? options.width * 0.3 : layerWidth; // Smaller width for top triangle
      let contentXOffset = i === 0 ? (options.width - contentWidth) / 2 : xOffset;

      svg += `
        <foreignObject x="${contentXOffset}" y="${y}" width="${contentWidth}" height="${layerHeight}">
          <div xmlns="http://www.w3.org/1999/xhtml"
            style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
            color:white;font-family:Arial,sans-serif;padding:10px;box-sizing:border-box;
            text-align:center;font-size:${layerOptions.fontSize || options.fontSize}px;">
            <div class="pyramid-content">${contentArray[i]}</div>
          </div>
        </foreignObject>
      `;
    }

    svg += '</svg>';
    return svg;
  }

  function parseOptions(optionsStr) {
    if (!optionsStr) return {};
    const options = {};
    const optionPairs = optionsStr.match(/(\w+)=([^\s]+)/g) || [];

    optionPairs.forEach(pair => {
      const [key, value] = pair.split('=');
      options[key] = /^\d+$/.test(value) ? parseInt(value, 10) : value;
    });

    return options;
  }

  function pyramidPlugin() {
    return {
      name: 'pyramid',
      level: 'block',
      start(src) { return src.match(/^```pyramid/)?.index; },
      tokenizer(src, tokens) {
        const match = src.match(/^```pyramid(?:\s+(.*?))?\n([\s\S]+?)\n```/);
        if (match) {
          return {
            type: 'pyramid',
            raw: match[0],
            options: match[1] || '',
            text: match[2],
            tokens: []
          };
        }
      },
      renderer(token) {
        const globalOptions = parseOptions(token.options);
        const lines = token.text.trim().split('\n');
        const contentArray = [];
        const optionsArray = [];

        lines.forEach(line => {
          const parts = line.split('|').map(part => part.trim());
          let content = parts[0];
          let layerOptions = {};

          if (parts[1]) {
            if (parts[1].includes('=')) {
              layerOptions = parseOptions(parts[1]);
            } else if (parts[1].startsWith('#')) {
              layerOptions.color = parts[1];
            }
          }

          if (parts[2]) {
            content = parts[2];
          }

          contentArray.push(content);
          optionsArray.push(layerOptions);
        });

        return createPyramidSVG(contentArray, optionsArray, globalOptions);
      }
    };
  }

  // Export the plugin
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = { pyramidPlugin };
  } else if (typeof window !== 'undefined' && window.marked) {
    window.marked.use({ extensions: [pyramidPlugin()] });
  }
})();
