# LIBASS — Crafting Your Elegance 🧵✨

A premium, luxurious 3D website for **LIBASS** — a ladies' fashion stitching and boutique shop. Built with immersive WebGL animations, AR virtual try-on, and a bespoke booking system.

![LIBASS](assets/images/hero.jpg)

## ✨ Features

- **3D Flowing Silk Background** — Three.js WebGL shader-based animation reacting to mouse movements
- **Virtual Try-On Studio** — Camera/photo upload with real-time garment overlay, fabric selection, and customization
- **Interactive Booking System** — Visual calendar with date/time selection and form validation
- **3D Gallery Carousel** — Drag/swipe lookbook with auto-rotation
- **Premium Glassmorphism UI** — Frosted glass panels with copper/rose gold accents
- **Fully Responsive** — Optimized for all screen sizes

## 🎨 Design

| Element | Color |
|---|---|
| Background | Deep Mahogany `#1a0a0a` |
| Accents | Metallic Copper `#b87333` / Rose Gold `#c19a6b` |
| Panels | Warm Beige/Cream `#f5efe6` |
| Text/Buttons | Charcoal/Velvet Black `#1c1c1c` |

**Typography:** Playfair Display (headings) + Inter (body) + Cormorant Garamond (accents)

## 🚀 Getting Started

Simply open `index.html` in your browser:

```bash
# Clone the repository
git clone https://github.com/ayanfaruqui/LIBASS.git
cd LIBASS

# Open in browser
start index.html    # Windows
open index.html     # macOS
```

Or serve locally:
```bash
npx serve .
```

## 📁 Project Structure

```
LIBASS/
├── index.html              # Main HTML
├── css/
│   └── style.css           # Premium stylesheet
├── js/
│   ├── three-scene.js      # Three.js 3D silk background
│   ├── main.js             # Navigation, scroll effects, preloader
│   ├── virtual-tryon.js    # AR Virtual Try-On module
│   ├── booking.js          # Calendar & booking system
│   └── gallery.js          # 3D carousel lookbook
└── assets/
    └── images/             # Fashion photography assets
```

## 🛠️ Tech Stack

- **HTML5 / CSS3 / Vanilla JS**
- **Three.js** — WebGL 3D rendering
- **GLSL Shaders** — Custom vertex/fragment shaders
- **Web APIs** — getUserMedia (camera), Canvas 2D

## 📄 License

© 2024 LIBASS Boutique. All rights reserved.
