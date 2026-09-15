// ============================================================
//  VANSHAWALI — 3D Engine (Three.js r128)
//  Modern Futuristic Family Tree — Mobile First
//  v2.0 — Production Ready
// ============================================================

'use strict';

/* ── CONFIG ──────────────────────────────────────────── */
const CFG = {
  NODE_RADIUS: 1.4,
  NODE_SEG: 28,
  GEN_SPREAD_X: 5.5,
  GEN_Y_STEP: 6.5,
  Z_WAVE: 1.0,
  PARTICLE_COUNT: 600,
  BG_COLOR: 0x020818,
  FOG_NEAR: 35,
  FOG_FAR: 85,
  CAMERA_FOV: 55,
  CAMERA_Z_MOBILE: 34,
  CAMERA_Z_DESKTOP: 26,
  PULSE_SPEED: 0.6,
  ROTATE_SPEED: 0.0025,
  AUTO_ROTATE: true,
  TAP_MAX_MOVE: 12,   // px — max movement to count as tap
  TAP_MAX_MS: 300,    // ms — max duration to count as tap
};

/* ── STATE — initialized lazily after Three.js loads ── */
let S = {};

/* ── ENTRY ───────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Wait for Three.js to be available (it's loaded via CDN in HTML)
  waitForThree(() => {
    initState();
    initThree();
    buildScene();
    setupControls();
    setupUI();
    animate();
    setTimeout(hideLoader, 2600);
  });
});

function waitForThree(cb) {
  if (typeof THREE !== 'undefined') { cb(); return; }
  let tries = 0;
  const t = setInterval(() => {
    tries++;
    if (typeof THREE !== 'undefined') { clearInterval(t); cb(); }
    else if (tries > 50) { clearInterval(t); showError('Three.js failed to load. Please check your connection.'); }
  }, 100);
}

function initState() {
  S = {
    scene: null, camera: null, renderer: null,
    nodes: [],
    edges: [],
    particles: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    selectedId: null,
    clock: new THREE.Clock(),
    autoRotate: CFG.AUTO_ROTATE,
    orbiting: false,
    lastPointer: null,
    tapStart: null,
    touchDist: 0,
    orbitAngleX: 0.18,
    orbitAngleY: 0,
    orbitRadius: window.innerWidth < 640 ? CFG.CAMERA_Z_MOBILE : CFG.CAMERA_Z_DESKTOP,
    orbitTarget: new THREE.Vector3(0, 0, 0),
    minZoom: 12,
    maxZoom: 58,
    autoRotateTimer: null,
    focusAnimating: false,
  };
}

/* ── THREE SETUP ─────────────────────────────────────── */
function initThree() {
  const canvas = document.getElementById('canvas');

  S.renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: window.devicePixelRatio <= 1,
    alpha: false,
    powerPreference: 'high-performance',
  });
  S.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
  S.renderer.setSize(window.innerWidth, window.innerHeight);

  S.scene = new THREE.Scene();
  S.scene.background = new THREE.Color(CFG.BG_COLOR);
  S.scene.fog = new THREE.FogExp2(CFG.BG_COLOR, 0.012);

  S.camera = new THREE.PerspectiveCamera(
    CFG.CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  updateCameraPosition();

  // Lighting
  S.scene.add(new THREE.AmbientLight(0x112244, 1.3));

  const pA = new THREE.PointLight(0x00d4ff, 2.0, 65);
  pA.position.set(0, 10, 10); S.scene.add(pA);

  const pB = new THREE.PointLight(0xbf5af2, 1.5, 65);
  pB.position.set(-12, -6, -10); S.scene.add(pB);

  const pC = new THREE.PointLight(0xffd60a, 0.9, 45);
  pC.position.set(14, 12, -5); S.scene.add(pC);

  window.addEventListener('resize', onResize);
}

function updateCameraPosition() {
  const sinY = Math.sin(S.orbitAngleY);
  const cosY = Math.cos(S.orbitAngleY);
  const sinX = Math.sin(S.orbitAngleX);
  const cosX = Math.cos(S.orbitAngleX);

  S.camera.position.set(
    S.orbitTarget.x + S.orbitRadius * sinY * cosX,
    S.orbitTarget.y + S.orbitRadius * sinX,
    S.orbitTarget.z + S.orbitRadius * cosY * cosX
  );
  S.camera.lookAt(S.orbitTarget);
}

