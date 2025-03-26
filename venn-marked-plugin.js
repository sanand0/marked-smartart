/**
 * Venn Diagram Plugin for Marked.js
 * Usage:
 * ```venn width=600 height=400
 * A∩B 
 * B∩C
 * A∩C
 * A∩B∩C
 * ```
 */

(function() {
  function createVennSVG(contentArray, optionsArray, globalOptions = {}) {
    if (!Array.isArray(contentArray) || contentArray.length === 0) 
      return '<div class="venn-error">Error: No content provided for Venn diagram</div>';

    // Set default values if not provided
    const defaults = { width: 600, height: 400, fontSize: 14 };
    const options = { ...defaults, ...globalOptions };
    
    // Ensure width, height, and fontSize have valid values
    const width = options.width || defaults.width;
    const height = options.height || defaults.height;
    const fontSize = options.fontSize || defaults.fontSize;
    
    const defaultColors = ['rgba(66, 133, 244, 0.5)', 'rgba(52, 168, 83, 0.5)', 'rgba(251, 188, 5, 0.5)'];
    const radius = Math.min(width, height) / 4;
    const overlap = radius * 0.4;

    const centers = [
      { x: width / 2 - radius + overlap, y: height / 2 - radius + overlap },
      { x: width / 2 + radius - overlap, y: height / 2 - radius + overlap },
      { x: width / 2, y: height / 2 + radius - overlap }
    ];

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="venn-diagram">`;

    // Draw the three circles
    for (let i = 0; i < 3; i++) {
      svg += `<circle cx="${centers[i].x}" cy="${centers[i].y}" r="${radius}" fill="${defaultColors[i]}" stroke="#333" stroke-width="1" />`;
    }

    // Calculate intersection regions with better positioning
    const regions = [
      { id: "AB", x: (centers[0].x + centers[1].x)/2, y: (centers[0].y + centers[1].y)/2 - overlap/2, width: radius*0.8, height: radius*0.8 },
      { id: "BC", x: (centers[1].x + centers[2].x)/2, y: (centers[1].y + centers[2].y)/2, width: radius*0.8, height: radius*0.8 },
      { id: "AC", x: (centers[0].x + centers[2].x)/2, y: (centers[0].y + centers[2].y)/2, width: radius*0.8, height: radius*0.8 },
      { id: "ABC", x: (centers[0].x + centers[1].x + centers[2].x)/3, y: (centers[0].y + centers[1].y + centers[2].y)/3, width: radius*0.7, height: radius*0.7 }
    ];

    // Add content to regions
    for (let i = 0; i < Math.min(contentArray.length, regions.length); i++) {
      if (contentArray[i]?.trim()) {
        const region = regions[i];
        const regionOptions = optionsArray[i] || {};
        const regionFontSize = regionOptions.fontSize || fontSize;
        const textColor = regionOptions.color ? `color:${regionOptions.color};` : '';
        
        // The foreignObject element allows HTML content to be rendered within SVG
        svg += `<foreignObject x="${region.x - region.width/2}" y="${region.y - region.height/2}" width="${region.width}" height="${region.height}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;padding:5px;box-sizing:border-box;text-align:center;overflow:hidden;font-size:${regionFontSize}px;">
            <div class="venn-content" style="max-width:100%;max-height:100%;display:inline-block;padding:3px;${textColor}">${contentArray[i]}</div>
          </div>
        </foreignObject>`;
      }
    }

    return svg + '</svg>';
  }

  function parseOptions(optionsStr) {
    if (!optionsStr) return {};
    
    if (/^\d+\s+\d+$/.test(optionsStr)) {
      const [width, height] = optionsStr.split(/\s+/).map(Number);
      return { width, height };
    }

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

  function vennPlugin() {
    return {
      name: 'venn',
      level: 'block',
      start(src) { return src.match(/^```venn/)?.index; },
      tokenizer(src) {
        const match = src.match(/^```venn(?:\s+(.*?))?\n([\s\S]+?)\n```/);
        return match ? {
          type: 'venn',
          raw: match[0],
          options: match[1] || '',
          text: match[2],
          tokens: []
        } : undefined;
      },
      renderer(token) {
        const globalOptions = parseOptions(token.options);
        const lines = token.text.trim().split('\n');
        const contentArray = [];
        const optionsArray = [];

        // Process each line - simplified approach similar to pyramid-marked-plugin.js
        lines.forEach(line => {
          const parts = line.split('|').map(part => part.trim());
          let content = parts[0];
          let regionOptions = {};
          
          // Process options in the second part (if exists)
          if (parts[1]) {
            if (parts[1].includes('=')) {
              // This is a key=value option
              regionOptions = { ...regionOptions, ...parseOptions(parts[1]) };
            } else if (parts[1].startsWith('#')) {
              // This is a color option
              regionOptions.color = parts[1];
            }
          }
          
          // If there's a third part, use it as the content (allows HTML)
          if (parts[2]) {
            content = parts[2];
          }
          
          contentArray.push(content);
          optionsArray.push(regionOptions);
        });
        
        return createVennSVG(contentArray, optionsArray, globalOptions);
      }
    };
  }

  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = { vennPlugin };
  } else if (typeof window !== 'undefined' && window.marked) {
    window.marked.use({ extensions: [vennPlugin()] });
  }
})();