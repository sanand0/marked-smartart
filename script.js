import { smartartPlugin } from './smartart-plugin.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements and setup
  const inputArea = document.getElementById('input-area');
  const outputArea = document.getElementById('output-area');
  const renderBtn = document.getElementById('render-btn');
  const clearBtn = document.getElementById('clear-btn');
  
  // Create mock environment and apply plugin
  const mockMarpit = {
    markdown: {
      renderer: {
        rules: {
          fence: (tokens, idx) => `<pre><code>${tokens[idx].content}</code></pre>`
        }
      }
    }
  };
  
  smartartPlugin(mockMarpit);
  
  // Event listeners
  renderBtn.addEventListener('click', renderDiagram);
  clearBtn.addEventListener('click', () => {
    inputArea.value = '';
    outputArea.innerHTML = '';
  });
  
  // Auto-render on load if content exists
  if (inputArea.value.trim()) renderDiagram();
  
  // Render diagram from input
  function renderDiagram() {
    const input = inputArea.value.trim();
    
    if (!input) {
      outputArea.innerHTML = '<p>Enter some diagram syntax and click "Render"</p>';
      return;
    }
    
    // Extract code block content
    const match = input.match(/```(\w+)([^`]+)```/);
    
    if (!match || match[1].trim() !== 'smartart') {
      outputArea.innerHTML = '<p>Please use the smartart code block type:<br>```smartart<br>type: diagram-type<br>...<br>```</p>';
      return;
    }
    
    // Process and render the diagram
    const token = { info: 'smartart', content: match[2].trim() };
    outputArea.innerHTML = mockMarpit.markdown.renderer.rules.fence([token], 0);
  }
});