function onResize() {
  S.camera.aspect = window.innerWidth / window.innerHeight;
  S.camera.updateProjectionMatrix();
  S.renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ── SCENE BUILDING ──────────────────────────────────── */
function buildScene() {
  buildStarfield();
  buildGridPlane();
  layoutNodes();
  buildEdges();
}

function buildStarfield() {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(CFG.PARTICLE_COUNT * 3);
  const col = new Float32Array(CFG.PARTICLE_COUNT * 3);
  const palette = [
    new THREE.Color(0x00d4ff),
    new THREE.Color(0xbf5af2),
    new THREE.Color(0xffd60a),
    new THREE.Color(0x30d158),
  ];
  for (let i = 0; i < CFG.PARTICLE_COUNT; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 130;
    pos[i*3+1] = (Math.random() - 0.5) * 90;
    pos[i*3+2] = (Math.random() - 0.5) * 90;
    const c = palette[Math.floor(Math.random() * palette.length)];
    const br = 0.25 + Math.random() * 0.75;
    col[i*3]   = c.r * br;
    col[i*3+1] = c.g * br;
    col[i*3+2] = c.b * br;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  S.particles = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.2, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true,
  }));
  S.scene.add(S.particles);
}

function buildGridPlane() {
  const helper = new THREE.GridHelper(70, 35, 0x001133, 0x001133);
  helper.position.y = -20;
  helper.material.transparent = true;
  helper.material.opacity = 0.35;
  S.scene.add(helper);
}

/* ── NODE LAYOUT ─────────────────────────────────────── */
function computeLayout() {
  const byGen = {};
  FAMILY_DATA.members.forEach(m => {
    (byGen[m.generation] = byGen[m.generation] || []).push(m);
  });

  const positions = {};
  const genKeys = Object.keys(byGen).map(Number).sort((a, b) => a - b);
  const totalGens = genKeys.length;

  genKeys.forEach((gen, gi) => {
    const group = byGen[gen];
    const count = group.length;
    const totalW = (count - 1) * CFG.GEN_SPREAD_X;
    const yPos = (totalGens / 2 - gi) * CFG.GEN_Y_STEP;

    // Pair spouses side by side
    const ordered = orderSpousesPaired(group);
    ordered.forEach((m, idx) => {
      const xPos = -totalW / 2 + idx * CFG.GEN_SPREAD_X;
      const zWave = idx % 2 === 0 ? CFG.Z_WAVE : -CFG.Z_WAVE;
      positions[m.id] = new THREE.Vector3(xPos, yPos, zWave * (0.6 + Math.random() * 0.4));
    });
  });
  return positions;
}

function orderSpousesPaired(group) {
  const placed = new Set();
  const result = [];
  group.forEach(m => {
    if (placed.has(m.id)) return;
    result.push(m);
    placed.add(m.id);
    if (m.spouseId) {
      const sp = group.find(x => x.id === m.spouseId);
      if (sp && !placed.has(sp.id)) {
        result.push(sp);
        placed.add(sp.id);
      }
    }
  });
  return result;
}

function layoutNodes() {
  const positions = computeLayout();

  FAMILY_DATA.members.forEach(member => {
    const pos = positions[member.id];
    if (!pos) return;

    const col = new THREE.Color(member.color);

    /* Outer glow shell */
    const glowMat = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: 0.07, side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(CFG.NODE_RADIUS * 1.65, 16, 16), glowMat
    );
    glowMesh.position.copy(pos);
    S.scene.add(glowMesh);

    /* Core sphere */
    const mat = new THREE.MeshPhongMaterial({
      color: col,
      emissive: col.clone().multiplyScalar(0.22),
      transparent: true, opacity: 0.93,
      shininess: 100,
    });
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(CFG.NODE_RADIUS, CFG.NODE_SEG, CFG.NODE_SEG), mat
    );
    mesh.position.copy(pos);
    mesh.userData.memberId = member.id;
    S.scene.add(mesh);

    /* Orbital ring */
    const ringMat = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: 0.45,
    });
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(CFG.NODE_RADIUS * 1.75, 0.055, 8, 64), ringMat
    );
    ring.position.copy(pos);
    ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.7;
    ring.rotation.z = Math.random() * Math.PI;
    S.scene.add(ring);

    /* Emoji sprite */
    const sprite = makeEmojiSprite(member.emoji, pos);

    /* Name label sprite */
    const label = makeNameSprite(member.name, col, pos);

    /* Root node special effect */
    if (member.isRoot) addRootEffect(pos);

    S.nodes.push({ mesh, ring, glowMesh, glowMat, mat, sprite, label, member, pos3d: pos.clone() });
  });
}

