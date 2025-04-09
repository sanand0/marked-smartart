/**
 * Venn diagram renderer
 * Creates SVG Venn diagrams with customizable circles and regions
 */

const {  createError, getDefaultStyles, getDefaultColors, processContentLines } = require('./utils');

/**
 * Creates an SVG Venn diagram with three circles and four intersection regions
 */
function createVennSVG(contentArray, optionsArray, globalOptions = {}) {
  if (!Array.isArray(contentArray) || contentArray.length === 0) {
    return createError('No venn content provided');
  }

  const defaults = { width: 600, height: 400, fontSize: 14 };
  const options = { ...defaults, ...globalOptions };
  
  const { width, height, fontSize } = options;
  const defaultColors = getDefaultColors(true); 
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.22; 
  const overlap = radius * 0.45; 
  
  const centers = [
    { x: centerX - radius + overlap * 0.8, y: centerY - radius * 0.6 },
    { x: centerX + radius - overlap * 0.8, y: centerY - radius * 0.6 },
    { x: centerX, y: centerY + radius * 0.7 }
  ];

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
    class="venn-diagram">`;

  centers.forEach((center, i) => {
    svg += `<circle cx="${center.x}" cy="${center.y}" r="${radius}" 
      fill="${defaultColors[i]}" stroke="#333" stroke-width="1" />`;
  });

  const regions = [
    { id: "AB", x: (centers[0].x + centers[1].x) / 2, y: centers[0].y, width: radius * 0.9, height: radius * 0.7 },
    { id: "BC", x: (centers[1].x + centers[2].x) / 2 + radius * 0.05, y: (centers[1].y + centers[2].y) / 2 + radius * 0.1, width: radius * 0.9, height: radius * 0.7 },
    { id: "AC", x: (centers[0].x + centers[2].x) / 2 - radius * 0.05, y: (centers[0].y + centers[2].y) / 2 + radius * 0.1, width: radius * 0.9, height: radius * 0.7 },
    { id: "ABC", x: centerX, y: centerY, width: radius * 0.8, height: radius * 0.8 }
  ];

  const contentCount = Math.min(contentArray.length, 4);
  
  for (let i = 0; i < contentCount; i++) {
    if (!contentArray[i]?.trim()) continue;
    
    const region = regions[i];
    const regionOptions = optionsArray[i] || {};
    
    const regionFontSize = regionOptions.fontSize ? 
      Math.max(0, Number(regionOptions.fontSize)) || fontSize : 
      fontSize;
    
    const textColor = regionOptions.color ? `color:${regionOptions.color};` : '';
    
    svg += `
      <foreignObject x="${region.x - region.width/2}" y="${region.y - region.height/2}" width="${region.width}" height="${region.height}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
          font-family:Arial,sans-serif;padding:5px;box-sizing:border-box;text-align:center;overflow:hidden;font-size:${regionFontSize}px;">
          <div class="venn-content" style="max-width:100%;max-height:100%;display:inline-block;padding:3px;${textColor}">
            ${contentArray[i]}
          </div>
        </div>
      </foreignObject>`;
  }

  if (contentArray.length > 4) {
    centers.forEach((center, i) => {
      if (i + 4 < contentArray.length && contentArray[i + 4]?.trim()) {
        const labelOptions = optionsArray[i + 4] || {};
        const labelFontSize = labelOptions.fontSize || fontSize;
        const labelColor = labelOptions.color ? `color:${labelOptions.color};` : '';
        
        const labelPositions = [
          { x: center.x - radius * 0.8, y: center.y - radius * 0.8 }, 
          { x: center.x + radius * 0.8, y: center.y - radius * 0.8 }, 
          { x: center.x, y: center.y + radius * 1.2 }                 
        ];
        
        const { x: labelX, y: labelY } = labelPositions[i];
        
        svg += `
          <foreignObject x="${labelX - radius/2}" y="${labelY - radius/4}" width="${radius}" height="${radius/2}">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
              font-family:Arial,sans-serif;padding:3px;box-sizing:border-box;text-align:center;font-size:${labelFontSize}px;">
              <div class="venn-label" style="${labelColor}">${contentArray[i + 4]}</div>
            </div>
          </foreignObject>`;
      }
    });
  }

  return svg + '</svg>';
}

/**
 * Process venn diagram content from code block
 */
function processVennDiagram(content) {
  const lines = content.trim().split('\n');
  const { contentArray, optionsArray, globalOptions } = processContentLines(lines, 'venn');
  
  while (contentArray.length < 4) {
    contentArray.push('');
    optionsArray.push({});
  }
  
  return createVennSVG(contentArray, optionsArray, globalOptions);
}

module.exports = {
  createVennSVG,
  processVennDiagram,
  defaults: { width: 600, height: 400, fontSize: 14 }
};