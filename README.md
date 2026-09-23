# Vansh Vruksh 3D — Digital Family Universe

Standalone interactive 3D family universe. This repository is separate from Matang Connect.

Features:
- Three.js WebGL with GLTFLoader, OrbitControls and CSS3D labels
- Actual GLB human character models, not CSS/HTML people
- Male/female character variants, age scaling, hair variants and PBR-style scene lighting
- Multi-generation data-driven family graph
- 3D relationship tubes with distinct parent, spouse, sibling, adoption and step semantics
- Search, focus, orbit/pan/zoom, fullscreen and generation filters
- Add/edit/delete people and relationships
- LocalStorage persistence and JSON import/export
- Mobile-first responsive UI

Character assets:
Quaternius Universal Base Characters, CC0 1.0 Universal.
The project uses public GLB files from an open GitHub asset mirror whose manifest identifies the Quaternius source and CC0 license.
Source: https://quaternius.com/packs/universalbasecharacters.html
License: https://creativecommons.org/publicdomain/zero/1.0/

The current static implementation is Vercel-ready and intentionally has no dependency on Matang Connect.