/* ── SPRITES ─────────────────────────────────────────── */
function makeEmojiSprite(emoji, pos) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = '72px serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 64, 64);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  sprite.position.copy(pos);
  sprite.scale.set(1.5, 1.5, 1.5);
  S.scene.add(sprite);
  return sprite;
}

function makeNameSprite(name, color, pos) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 80;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(2,8,24,0.0)';
  ctx.fillRect(0, 0, 512, 80);

  // Glow
  ctx.shadowColor = `#${color.getHexString()}`;
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#e0f4ff';
  ctx.font = 'bold 36px "Noto Sans Devanagari", serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(name, 256, 40);

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.9,
  }));
  sprite.position.set(pos.x, pos.y - CFG.NODE_RADIUS - 0.9, pos.z);
  sprite.scale.set(4.5, 0.7, 1);
  S.scene.add(sprite);
  return sprite;
}

/* ── ROOT EFFECT ─────────────────────────────────────── */
function addRootEffect(pos) {
  // Crown ring
  const crown = new THREE.Mesh(
    new THREE.TorusGeometry(CFG.NODE_RADIUS * 2.5, 0.08, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x30d158, transparent: true, opacity: 0.75 })
  );
  crown.position.copy(pos);
  crown.rotation.x = Math.PI / 2;
  crown.userData.isCrown = true;
  S.scene.add(crown);

  // Orbiting dots
  const DOT_COUNT = 6;
  for (let i = 0; i < DOT_COUNT; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x30d158 })
    );
    dot.userData.orbitRoot  = pos.clone();
    dot.userData.orbitIdx   = i;
    dot.userData.orbitTotal = DOT_COUNT;
    dot.userData.orbitR     = CFG.NODE_RADIUS * 2.3;
    S.scene.add(dot);
  }
}

/* ── EDGES ───────────────────────────────────────────── */
function buildEdges() {
  const posMap = {};
  S.nodes.forEach(n => { posMap[n.member.id] = n.pos3d; });
  const drawn = new Set();

  FAMILY_DATA.members.forEach(m => {
    (m.childIds || []).forEach(cid => {
      const key = [m.id, cid].sort().join('|');
      if (drawn.has(key)) return;
      drawn.add(key);
      const from = posMap[m.id], to = posMap[cid];
      if (from && to) drawCurvedEdge(from, to, m.color, 0.65, false);
    });

    if (m.spouseId) {
      const key = [m.id, m.spouseId].sort().join('|');
      if (!drawn.has(key)) {
        drawn.add(key);
        const from = posMap[m.id], to = posMap[m.spouseId];
        if (from && to) drawCurvedEdge(from, to, 0xff6b9d, 0.4, true);
      }
    }
  });
}

function drawCurvedEdge(from, to, color, opacity, isSpouse) {
  const mid = new THREE.Vector3().lerpVectors(from, to, 0.5);
  mid.z += isSpouse ? 0.6 : 2.8;
  mid.y += isSpouse ? 0 : 1.2;

  const pts = new THREE.QuadraticBezierCurve3(from, mid, to).getPoints(28);
  const mat = new THREE.LineBasicMaterial({
    color, transparent: true, opacity,
  });
  S.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  S.edges.push({ mat, isSpouse, baseOpacity: opacity });
}

