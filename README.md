# Chevron Process Diagram Plugin for Marked.js

A Marked.js plugin that allows you to create SVG chevron process diagrams directly in your Markdown using code blocks. This plugin makes it easy to create professional-looking process flows, workflows, and step diagrams.

## Installation

### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="chevron-marked-plugin.js"></script>
<script>
  // Register the plugin
  marked.use({ extensions: [chevronPlugin()] });
</script>
```

### Node.js

```bash
npm install marked
```

```javascript
const marked = require('marked');
const { chevronPlugin } = require('./chevron-marked-plugin.js');

// Register the plugin
marked.use({ extensions: [chevronPlugin()] });
```

## Usage

Create chevron diagrams using code blocks with the `chevron` language identifier:

````markdown
```chevron
Step 1
Step 2
Step 3
```
````

### Optional Parameters

You can specify width and height for each chevron:

````markdown
```chevron 200 100
Step 1
Step 2
Step 3
```
````

Where:
- `200` is the width of each chevron in pixels
- `100` is the height of each chevron in pixels

### Custom Colors

Specify custom colors for each chevron by adding a pipe (`|`) followed by a color code:

````markdown
```chevron
Planning | #4285F4
Development | #34A853
Testing | #FBBC05
Deployment | #EA4335
```
````

### Custom HTML Content

Add custom HTML content to each chevron by adding a second pipe (`|`) followed by HTML:

````markdown
```chevron
Planning | #4285F4 | <strong>Planning</strong><br>Phase 1
Development | #34A853 | <strong>Development</strong><br>Phase 2
Testing | #FBBC05 | <strong>Testing</strong><br>Phase 3
```
````

## Syntax Reference

The general syntax for each chevron line is:

```
Step text | #color-code | <optional HTML content>
```

- **Step text**: Plain text to display in the chevron (used if no HTML is provided)
- **Color code**: Hex color code starting with # (optional)
- **HTML content**: Custom HTML to display in the chevron (optional)

## Examples

### Basic Process Flow

````markdown
```chevron
Planning
Development
Testing
Deployment
```
````

### Agile Process

````markdown
```chevron 150 80
Backlog
Sprint Planning
Daily Scrum
Sprint Review
Retrospective
```
````

### Sales Process with Icons

````markdown
```chevron 120 120
Prospecting | #4285F4 | <div><span style='font-size:1.5em;'>🔍</span><br>Prospecting</div>
Connecting | #34A853 | <div><span style='font-size:1.5em;'>🤝</span><br>Connecting</div>
Qualifying | #FBBC05 | <div><span style='font-size:1.5em;'>💬</span><br>Qualifying</div>
Presenting | #EA4335 | <div><span style='font-size:1.5em;'>📊</span><br>Presenting</div>
Closing | #5F6368 | <div><span style='font-size:1.5em;'>✅</span><br>Closing</div>
```
````

## Auto-sizing Text

The plugin automatically resizes text to fit within the chevron. This ensures that your diagrams look good regardless of the content length or chevron size.

## Browser Compatibility

This plugin should work in all modern browsers that support SVG and foreignObject. For IE11 support, you may need additional polyfills.

## License

MIT
