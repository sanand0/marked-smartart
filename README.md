# Marp SmartArts

A collection of custom diagram plugins for Marp presentations, including Pyramid, Chevron, and Venn diagrams. These plugins integrate seamlessly with Marp and can coexist with standard Mermaid diagrams to create beautiful, interactive diagrams in your presentations.

## Project Structure

The project is organized into modular components:

- `smartart-plugin.js`: Custom Marp engine that uses the unified plugin
  - `pyramid.js`: Renders pyramid diagrams
  - `chevron.js`: Renders chevron diagrams
  - `venn.js`: Renders venn diagrams
  - `utils.js`: Shared utility functions for all diagram types

## Usage with Marp CLI

```bash
npx @marp-team/marp-cli --engine ./smartart-plugin.js your-presentation.md --output your-presentation.html
```

## Diagram Types

### Pyramid Diagrams

Create hierarchical structures with pyramid diagrams:

````markdown
```smartart
type: pyramid
width: 600
height: 400

---

Leadership { color: '#1E88E5' }
Management { color: '#43A047', fontSize: 18 }
Team Leads { color: '#FDD835' }
Developers { color: '#E53935', fontSize: 14 }
Support { color: '#757575' }
```
````

### Chevron Diagrams

Create process flows and sequential steps with chevron diagrams:

````markdown
```smartart
type: chevron
width: 250
height: 120
fontSize: 16

---

Analysis { color: '#1E88E5' }
Design { color: '#43A047' }
Implementation { color: '#FDD835' }
Evaluation { color: '#E53935' }
```
````

### Venn Diagrams

Create relationship and intersection diagrams with Venn diagrams:

````markdown
```smartart
type: venn
width: 650
height: 450
fontSize: 18

---

Technology { color: '#1976D2' }
Business { color: '#388E3C' }
User Experience { color: '#F57C00' }
Product Success { fontSize: 22, color: '#D32F2F' }
```
````

## Syntax Reference

### Options

Each diagram can be configured with global options specified after the type declaration:

- **width**: Diagram width in pixels (default varies by type)
- **height**: Diagram height in pixels (default varies by type)
- **fontSize**: Base font size for text (default varies by type)

Example:

```smartart
type: pyramid
width: 500
height: 300
fontSize: 16

---

Content here...
```

### Content Format

Content is defined after a `---` separator. Each line follows this pattern:

```
Label { option1: 'value1', option2: 'value2' }
```

Available options:

- **color**: Color code (e.g., '#4285F4')
- **fontSize**: Custom font size for this item

### Color Handling

Colors are handled differently per diagram type:

- **Pyramid/Chevron**: Colors set the background
- **Venn**: Colors apply to the text

## Multiple Diagrams on One Slide

Multiple diagrams can be placed on a single slide:

````markdown
```smartart
type: pyramid
width: 400
height: 200

---

Strategy { color: '#4285F4' }
Tactics { color: '#34A853' }
Operations { color: '#FBBC05' }
```

```smartart
type: chevron
width: 180
height: 100

---

Plan { color: '#1E88E5' }
Build { color: '#43A047' }
Test { color: '#FDD835' }
Deploy { color: '#E53935' }
```
````

## Browser Compatibility

These plugins work in all modern browsers that support SVG and foreignObject elements.

## License

MIT