/* ── ANIMATION LOOP ──────────────────────────────────── */
function animate() {
  requestAnimationFrame(animate);
  const t = S.clock.getElapsedTime();

  if (S.autoRotate && !S.orbiting && !S.focusAnimating) {
    S.orbitAngleY += CFG.ROTATE_SPEED;
    updateCameraPosition();
  }

  // Starfield slow drift
  if (S.particles) {
    S.particles.rotation.y = t * 0.01;
    S.particles.rotation.x = t * 0.004;
  }

  // Node animations
  S.nodes.forEach((n, i) => {
    const pulse = Math.sin(t * CFG.PULSE_SPEED + i * 0.55) * 0.07 + 0.93;
    const bobY  = n.pos3d.y + Math.sin(t * 0.45 + i * 0.85) * 0.14;

    n.mesh.scale.setScalar(pulse);
    n.glowMesh.scale.setScalar(pulse * 1.12);
    n.mesh.position.y = bobY;
    n.ring.position.y = bobY;
    n.glowMesh.position.y = bobY;
    n.sprite.position.y = bobY;
    n.label.position.y = bobY - CFG.NODE_RADIUS - 0.9;

    n.ring.rotation.y += 0.007 + i * 0.0008;
    n.ring.rotation.z += 0.005 + i * 0.0005;

    if (S.selectedId === n.member.id) {
      n.mat.emissiveIntensity = 0.55 + Math.sin(t * 3.5) * 0.3;
      n.glowMat.opacity = 0.2 + Math.sin(t * 3.5) * 0.07;
    } else {
      n.mat.emissiveIntensity = 0.22;
      n.glowMat.opacity = 0.07;
    }
  });

  // Edge pulse
  S.edges.forEach((e, i) => {
    e.mat.opacity = e.baseOpacity * (0.65 + Math.sin(t * 0.9 + i * 0.5) * 0.35);
  });

  // Orbital dots
  S.scene.children.forEach(obj => {
    if (!obj.userData.orbitRoot) return;
    const { orbitRoot, orbitIdx, orbitTotal, orbitR } = obj.userData;
    const angle = (orbitIdx / orbitTotal) * Math.PI * 2 + t * 1.3;
    obj.position.set(
      orbitRoot.x + Math.cos(angle) * orbitR,
      orbitRoot.y + Math.sin(t * 0.6) * 0.25,
      orbitRoot.z + Math.sin(angle) * orbitR
    );
  });

  S.renderer.render(S.scene, S.camera);
}

/* ── CONTROLS ────────────────────────────────────────── */
function setupControls() {
  const canvas = document.getElementById('canvas');

  /* ── Desktop Mouse ── */
  canvas.addEventListener('mousedown', e => {
    S.orbiting = true;
    S.lastPointer = { x: e.clientX, y: e.clientY };
    S.tapStart = { x: e.clientX, y: e.clientY, time: Date.now() };
    pauseAutoRotate();
  });

  window.addEventListener('mouseup', e => {
    if (!S.orbiting) return;
    const moved = S.tapStart
      ? Math.hypot(e.clientX - S.tapStart.x, e.clientY - S.tapStart.y)
      : 999;
    const elapsed = S.tapStart ? Date.now() - S.tapStart.time : 999;
    if (moved < CFG.TAP_MAX_MOVE && elapsed < CFG.TAP_MAX_MS) {
      handleTap(e.clientX, e.clientY);
    }
    S.orbiting = false;
  });

  window.addEventListener('mousemove', e => {
    if (!S.orbiting || !S.lastPointer) return;
    const dx = e.clientX - S.lastPointer.x;
    const dy = e.clientY - S.lastPointer.y;
    S.orbitAngleY -= dx * 0.005;
    S.orbitAngleX -= dy * 0.005;
    clampOrbitX();
    S.lastPointer = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    S.orbitRadius = clamp(S.orbitRadius + e.deltaY * 0.035, S.minZoom, S.maxZoom);
    updateCameraPosition();
    pauseAutoRotate();
  }, { passive: false });

  /* ── Mobile Touch ── */
  let activeTouches = [];

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    activeTouches = Array.from(e.touches);
    pauseAutoRotate();

    if (activeTouches.length === 1) {
      S.orbiting = true;
      S.lastPointer = { x: activeTouches[0].clientX, y: activeTouches[0].clientY };
      S.tapStart = { x: activeTouches[0].clientX, y: activeTouches[0].clientY, time: Date.now() };
    } else if (activeTouches.length === 2) {
      S.orbiting = false;
      S.touchDist = pinchDist(activeTouches[0], activeTouches[1]);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    activeTouches = Array.from(e.touches);

    if (activeTouches.length === 1 && S.orbiting && S.lastPointer) {
      const dx = activeTouches[0].clientX - S.lastPointer.x;
      const dy = activeTouches[0].clientY - S.lastPointer.y;
      S.orbitAngleY -= dx * 0.006;
      S.orbitAngleX -= dy * 0.006;
      clampOrbitX();
      S.lastPointer = { x: activeTouches[0].clientX, y: activeTouches[0].clientY };
      updateCameraPosition();
    } else if (activeTouches.length === 2) {
      const newDist = pinchDist(activeTouches[0], activeTouches[1]);
      S.orbitRadius = clamp(S.orbitRadius + (S.touchDist - newDist) * 0.055, S.minZoom, S.maxZoom);
      S.touchDist = newDist;
      updateCameraPosition();
    }
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    const ended = Array.from(e.changedTouches);
    activeTouches = Array.from(e.touches);

    if (activeTouches.length === 0 && ended.length === 1 && S.tapStart) {
      const t0 = ended[0];
      const moved = Math.hypot(t0.clientX - S.tapStart.x, t0.clientY - S.tapStart.y);
      const elapsed = Date.now() - S.tapStart.time;
      if (moved < CFG.TAP_MAX_MOVE && elapsed < CFG.TAP_MAX_MS) {
        handleTap(t0.clientX, t0.clientY);
      }
      S.orbiting = false;
      resumeAutoRotate(4500);
    }
  }, { passive: false });
}

