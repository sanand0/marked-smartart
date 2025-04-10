---
marp: true
theme: default
paginate: true
---

# SmartArt Diagram Integration Test

Testing custom diagram types with unified SmartArt integration

---

## Pyramid Diagram - Basic

```smartart
type: pyramid

---

Strategic
Tactical
Operational
```

---

## Pyramid Diagram - With Options

```smartart
type: pyramid
width: 500
height: 300
fontSize: 16

---

Vision { color: '#4285F4' }
Mission { color: '#34A853' }
Goals { color: '#FBBC05' }
Objectives { color: '#EA4335' }
Tasks { color: '#5F6368' }
```

---

## Pyramid Diagram - With Custom Layer Options

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

---

## Chevron Diagram - Basic

```smartart
type: chevron

---

Planning
Development
Testing
Deployment
```

---

## Chevron Diagram - With Options

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
width: 700
height: 500
fontSize: 20

---

Marketing
Sales
Product
Core Business { fontSize: 24 }
```

---

## Venn Diagram - Business Context

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

---

## Multiple Diagrams on One Slide

### Pyramid and Chevron Comparison

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

Plan { color: '#4285F4' }
Do { color: '#34A853' }
Check { color: '#FBBC05' }
Act { color: '#EA4335' }
```

---

## Testing Text Color in Venn vs Background Color in Others

### Venn (Text Color)

```smartart
type: venn
width: 500
height: 300

---

Frontend { color: '#D32F2F' }
Backend { color: '#1976D2' }
Database { color: '#388E3C' }
Full Stack { color: '#F57C00' }
```

### Pyramid (Background Color)

```smartart
type: pyramid
width: 400
height: 200

---

Executive { color: '#4285F4' }
Management { color: '#34A853' }
Staff { color: '#FBBC05' }
```

---

## Complex Mixed Diagram Test

### All Three Custom Diagrams

```smartart
type: pyramid
width: 300
height: 200

---

Strategy { color: '#4285F4' }
Execution { color: '#34A853' }
```

```smartart
type: chevron
width: 400
height: 80

---

Plan { color: '#1E88E5' }
Build { color: '#43A047' }
Test { color: '#FDD835' }
Deploy { color: '#E53935' }
```

```smartart
type: venn
width: 300
height: 800

---

UX { color: '#D32F2F' }
Tech { color: '#1976D2' }
Business { color: '#388E3C' }
Product { color: '#F57C00' }
```

---

# Thank You!

All diagram types are working together in a single presentation.
