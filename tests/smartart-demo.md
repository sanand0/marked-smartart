---
marp: true
theme: default
paginate: true
---

# SmartArt Demo Presentation

Testing custom diagram types with unified SmartArt syntax.

---

## Venn Diagram - Basic

```smartart
type: venn

---

A∩B
B∩C
A∩C
A∩B∩C
```

---

## Venn Diagram - With Options

```smartart
type: venn
width: 600
height: 400
fontSize: 18

---

Alpha
Beta
Gamma
Delta { fontSize: 22, color: "#E53935" }
```

---

## Pyramid Diagram - Basic

```smartart
type: pyramid

---

Top Level
Middle Level
Base Level
```

---

## Pyramid Diagram - With Colors

```smartart
type: pyramid
width: 500
height: 300

---

Strategy { color: "#4285F4" }
Tactics { color: "#43A047" }
Operations { color: "#FBBC05" }
```

---

## Chevron Diagram - Basic

```smartart
type: chevron

---

Plan
Build
Test
Deploy
```

---

## Chevron Diagram - With Colors

```smartart
type: chevron
width: 400
height: 100

---

Start { color: "#1E88E5" }
Continue { color: "#43A047" }
Finish { color: "#E53935" }
```

---

# Thank You!

All diagram types are working together in a single presentation.