function pinchDist(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

function clampOrbitX() {
  S.orbitAngleX = clamp(S.orbitAngleX, -Math.PI / 3, Math.PI / 3);
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function pauseAutoRotate() {
  S.autoRotate = false;
  if (S.autoRotateTimer) clearTimeout(S.autoRotateTimer);
}

function resumeAutoRotate(delay = 4000) {
  if (S.autoRotateTimer) clearTimeout(S.autoRotateTimer);
  S.autoRotateTimer = setTimeout(() => { S.autoRotate = true; }, delay);
}

/* ── TAP / CLICK DETECTION ───────────────────────────── */
function handleTap(clientX, clientY) {
  S.raycaster.setFromCamera(
    new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    ),
    S.camera
  );
  const hits = S.raycaster.intersectObjects(S.nodes.map(n => n.mesh));
  if (hits.length > 0) {
    const memberId = hits[0].object.userData.memberId;
    S.selectedId = memberId;
    openDetailPanel(memberId);
    focusNode(memberId);
    createRipple(clientX, clientY);
  }
}

/* ── CAMERA FOCUS ────────────────────────────────────── */
function focusNode(memberId) {
  const node = S.nodes.find(n => n.member.id === memberId);
  if (!node) return;

  const targetPos  = node.pos3d.clone();
  const startPos   = S.orbitTarget.clone();
  const startR     = S.orbitRadius;
  const endR       = clamp(startR * 0.72, S.minZoom, S.maxZoom);

  let elapsed = 0;
  const dur   = 0.55;
  S.focusAnimating = true;

  const tick = () => {
    elapsed += 0.016;
    const p = Math.min(elapsed / dur, 1);
    const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p; // easeInOut
    S.orbitTarget.lerpVectors(startPos, targetPos, ease);
    S.orbitRadius = startR + (endR - startR) * ease;
    updateCameraPosition();
    if (p < 1) requestAnimationFrame(tick);
    else S.focusAnimating = false;
  };
  requestAnimationFrame(tick);
}

/* ── UI ──────────────────────────────────────────────── */
function setupUI() {
  // Reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    S.orbitAngleX = 0.18;
    S.orbitAngleY = 0;
    S.orbitRadius = window.innerWidth < 640 ? CFG.CAMERA_Z_MOBILE : CFG.CAMERA_Z_DESKTOP;
    S.orbitTarget.set(0, 0, 0);
    S.selectedId = null;
    S.autoRotate = true;
    updateCameraPosition();
    closeDetailPanel();
  });

  // Search toggle
  const searchPanel = document.getElementById('search-panel');
  document.getElementById('btn-search').addEventListener('click', () => {
    const hidden = searchPanel.classList.toggle('hidden');
    if (!hidden) {
      renderSearchResults('');
      setTimeout(() => document.getElementById('search-input').focus(), 50);
    }
  });

  document.getElementById('search-input').addEventListener('input', e => {
    renderSearchResults(e.target.value);
  });

  // Info modal
  document.getElementById('btn-info').addEventListener('click', () => {
    document.getElementById('info-modal').classList.remove('hidden');
  });
  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('info-modal').classList.add('hidden');
  });
  document.getElementById('modal-overlay').addEventListener('click', () => {
    document.getElementById('info-modal').classList.add('hidden');
  });

  // Detail panel close
  document.getElementById('dp-close').addEventListener('click', closeDetailPanel);
  document.getElementById('dp-overlay').addEventListener('click', closeDetailPanel);
}

