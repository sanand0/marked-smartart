import { Marp } from "https://esm.sh/@marp-team/marp-core?bundle";
import browser from "https://esm.sh/@marp-team/marp-core/browser";
import { smartartPlugin } from "./smartart-plugin.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const inputArea = document.getElementById("input-area");
  const outputArea = document.getElementById("output-area");
  const renderBtn = document.getElementById("render-btn");
  const clearBtn = document.getElementById("clear-btn");

  // Add sample content for testing
  inputArea.value = `---
marp: true
theme: default
---

# SmartArt Diagrams in Marp

This presentation demonstrates SmartArt diagrams.

---

# Pyramid Diagram Example

\`\`\`smartart
type: pyramid
width: 500
height: 400
fontSize: 16
---
Strategic Vision {color: #ff5252}
Tactical Planning {color: #4caf50}
Operational Execution {color: #2196f3}
\`\`\``;

  // Create mock environment for standalone smartart rendering
  const mockMarpit = {
    markdown: {
      renderer: {
        rules: {
          fence: (tokens, idx) =>
            `<pre><code>${tokens[idx].content}</code></pre>`,
        },
      },
    },
  };

  // Apply plugin to mock environment
  smartartPlugin(mockMarpit);

  // Event listeners
  renderBtn.addEventListener("click", renderContent);
  clearBtn.addEventListener("click", () => {
    inputArea.value = "";
    outputArea.innerHTML = "";
  });

  // Auto-render on load if content exists
  if (inputArea.value.trim()) renderContent();

  // Render content based on input
  function renderContent() {
    const input = inputArea.value.trim();

    if (!input) {
      outputArea.innerHTML =
        '<p>Enter some Marp markdown content and click "Render"</p>';
      return;
    }

    // Always render as Marp slides
    renderMarpSlides(input);
  }

  // Render Marp slides
  function renderMarpSlides(markdown) {
    try {
      // Show loading indicator
      outputArea.innerHTML =
        '<div class="text-center p-3"><div class="spinner-border" role="status"></div><p>Rendering slides...</p></div>';

      // Ensure markdown has proper Marp frontmatter
      const processedMarkdown = ensureMarpFrontmatter(markdown);

      // Create Marp instance and apply plugin
      const marp = new Marp({
        html: true,
        container: true,
      });

      // Apply our plugin to Marp
      smartartPlugin(marp);

      // Process markdown to handle smartart blocks
      const finalMarkdown = preprocessSmartartBlocks(processedMarkdown);

      // Render markdown to HTML
      const { html, css } = marp.render(finalMarkdown);

      // Create slide container with navigation
      outputArea.innerHTML = `
        <div class="marp-slides">${html}</div>
        <style>${css}</style>
        <div class="marp-navigation">
          <button id="prev-slide" class="btn btn-sm btn-outline-primary">Previous</button>
          <span id="slide-indicator" class="slide-indicator">Slide 1 of 1</span>
          <button id="next-slide" class="btn btn-sm btn-outline-primary">Next</button>
        </div>
      `;

      // Apply browser post-processing for auto-scaling
      browser(outputArea.querySelector(".marp-slides"));

      setupSlideNavigation();
    } catch (error) {
      console.error("Error rendering slides:", error);
      outputArea.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  }

  // Ensure markdown has proper Marp frontmatter
  function ensureMarpFrontmatter(markdown) {
    // Check if markdown already has frontmatter
    if (markdown.startsWith("---") && markdown.includes("marp: true")) {
      return markdown;
    }

    // Add frontmatter if it doesn't exist
    return `---
marp: true
theme: default
---

${markdown}`;
  }

  // Preprocess markdown to handle smartart blocks
  function preprocessSmartartBlocks(markdown) {
    const regex = /```smartart([\s\S]*?)```/g;
    let match;
    let processedMarkdown = markdown;

    while ((match = regex.exec(markdown)) !== null) {
      const content = match[1];
      const token = { info: "smartart", content };
      const renderedDiagram = mockMarpit.markdown.renderer.rules.fence(
        [token],
        0
      );

      processedMarkdown = processedMarkdown.replace(
        match[0],
        `<div class="smartart-diagram">${renderedDiagram}</div>`
      );
    }

    return processedMarkdown;
  }

  // Setup slide navigation
  function setupSlideNavigation() {
    const slides = outputArea.querySelectorAll(".marp-slides > section");

    if (slides.length === 0) {
      console.error("No slides found in the rendered output");
      outputArea.innerHTML +=
        '<div class="alert alert-warning mt-3">No slides were found in the rendered output. Check the console for more details.</div>';
      return;
    }

    const prevBtn = outputArea.querySelector("#prev-slide");
    const nextBtn = outputArea.querySelector("#next-slide");
    const indicator = outputArea.querySelector("#slide-indicator");
    let currentSlide = 0;

    // Show first slide and update controls
    slides[0].classList.add("active");
    updateIndicator();

    // Add event listeners
    prevBtn.addEventListener("click", showPreviousSlide);
    nextBtn.addEventListener("click", showNextSlide);
    document.addEventListener("keydown", handleKeyDown);

    function showPreviousSlide() {
      if (currentSlide > 0) {
        slides[currentSlide].classList.remove("active");
        currentSlide--;
        slides[currentSlide].classList.add("active");
        updateIndicator();
      }
    }

    function showNextSlide() {
      if (currentSlide < slides.length - 1) {
        slides[currentSlide].classList.remove("active");
        currentSlide++;
        slides[currentSlide].classList.add("active");
        updateIndicator();
      }
    }

    function updateIndicator() {
      indicator.textContent = `Slide ${currentSlide + 1} of ${slides.length}`;
      prevBtn.disabled = currentSlide === 0;
      nextBtn.disabled = currentSlide === slides.length - 1;
    }

    function handleKeyDown(event) {
      if (event.key === "ArrowLeft") showPreviousSlide();
      else if (event.key === "ArrowRight") showNextSlide();
    }
  }
});
