import { smartartPlugin } from "./smartart-plugin.js";
import { WebContainer } from "@webcontainer/api";

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const inputArea = document.getElementById("input-area");
  const outputArea = document.getElementById("output-area");
  const renderBtn = document.getElementById("render-btn");
  const clearBtn = document.getElementById("clear-btn");
  const webcOutputFrame = document.getElementById('webc-output-frame');

  // Event listeners
  clearBtn.addEventListener("click", () => {
    inputArea.value = "";
    outputArea.innerHTML = "";
    webcOutputFrame.srcdoc = "";
  });

  // Render PPT using WebContainers Marp CLI with custom SmartArt plugins
  if (renderBtn && webcOutputFrame) {
    renderBtn.addEventListener('click', async () => {
      try {
        const markdown = inputArea.value;
        webcOutputFrame.srcdoc = "<p><em>Rendering slides...</em></p>";
        
        // 1. Boot WebContainer and prepare files
        const webcontainerInstance = await WebContainer.boot();
        
        // Write markdown and package.json
        await Promise.all([
          webcontainerInstance.fs.writeFile('/presentation.md', markdown),
          webcontainerInstance.fs.writeFile('/package.json', JSON.stringify({
            name: "marp-smartart",
            type: "module",
            dependencies: { 
              "@marp-team/marp-cli": "^4.1.2",
              "@marp-team/marp-core": "^3.8.0"
            }
          }, null, 2))
        ]);
        
        // 2. Set up plugins
        await webcontainerInstance.fs.mkdir('/plugins');
        
        // Fetch and write all plugin files in parallel
        const pluginFiles = ['utils.js', 'pyramid.js', 'venn.js', 'chevron.js', 'smartart-plugin.js'];
        await Promise.all(
          pluginFiles.map(async file => {
            // When bundled, we need to use the right path
            const isProduction = window.location.pathname.includes('/dist/');
            const basePath = isProduction ? './' : './';
            const content = await fetch(`${basePath}${file}`).then(res => res.text());
            return webcontainerInstance.fs.writeFile(`/plugins/${file}`, content);
          })
        );
        
        // Write the engine file
        await webcontainerInstance.fs.writeFile('/marp-engine.js', `
import { Marp } from '@marp-team/marp-core';
import { smartartPlugin } from './plugins/smartart-plugin.js';

export default ({ marp }) => {
  smartartPlugin(marp);
  return marp;
};`);
        
        // 3. Install dependencies and run Marp CLI
        const installProcess = await webcontainerInstance.spawn('npm', ['install']);
        await installProcess.exit;
        
        const marpProcess = await webcontainerInstance.spawn('npx', [
          'marp', 'presentation.md', '--html', '--engine', './marp-engine.js', '-o', 'output.html'
        ]);
        await marpProcess.exit;
        
        // 4. Display output
        webcOutputFrame.srcdoc = await webcontainerInstance.fs.readFile('/output.html', 'utf8');
      } catch (error) {
        console.error("Error rendering slides:", error);
        webcOutputFrame.srcdoc = `<div style="color:red;padding:20px;">Error: ${error.message}</div>`;
      }
    });
  }
});