function renderSearchResults(query) {
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  const q = query.trim().toLowerCase();
  const results = q === ''
    ? FAMILY_DATA.members
    : FAMILY_DATA.members.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.relation || '').toLowerCase().includes(q) ||
        (m.place || '').toLowerCase().includes(q)
      );

  results.forEach(m => {
    const chip = document.createElement('div');
    chip.className = 'search-chip';
    chip.textContent = `${m.emoji} ${m.name}`;
    chip.addEventListener('click', () => {
      S.selectedId = m.id;
      openDetailPanel(m.id);
      focusNode(m.id);
      document.getElementById('search-panel').classList.add('hidden');
    });
    container.appendChild(chip);
  });

  if (results.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:rgba(224,244,255,0.4);font-size:0.8rem;padding:4px 2px;font-family:var(--font-hindi,sans-serif)';
    empty.textContent = 'कोई परिणाम नहीं मिला';
    container.appendChild(empty);
  }
}

/* ── DETAIL PANEL ────────────────────────────────────── */
function openDetailPanel(memberId) {
  const member = FAMILY_DATA.byId[memberId];
  if (!member) return;

  const col = `#${new THREE.Color(member.color).getHexString()}`;
  const colA = hexToRgba(member.color, 0.28);
  const colB = hexToRgba(member.color, 0.05);
  const colBorder = hexToRgba(member.color, 0.55);

  // Avatar
  const avatar = document.getElementById('dp-avatar');
  document.getElementById('dp-avatar-emoji').textContent = member.emoji;
  avatar.style.background = `radial-gradient(circle at 38% 32%, ${colA}, ${colB})`;
  avatar.style.border = `2px solid ${colBorder}`;

  document.getElementById('dp-name').textContent = member.name;
  document.getElementById('dp-relation').textContent = member.relation;
  document.getElementById('dp-birth').textContent = member.birth || '—';
  document.getElementById('dp-place').textContent = member.place || '—';

  const deathRow = document.getElementById('dp-death-row');
  if (member.death) {
    deathRow.style.display = '';
    document.getElementById('dp-death').textContent = member.death;
  } else {
    deathRow.style.display = 'none';
  }

  document.getElementById('dp-bio').textContent = member.bio || '';

  // Connections
  const conList = document.getElementById('dp-con-list');
  conList.innerHTML = '';

  const addConn = (id, label) => {
    const m = FAMILY_DATA.byId[id];
    if (!m) return;
    const chip = document.createElement('div');
    chip.className = 'con-chip';
    chip.innerHTML = `
      <span class="con-chip-emoji">${m.emoji}</span>
      <div class="con-chip-info">
        <span class="con-chip-name">${m.name}</span>
        <span class="con-chip-rel">${label}</span>
      </div>`;
    chip.addEventListener('click', () => {
      S.selectedId = m.id;
      openDetailPanel(m.id);
      focusNode(m.id);
    });
    conList.appendChild(chip);
  };

  if (member.spouseId) addConn(member.spouseId, 'जीवनसाथी');
  (member.parentIds || []).forEach(id => addConn(id, 'माता / पिता'));
  (member.childIds || []).forEach(id => addConn(id, 'संतान'));

  const panel = document.getElementById('detail-panel');
  panel.classList.remove('hidden');
  resumeAutoRotate(8000); // resume after 8s if panel stays open
}

function closeDetailPanel() {
  document.getElementById('detail-panel').classList.add('hidden');
  S.selectedId = null;
  resumeAutoRotate(2500);
}

/* ── HELPERS ─────────────────────────────────────────── */
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');
}

function showError(msg) {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;
      background:#020818;color:#e0f4ff;font-family:sans-serif;text-align:center;padding:20px;">
      <div>
        <div style="font-size:3rem;margin-bottom:16px">⚠️</div>
        <h2 style="color:#00d4ff;margin-bottom:8px">कुछ गड़बड़ हो गई</h2>
        <p style="color:rgba(224,244,255,0.6)">${msg}</p>
        <button onclick="location.reload()" style="margin-top:20px;padding:10px 24px;
          background:rgba(0,212,255,0.15);border:1px solid rgba(0,212,255,0.4);
          border-radius:8px;color:#00d4ff;cursor:pointer;font-size:1rem">
          पुनः लोड करें
        </button>
      </div>
    </div>`;
}

function createRipple(x, y) {
  const el = document.createElement('div');
  el.className = 'ripple';
  const size = 90;
  el.style.cssText = `width:${size}px;height:${size}px;left:${x - size/2}px;top:${y - size/2}px;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

function hexToRgba(hex, a) {
  return `rgba(${(hex>>16)&255},${(hex>>8)&255},${hex&255},${a})`;
}
