# 🌌 वंशावली — 3D Family Tree

A stunning **futuristic 3D interactive Family Tree** web app — mobile-first, built with Three.js.

## ✨ Features

- 🌌 **3D Starfield** — 600 glowing particles in deep space
- 🔵 **Animated Nodes** — Each family member is a glowing 3D sphere with emoji + name label + orbital ring
- 💫 **Auto-rotate** — The constellation slowly rotates on its own
- 👆 **Tap/Click** — Open a beautiful slide-up card with full member details
- ✌️ **Pinch to Zoom** — Mobile pinch gesture support
- 👋 **Drag to Orbit** — Touch drag or mouse drag to rotate the view
- 🔍 **Search** — Find any family member by name
- 🔗 **Connected Navigation** — Tap relations in detail card to jump to them
- 🧬 **DNA Loader** — Beautiful animated loading screen
- 📱 **Mobile-First** — Designed for phones first, looks great on desktop too

## 🚀 Tech Stack

- **Three.js r128** — 3D rendering
- **Vanilla JS** — No frameworks, fast and lightweight
- **CSS Custom Properties** — Futuristic dark theme with glow effects
- **Google Fonts** — Orbitron + Rajdhani + Noto Sans Devanagari

## 📁 Structure

```
vanshawali/
├── index.html    # Main HTML + UI structure
├── style.css     # Futuristic mobile-first styles
├── app.js        # Three.js 3D engine + controls + UI logic
├── data.js       # Family data (edit this to customize!)
└── vercel.json   # Deployment config
```

## 🛠️ Customization

Edit **`data.js`** to add your own family members:

```js
{
  id: "unique_id",
  name: "नाम",
  gender: "male" | "female",
  relation: "संबंध",
  generation: 0, // 0=great-grandparents, 1=grandparents, etc.
  birth: "1950",
  death: null,   // null if alive
  place: "शहर",
  emoji: "👴",
  bio: "विवरण...",
  spouseId: "spouse_id" | null,
  parentIds: ["parent1_id"],
  childIds: ["child1_id"],
  color: 0x00d4ff, // hex color
}
```

## 🌐 Live Demo

Deployed on Vercel — see the live link above.
