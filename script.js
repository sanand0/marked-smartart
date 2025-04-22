import { Marp } from "https://esm.sh/@marp-team/marp-core";
import { smartartPlugin } from './smartart-plugin.js';

document.getElementById('render-btn').addEventListener('click', async () => {
  const markdown = document.getElementById('input-area').value;
  const marp = new Marp();
  smartartPlugin(marp);

  const { html, css } = marp.render(markdown);
  document.getElementById('webc-output-frame').srcdoc = `<style>${css}</style>${html}`;
});

document.getElementById('clear-btn').addEventListener('click', async () => {
  document.getElementById('input-area').value = "";
  document.getElementById('webc-output-frame').srcdoc = "";
});