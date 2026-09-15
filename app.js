// ============================================================
//  VANSHAWALI v2 — 3D Engine
//  Hyper-Realistic | Tube Edges | Edit Mode | i18n
// ============================================================
'use strict';

const CFG = {
  NODE_R: 1.35,
  NODE_SEG: 32,
  GEN_X: 5.8,
  GEN_Y: 7.0,
  Z_WAVE: 1.1,
  PARTICLES: 700,
  BG: 0x020818,
  CAM_MOBILE: 36,
  CAM_DESKTOP: 28,
  ROTATE_SPEED: 0.0022,
  PULSE: 0.55,
  TAP_PX: 14,
  TAP_MS: 280,
};

let S = {};  // initialized after Three.js loads

/* ── BOOT ─────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  waitForThree(() => {
    initState();
    initThree();
    buildScene();
    setupControls();
    setupUI();
    applyI18n();
    updateStats();
    animate();
    setTimeout(hideLoader, 2800);
  });
});

function waitForThree(cb) {
  if (typeof THREE !== 'undefined') { cb(); return; }
  let n = 0;
  const iv = setInterval(() => {
    if (typeof THREE !== 'undefined') { clearInterval(iv); cb(); }
    else if (++n > 60) { clearInterval(iv); showFatalError('Three.js load failed. Check internet connection.'); }
  }, 100);
}

function initState() {
  S = {
    scene: null, camera: null, renderer: null,
    nodes: [],        // { mesh, glow, ring, sprite, label, member, basePos }
    tubeEdges: [],    // Three.js Mesh objects (tubes)
    edgeMats: [],     // { mat, baseOpacity }
    particles: null,
    raycaster: new THREE.Raycaster(),
    clock: new THREE.Clock(),
    autoRotate: true,
    orbiting: false,
    tapStart: null,
    lastPtr: null,
    pinchDist: 0,
    angleX: 0.18,
    angleY: 0,
    radius: window.innerWidth < 600 ? CFG.CAM_MOBILE : CFG.CAM_DESKTOP,
    target: new THREE.Vector3(0, 0, 0),
    minR: 12, maxR: 62,
    autoTimer: null,
    focusing: false,
    editMode: false,
    selectedId: null,
    pendingDeleteId: null,
    editingId: null,
  };
}

/* ── THREE.JS INIT ────────────────────────────────────── */
function initThree() {
  const canvas = document.getElementById('canvas');
  S.renderer = new THREE.WebGLRenderer({
    canvas, antialias: window.devicePixelRatio < 2, alpha: false,
    powerPreference: 'high-performance',
  });
  S.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
  S.renderer.setSize(window.innerWidth, window.innerHeight);
  S.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  S.renderer.toneMappingExposure = 1.1;

  S.scene = new THREE.Scene();
  S.scene.background = new THREE.Color(CFG.BG);
  S.scene.fog = new THREE.FogExp2(CFG.BG, 0.011);

  S.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 200);
  syncCamera();

  // Lighting — layered for realism
  S.scene.add(new THREE.AmbientLight(0x0a1a3a, 1.5));

  const lights = [
    { c: 0x00d4ff, i: 2.4, p: [2, 12, 12], r: 70 },
    { c: 0xbf5af2, i: 1.8, p: [-14, -5, -12], r: 70 },
    { c: 0xffd60a, i: 1.0, p: [16, 14, -6], r: 50 },
    { c: 0x30d158, i: 0.6, p: [0, -14, 0], r: 40 },
  ];
  lights.forEach(({ c, i, p, r }) => {
    const l = new THREE.PointLight(c, i, r);
    l.position.set(...p);
    S.scene.add(l);
  });

  window.addEventListener('resize', () => {
    S.camera.aspect = window.innerWidth / window.innerHeight;
    S.camera.updateProjectionMatrix();
    S.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function syncCamera() {
  const sx = Math.sin(S.angleY) * Math.cos(S.angleX);
  const sy = Math.sin(S.angleX);
  const sz = Math.cos(S.angleY) * Math.cos(S.angleX);
  S.camera.position.set(
    S.target.x + S.radius * sx,
    S.target.y + S.radius * sy,
    S.target.z + S.radius * sz
  );
  S.camera.lookAt(S.target);
}

/* ── SCENE BUILD ──────────────────────────────────────── */
function buildScene() {
  clearScene();
  buildStarfield();
  buildGrid();
  buildNodes();
  buildEdges();
}

function clearScene() {
  // Remove old nodes/edges
  S.nodes.forEach(n => {
    [n.mesh, n.glow, n.ring, n.sprite, n.label].forEach(o => { if (o) S.scene.remove(o); });
  });
  S.tubeEdges.forEach(t => S.scene.remove(t));
  S.nodes = [];
  S.tubeEdges = [];
  S.edgeMats = [];
}

/* ── STARFIELD ────────────────────────────────────────── */
function buildStarfield() {
  if (S.particles) S.scene.remove(S.particles);
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(CFG.PARTICLES * 3);
  const col = new Float32Array(CFG.PARTICLES * 3);
  const pal = [new THREE.Color(0x00d4ff), new THREE.Color(0xbf5af2), new THREE.Color(0xffd60a), new THREE.Color(0x30d158)];
  for (let i = 0; i < CFG.PARTICLES; i++) {
    pos[i*3]   = (Math.random()-0.5)*140;
    pos[i*3+1] = (Math.random()-0.5)*100;
    pos[i*3+2] = (Math.random()-0.5)*100;
    const c = pal[i % 4];
    const b = 0.2 + Math.random()*0.8;
    col[i*3] = c.r*b; col[i*3+1] = c.g*b; col[i*3+2] = c.b*b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  S.particles = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.22, vertexColors: true, transparent: true, opacity: 0.75, sizeAttenuation: true,
  }));
  S.scene.add(S.particles);
}

function buildGrid() {
  const g = new THREE.GridHelper(80, 40, 0x001a44, 0x001a44);
  g.position.y = -22;
  g.material.transparent = true;
  g.material.opacity = 0.3;
  S.scene.add(g);
}

/* ── LAYOUT ───────────────────────────────────────────── */
function computePositions() {
  const byGen = {};
  FAMILY_DATA.members.forEach(m => (byGen[m.generation] = byGen[m.generation] || []).push(m));
  const genKeys = Object.keys(byGen).map(Number).sort((a, b) => a - b);
  const total = genKeys.length;
  const out = {};

  genKeys.forEach((gen, gi) => {
    const grp = orderPaired(byGen[gen]);
    const w = (grp.length - 1) * CFG.GEN_X;
    const y = (total / 2 - gi) * CFG.GEN_Y;
    grp.forEach((m, idx) => {
      const x = -w / 2 + idx * CFG.GEN_X;
      const z = ((idx % 2 === 0) ? 1 : -1) * CFG.Z_WAVE * (0.5 + Math.random() * 0.5);
      out[m.id] = new THREE.Vector3(x, y, z);
    });
  });
  return out;
}

function orderPaired(grp) {
  const done = new Set(), res = [];
  grp.forEach(m => {
    if (done.has(m.id)) return;
    res.push(m); done.add(m.id);
    if (m.spouseId) {
      const sp = grp.find(x => x.id === m.spouseId);
      if (sp && !done.has(sp.id)) { res.push(sp); done.add(sp.id); }
    }
  });
  return res;
}

/* ── BUILD NODES ──────────────────────────────────────── */
function buildNodes() {
  const pos = computePositions();
  FAMILY_DATA.members.forEach(m => {
    const p = pos[m.id];
    if (!p) return;
    const col = new THREE.Color(m.color);

    /* ── Outer glow shell (BackSide sphere) ── */
    const glowMat = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: 0.09, side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(CFG.NODE_R * 1.75, 16, 16), glowMat);
    glow.position.copy(p);
    S.scene.add(glow);

    /* ── Second inner glow ── */
    const glow2Mat = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: 0.05, side: THREE.BackSide,
    });
    const glow2 = new THREE.Mesh(new THREE.SphereGeometry(CFG.NODE_R * 2.3, 12, 12), glow2Mat);
    glow2.position.copy(p);
    S.scene.add(glow2);

    /* ── Core sphere — MeshStandardMaterial for realism ── */
    const mat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col.clone().multiplyScalar(0.3),
      metalness: 0.75,
      roughness: 0.22,
      transparent: true,
      opacity: 0.95,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(CFG.NODE_R, CFG.NODE_SEG, CFG.NODE_SEG), mat);
    mesh.position.copy(p);
    mesh.userData.memberId = m.id;
    mesh.castShadow = false;
    S.scene.add(mesh);

    /* ── Orbital ring (TorusGeometry) ── */
    const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(CFG.NODE_R * 1.8, 0.06, 8, 64), ringMat);
    ring.position.copy(p);
    ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    ring.rotation.z = Math.random() * Math.PI;
    S.scene.add(ring);

    /* ── Second ring (tilted different axis) ── */
    const ring2Mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25 });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(CFG.NODE_R * 2.1, 0.035, 6, 48), ring2Mat);
    ring2.position.copy(p);
    ring2.rotation.y = Math.PI / 3;
    ring2.rotation.z = Math.PI / 4;
    S.scene.add(ring2);

    /* ── Emoji sprite ── */
    const sprite = makeEmojiSprite(m.emoji, p);

    /* ── Name label ── */
    const label = makeLabel(m.name, col, p);

    /* ── Root node: crown rings + orbiting dots ── */
    if (m.isRoot) addRootFX(p);

    S.nodes.push({
      mesh, glow, glow2, glowMat, glow2Mat, mat, ring, ring2, ringMat, ring2Mat,
      sprite, label, member: m, basePos: p.clone(),
    });
  });
}

/* ── SPRITES ──────────────────────────────────────────── */
function makeEmojiSprite(emoji, pos) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  // Shadow glow behind emoji
  ctx.shadowColor = 'rgba(0,212,255,0.6)';
  ctx.shadowBlur = 20;
  ctx.font = '72px serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 64, 64);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  sp.position.copy(pos);
  sp.scale.set(1.6, 1.6, 1.6);
  S.scene.add(sp);
  return sp;
}

function makeLabel(name, color, pos) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 72;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 72);
  ctx.shadowColor = `#${color.getHexString()}`;
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#e8f4ff';
  ctx.font = 'bold 34px "Noto Sans Devanagari", "Rajdhani", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(name, 256, 36);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.88,
  }));
  sp.position.set(pos.x, pos.y - CFG.NODE_R - 1.0, pos.z);
  sp.scale.set(4.8, 0.68, 1);
  S.scene.add(sp);
  return sp;
}

/* ── ROOT EFFECTS ─────────────────────────────────────── */
function addRootFX(pos) {
  // Crown torus
  const crown = new THREE.Mesh(
    new THREE.TorusGeometry(CFG.NODE_R * 2.6, 0.09, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x30d158, transparent: true, opacity: 0.8 })
  );
  crown.position.copy(pos);
  crown.rotation.x = Math.PI / 2;
  crown.userData.isCrown = true;
  S.scene.add(crown);

  // Orbiting dots
  for (let i = 0; i < 6; i++) {
    const d = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x30d158 })
    );
    d.userData.orbit = { pos: pos.clone(), idx: i, total: 6, r: CFG.NODE_R * 2.45 };
    S.scene.add(d);
  }
}

/* ── BUILD TUBE EDGES ─────────────────────────────────── */
function buildEdges() {
  const posMap = {};
  S.nodes.forEach(n => { posMap[n.member.id] = n.basePos; });
  const drawn = new Set();

  FAMILY_DATA.members.forEach(m => {
    // Parent → Child
    (m.childIds || []).forEach(cid => {
      const key = [m.id, cid].sort().join('|');
      if (drawn.has(key) || !posMap[cid]) return;
      drawn.add(key);
      makeTubeEdge(posMap[m.id], posMap[cid], m.color, 0.7, false);
    });
    // Spouse
    if (m.spouseId) {
      const key = [m.id, m.spouseId].sort().join('|');
      if (!drawn.has(key) && posMap[m.spouseId]) {
        drawn.add(key);
        makeTubeEdge(posMap[m.id], posMap[m.spouseId], 0xff6b9d, 0.45, true);
      }
    }
  });
}

function makeTubeEdge(from, to, color, opacity, isSpouse) {
  if (!from || !to) return;
  const mid = new THREE.Vector3().lerpVectors(from, to, 0.5);
  mid.z += isSpouse ? 0.8 : 3.2;
  mid.y += isSpouse ? 0 : 1.5;

  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  const tubeRadius = isSpouse ? 0.055 : 0.10; // THICK tubes for parent-child
  const geo = new THREE.TubeGeometry(curve, 32, tubeRadius, 6, false);

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color).multiplyScalar(0.45),
    metalness: 0.6,
    roughness: 0.4,
    transparent: true,
    opacity,
  });

  const tube = new THREE.Mesh(geo, mat);
  S.scene.add(tube);
  S.tubeEdges.push(tube);
  S.edgeMats.push({ mat, baseOpacity: opacity, isSpouse });
}

/* ── ANIMATION LOOP ───────────────────────────────────── */
function animate() {
  requestAnimationFrame(animate);
  const t = S.clock.getElapsedTime();

  if (S.autoRotate && !S.orbiting && !S.focusing) {
    S.angleY += CFG.ROTATE_SPEED;
    syncCamera();
  }

  // Starfield drift
  if (S.particles) {
    S.particles.rotation.y = t * 0.009;
    S.particles.rotation.x = t * 0.003;
  }

  // Node animations
  S.nodes.forEach((n, i) => {
    const pulse = Math.sin(t * CFG.PULSE + i * 0.55) * 0.07 + 0.93;
    const bob   = n.basePos.y + Math.sin(t * 0.42 + i * 0.88) * 0.15;

    n.mesh.scale.setScalar(pulse);
    n.glow.scale.setScalar(pulse * 1.2);
    n.glow2.scale.setScalar(pulse * 1.1);
    n.mesh.position.y = bob;
    n.glow.position.y = bob;
    n.glow2.position.y = bob;
    n.ring.position.y = bob;
    n.ring2.position.y = bob;
    n.sprite.position.y = bob;
    n.label.position.y = bob - CFG.NODE_R - 1.0;

    n.ring.rotation.y  += 0.009 + i * 0.0007;
    n.ring.rotation.z  += 0.005 + i * 0.0004;
    n.ring2.rotation.x += 0.006 + i * 0.0005;
    n.ring2.rotation.y += 0.004;

    // Selected glow pulse
    if (S.selectedId === n.member.id) {
      n.mat.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.35;
      n.glowMat.opacity = 0.22 + Math.sin(t * 4) * 0.08;
      n.glow2Mat.opacity = 0.12 + Math.sin(t * 4) * 0.05;
    } else {
      n.mat.emissiveIntensity = 0.3;
      n.glowMat.opacity = 0.09;
      n.glow2Mat.opacity = 0.05;
    }
  });

  // Tube edge pulse
  S.edgeMats.forEach((e, i) => {
    e.mat.opacity = e.baseOpacity * (0.6 + Math.sin(t * 0.85 + i * 0.4) * 0.4);
    e.mat.emissiveIntensity = 0.3 + Math.sin(t * 1.2 + i * 0.3) * 0.25;
  });

  // Crown + orbital dots
  S.scene.children.forEach(obj => {
    if (!obj.userData.orbit) return;
    const { pos, idx, total, r } = obj.userData.orbit;
    const angle = (idx / total) * Math.PI * 2 + t * 1.4;
    obj.position.set(
      pos.x + Math.cos(angle) * r,
      pos.y + Math.sin(t * 0.65) * 0.28,
      pos.z + Math.sin(angle) * r
    );
  });

  S.renderer.render(S.scene, S.camera);
}

/* ── CONTROLS ─────────────────────────────────────────── */
function setupControls() {
  const cv = document.getElementById('canvas');

  // Mouse
  cv.addEventListener('mousedown', e => {
    S.orbiting = true;
    S.lastPtr = { x: e.clientX, y: e.clientY };
    S.tapStart = { x: e.clientX, y: e.clientY, t: Date.now() };
    pauseRotate();
  });
  window.addEventListener('mouseup', e => {
    if (!S.orbiting) return;
    checkTap(e.clientX, e.clientY);
    S.orbiting = false;
  });
  window.addEventListener('mousemove', e => {
    if (!S.orbiting || !S.lastPtr) return;
    S.angleY -= (e.clientX - S.lastPtr.x) * 0.005;
    S.angleX -= (e.clientY - S.lastPtr.y) * 0.005;
    S.angleX = clamp(S.angleX, -1.05, 1.05);
    S.lastPtr = { x: e.clientX, y: e.clientY };
    syncCamera();
  });
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    S.radius = clamp(S.radius + e.deltaY * 0.032, S.minR, S.maxR);
    syncCamera(); pauseRotate();
  }, { passive: false });

  // Touch
  let touches = [];
  cv.addEventListener('touchstart', e => {
    e.preventDefault();
    touches = [...e.touches];
    pauseRotate();
    if (touches.length === 1) {
      S.orbiting = true;
      S.lastPtr = { x: touches[0].clientX, y: touches[0].clientY };
      S.tapStart = { x: touches[0].clientX, y: touches[0].clientY, t: Date.now() };
    } else if (touches.length === 2) {
      S.orbiting = false;
      S.pinchDist = hypot(touches[0], touches[1]);
    }
  }, { passive: false });

  cv.addEventListener('touchmove', e => {
    e.preventDefault();
    touches = [...e.touches];
    if (touches.length === 1 && S.orbiting && S.lastPtr) {
      S.angleY -= (touches[0].clientX - S.lastPtr.x) * 0.006;
      S.angleX -= (touches[0].clientY - S.lastPtr.y) * 0.006;
      S.angleX = clamp(S.angleX, -1.05, 1.05);
      S.lastPtr = { x: touches[0].clientX, y: touches[0].clientY };
      syncCamera();
    } else if (touches.length === 2) {
      const d = hypot(touches[0], touches[1]);
      S.radius = clamp(S.radius + (S.pinchDist - d) * 0.05, S.minR, S.maxR);
      S.pinchDist = d;
      syncCamera();
    }
  }, { passive: false });

  cv.addEventListener('touchend', e => {
    const ct = [...e.changedTouches];
    touches = [...e.touches];
    if (touches.length === 0 && ct.length === 1) {
      checkTap(ct[0].clientX, ct[0].clientY);
      S.orbiting = false;
      resumeRotate(4200);
    }
  }, { passive: false });
}

function hypot(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

function checkTap(cx, cy) {
  if (!S.tapStart) return;
  const moved = Math.hypot(cx - S.tapStart.x, cy - S.tapStart.y);
  const dt = Date.now() - S.tapStart.t;
  if (moved < CFG.TAP_PX && dt < CFG.TAP_MS) handleTap(cx, cy);
  S.tapStart = null;
}

function handleTap(cx, cy) {
  const ndc = new THREE.Vector2(
    (cx / window.innerWidth) * 2 - 1,
    -(cy / window.innerHeight) * 2 + 1
  );
  S.raycaster.setFromCamera(ndc, S.camera);
  const hits = S.raycaster.intersectObjects(S.nodes.map(n => n.mesh));
  if (hits.length > 0) {
    const id = hits[0].object.userData.memberId;
    S.selectedId = id;
    openDetail(id);
    focusNode(id);
    ripple(cx, cy);
  }
}

function focusNode(id) {
  const n = S.nodes.find(x => x.member.id === id);
  if (!n) return;
  const tp = n.basePos.clone();
  const sp = S.target.clone();
  const sr = S.radius;
  const er = clamp(sr * 0.68, S.minR, S.maxR);
  let el = 0;
  S.focusing = true;
  const tick = () => {
    el += 0.018;
    const p = Math.min(el / 0.55, 1);
    const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    S.target.lerpVectors(sp, tp, e);
    S.radius = sr + (er - sr) * e;
    syncCamera();
    if (p < 1) requestAnimationFrame(tick);
    else S.focusing = false;
  };
  requestAnimationFrame(tick);
}

function pauseRotate() {
  S.autoRotate = false;
  if (S.autoTimer) clearTimeout(S.autoTimer);
}
function resumeRotate(d = 4000) {
  if (S.autoTimer) clearTimeout(S.autoTimer);
  S.autoTimer = setTimeout(() => { S.autoRotate = true; }, d);
}
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

/* ── UI SETUP ─────────────────────────────────────────── */
function setupUI() {
  // Reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    S.angleX = 0.18; S.angleY = 0;
    S.radius = window.innerWidth < 600 ? CFG.CAM_MOBILE : CFG.CAM_DESKTOP;
    S.target.set(0, 0, 0); S.selectedId = null;
    S.autoRotate = true; syncCamera();
    closeDetail();
  });

  // Search
  const sp = document.getElementById('search-panel');
  document.getElementById('btn-search').addEventListener('click', () => {
    sp.classList.toggle('hidden');
    if (!sp.classList.contains('hidden')) {
      renderSearch('');
      setTimeout(() => document.getElementById('search-input').focus(), 50);
    }
  });
  document.getElementById('search-input').addEventListener('input', e => renderSearch(e.target.value));

  // Info
  document.getElementById('btn-info').addEventListener('click', () =>
    document.getElementById('info-modal').classList.remove('hidden'));
  document.getElementById('modal-close').addEventListener('click', () =>
    document.getElementById('info-modal').classList.add('hidden'));
  document.getElementById('modal-overlay').addEventListener('click', () =>
    document.getElementById('info-modal').classList.add('hidden'));

  // Detail panel
  document.getElementById('dp-close').addEventListener('click', closeDetail);
  document.getElementById('dp-overlay').addEventListener('click', closeDetail);
  document.getElementById('dp-edit-btn').addEventListener('click', () => openEditModal(S.selectedId));
  document.getElementById('dp-delete-btn').addEventListener('click', () => openDeleteConfirm(S.selectedId));

  // Tabs
  document.querySelectorAll('.dp-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dp-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.dp-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // Edit mode toggle
  document.getElementById('btn-edit-mode').addEventListener('click', toggleEditMode);
  document.getElementById('btn-add-member').addEventListener('click', () => openEditModal(null));

  // Edit modal
  document.getElementById('edit-close').addEventListener('click', closeEditModal);
  document.getElementById('edit-cancel').addEventListener('click', closeEditModal);
  document.getElementById('edit-overlay').addEventListener('click', closeEditModal);
  document.getElementById('edit-save').addEventListener('click', saveEdit);

  // Confirm delete
  document.getElementById('confirm-cancel').addEventListener('click', () =>
    document.getElementById('confirm-modal').classList.add('hidden'));
  document.getElementById('confirm-overlay').addEventListener('click', () =>
    document.getElementById('confirm-modal').classList.add('hidden'));
  document.getElementById('confirm-delete').addEventListener('click', confirmDelete);

  // Language dropdown
  document.getElementById('btn-lang').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('lang-dropdown').classList.toggle('hidden');
  });
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
      CURRENT_LANG = opt.dataset.lang;
      localStorage.setItem('vanshawali-lang', CURRENT_LANG);
      applyI18n();
      rebuildLabels();
      document.getElementById('lang-dropdown').classList.add('hidden');
    });
  });
  document.addEventListener('click', () =>
    document.getElementById('lang-dropdown').classList.add('hidden'));

  // Emoji picker
  buildEmojiGrid();

  // Color picker
  document.querySelectorAll('.color-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      document.getElementById('f-color').value = opt.dataset.color;
    });
  });
}

function toggleEditMode() {
  S.editMode = !S.editMode;
  document.getElementById('edit-banner').classList.toggle('hidden', !S.editMode);
  document.getElementById('btn-edit-mode').classList.toggle('active', S.editMode);
  toast(S.editMode ? t('editModeOn') : t('editModeOff'));
  const editBtn = document.getElementById('dp-edit-btn');
  const delBtn  = document.getElementById('dp-delete-btn');
  editBtn.style.display = S.editMode ? '' : 'none';
  delBtn.style.display  = S.editMode ? '' : 'none';
}

/* ── SEARCH ───────────────────────────────────────────── */
function renderSearch(query) {
  const cont = document.getElementById('search-results');
  cont.innerHTML = '';
  const q = query.trim().toLowerCase();
  const res = q === '' ? FAMILY_DATA.members : FAMILY_DATA.members.filter(m =>
    m.name.toLowerCase().includes(q) ||
    (m.relation||'').toLowerCase().includes(q) ||
    (m.place||'').toLowerCase().includes(q) ||
    (m.occupation||'').toLowerCase().includes(q)
  );
  if (res.length === 0) {
    const p = document.createElement('p');
    p.className = 'search-empty';
    p.textContent = t('noResults');
    cont.appendChild(p);
    return;
  }
  res.forEach(m => {
    const ch = document.createElement('div');
    ch.className = 'search-chip';
    ch.textContent = `${m.emoji} ${m.name}`;
    ch.addEventListener('click', () => {
      S.selectedId = m.id;
      openDetail(m.id);
      focusNode(m.id);
      document.getElementById('search-panel').classList.add('hidden');
    });
    cont.appendChild(ch);
  });
}

/* ── DETAIL PANEL ─────────────────────────────────────── */
function openDetail(id) {
  const m = FAMILY_DATA.byId[id];
  if (!m) return;

  const col  = new THREE.Color(m.color);
  const hex  = `#${col.getHexString()}`;
  const colA = hexRgba(m.color, 0.28);
  const colB = hexRgba(m.color, 0.05);

  const av = document.getElementById('dp-avatar');
  document.getElementById('dp-avatar-emoji').textContent = m.emoji;
  av.style.background = `radial-gradient(circle at 38% 32%, ${colA}, ${colB})`;
  av.style.border = `2px solid ${hexRgba(m.color, 0.6)}`;

  const dot = document.getElementById('dp-status-dot');
  dot.className = 'dp-status-dot ' + (m.isAlive === false ? 'deceased' : 'alive');
  dot.title = m.isAlive === false ? t('deceased') : t('alive');

  document.getElementById('dp-name').textContent = m.name;
  document.getElementById('dp-relation').textContent = m.relation;

  // Personal tab
  setText('dp-birth', m.birth || '—');
  setText('dp-place', m.place || '—');
  setText('dp-birthplace', m.birthPlace || '—');
  setText('dp-occupation', m.occupation || '—');
  setText('dp-education', m.education || '—');
  setText('dp-religion', m.religion || '—');
  setText('dp-blood', m.blood || '—');

  const dr = document.getElementById('dp-death-row');
  if (m.death) {
    dr.style.display = '';
    setText('dp-death', m.death);
  } else {
    dr.style.display = 'none';
  }

  // Family tab
  setText('dp-marriage', m.marriageDate || '—');
  setText('dp-marriage-place', m.marriagePlace || '—');

  // Connections
  const cl = document.getElementById('dp-con-list');
  cl.innerHTML = '';
  const addConn = (cid, relLabel) => {
    const cm = FAMILY_DATA.byId[cid];
    if (!cm) return;
    const chip = document.createElement('div');
    chip.className = 'con-chip';
    chip.innerHTML = `<span class="con-chip-emoji">${cm.emoji}</span>
      <div class="con-chip-info">
        <span class="con-chip-name">${cm.name}</span>
        <span class="con-chip-rel">${relLabel}</span>
      </div>`;
    chip.addEventListener('click', () => { S.selectedId = cm.id; openDetail(cm.id); focusNode(cm.id); });
    cl.appendChild(chip);
  };
  if (m.spouseId) addConn(m.spouseId, t('spouse'));
  (m.parentIds || []).forEach(pid => addConn(pid, t('parent')));
  (m.childIds || []).forEach(cid => addConn(cid, t('child')));

  // Life tab
  document.getElementById('dp-bio').textContent = m.bio || '';

  const hw = document.getElementById('dp-hobbies-wrap');
  const hc = document.getElementById('dp-hobbies');
  hc.innerHTML = '';
  if (m.hobbies && m.hobbies.length) {
    hw.style.display = '';
    const hd = document.createElement('div');
    hd.className = 'hobby-chips';
    m.hobbies.forEach(h => {
      const ch = document.createElement('span');
      ch.className = 'hobby-chip';
      ch.textContent = h;
      hd.appendChild(ch);
    });
    hc.appendChild(hd);
  } else { hw.style.display = 'none'; }

  const aw = document.getElementById('dp-achievements-wrap');
  const ac = document.getElementById('dp-achievements');
  if (m.achievements) {
    aw.style.display = '';
    ac.textContent = m.achievements;
  } else { aw.style.display = 'none'; }

  // Edit/Delete buttons visibility
  document.getElementById('dp-edit-btn').style.display = S.editMode ? '' : 'none';
  document.getElementById('dp-delete-btn').style.display = S.editMode ? '' : 'none';

  // Reset to personal tab
  document.querySelectorAll('.dp-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.dp-tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('.dp-tab[data-tab="personal"]').classList.add('active');
  document.getElementById('tab-personal').classList.add('active');

  document.getElementById('detail-panel').classList.remove('hidden');
  resumeRotate(9000);
}

function closeDetail() {
  document.getElementById('detail-panel').classList.add('hidden');
  S.selectedId = null;
  resumeRotate(2500);
}

/* ── EDIT MODAL ───────────────────────────────────────── */
function openEditModal(id) {
  S.editingId = id;
  const modal = document.getElementById('edit-modal');
  const titleEl = document.getElementById('edit-modal-title');
  const form = document.getElementById('member-form');

  // Populate spouse/parent selects
  populateRelationSelects(id);

  if (id) {
    const m = FAMILY_DATA.byId[id];
    if (!m) return;
    titleEl.textContent = t('editBtn').replace('✏️ ', '');
    document.getElementById('f-name').value = m.name || '';
    document.getElementById('f-gender').value = m.gender || 'male';
    document.getElementById('f-relation').value = m.relation || '';
    document.getElementById('f-generation').value = String(m.generation ?? 3);
    document.getElementById('f-birth').value = m.birth || '';
    document.getElementById('f-death').value = m.death || '';
    document.getElementById('f-birthplace').value = m.birthPlace || '';
    document.getElementById('f-place').value = m.place || '';
    document.getElementById('f-marriage').value = m.marriageDate || '';
    document.getElementById('f-marriage-place').value = m.marriagePlace || '';
    document.getElementById('f-education').value = m.education || '';
    document.getElementById('f-occupation').value = m.occupation || '';
    document.getElementById('f-religion').value = m.religion || '';
    document.getElementById('f-blood').value = m.blood || '';
    document.getElementById('f-bio').value = m.bio || '';
    document.getElementById('f-hobbies').value = (m.hobbies || []).join(', ');
    document.getElementById('f-achievements').value = m.achievements || '';
    document.getElementById('f-emoji').value = m.emoji || '👤';
    document.getElementById('emoji-preview').textContent = m.emoji || '👤';
    document.getElementById('f-color').value = '0x' + m.color.toString(16).padStart(6,'0');

    if (m.spouseId) document.getElementById('f-spouse').value = m.spouseId;
    const pSelect = document.getElementById('f-parents');
    [...pSelect.options].forEach(o => { o.selected = (m.parentIds || []).includes(o.value); });

    // Color picker
    const colHex = m.color.toString(16).padStart(6,'0');
    document.querySelectorAll('.color-opt').forEach(opt => {
      const oc = opt.dataset.color.replace('0x','').toLowerCase();
      opt.classList.toggle('active', oc === colHex);
    });
  } else {
    titleEl.textContent = t('addMember');
    form.reset();
    document.getElementById('f-emoji').value = '👤';
    document.getElementById('emoji-preview').textContent = '👤';
    document.getElementById('f-color').value = '0x00d4ff';
    document.querySelectorAll('.color-opt').forEach((o,i) => o.classList.toggle('active', i === 0));
    document.querySelectorAll('.emoji-opt').forEach(o => o.classList.remove('selected'));
  }

  modal.classList.remove('hidden');
}

function populateRelationSelects(excludeId) {
  const sp = document.getElementById('f-spouse');
  const pa = document.getElementById('f-parents');
  sp.innerHTML = `<option value="">— ${t('spouseLabel')} —</option>`;
  pa.innerHTML = '';
  FAMILY_DATA.members.forEach(m => {
    if (m.id === excludeId) return;
    const o1 = document.createElement('option');
    o1.value = m.id; o1.textContent = `${m.emoji} ${m.name}`;
    sp.appendChild(o1);
    const o2 = o1.cloneNode(true);
    pa.appendChild(o2);
  });
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  S.editingId = null;
}

function saveEdit() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { alert('नाम आवश्यक है / Name is required'); return; }

  const hobbiesRaw = document.getElementById('f-hobbies').value;
  const hobbies = hobbiesRaw ? hobbiesRaw.split(',').map(h => h.trim()).filter(Boolean) : [];

  const parentsSel = document.getElementById('f-parents');
  const parentIds = [...parentsSel.options].filter(o => o.selected).map(o => o.value);

  const colorStr = document.getElementById('f-color').value;
  const colorNum = parseInt(colorStr.replace('0x',''), 16);

  const data = {
    name,
    gender: document.getElementById('f-gender').value,
    relation: document.getElementById('f-relation').value.trim(),
    generation: parseInt(document.getElementById('f-generation').value),
    birth: document.getElementById('f-birth').value.trim() || null,
    death: document.getElementById('f-death').value.trim() || null,
    birthPlace: document.getElementById('f-birthplace').value.trim(),
    place: document.getElementById('f-place').value.trim(),
    marriageDate: document.getElementById('f-marriage').value.trim() || null,
    marriagePlace: document.getElementById('f-marriage-place').value.trim() || null,
    education: document.getElementById('f-education').value.trim(),
    occupation: document.getElementById('f-occupation').value.trim(),
    religion: document.getElementById('f-religion').value.trim(),
    blood: document.getElementById('f-blood').value,
    bio: document.getElementById('f-bio').value.trim(),
    hobbies,
    achievements: document.getElementById('f-achievements').value.trim(),
    emoji: document.getElementById('f-emoji').value || '👤',
    color: colorNum || 0x00d4ff,
    spouseId: document.getElementById('f-spouse').value || null,
    parentIds,
  };

  if (S.editingId) {
    updateMember(S.editingId, data);
  } else {
    addMember(data);
  }

  closeEditModal();
  closeDetail();
  rebuildSceneWithData();
  updateStats();
  toast(t('saved'));
}

/* ── DELETE ───────────────────────────────────────────── */
function openDeleteConfirm(id) {
  S.pendingDeleteId = id;
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function confirmDelete() {
  if (!S.pendingDeleteId) return;
  deleteMember(S.pendingDeleteId);
  S.pendingDeleteId = null;
  document.getElementById('confirm-modal').classList.add('hidden');
  closeDetail();
  rebuildSceneWithData();
  updateStats();
  toast(t('deleted'));
}

function rebuildSceneWithData() {
  rebuildIndex();
  buildScene();
}

/* ── STATS & LABELS ───────────────────────────────────── */
function updateStats() {
  document.getElementById('stat-members').textContent = FAMILY_DATA.members.length;
  const gens = new Set(FAMILY_DATA.members.map(m => m.generation)).size;
  document.getElementById('stat-gens').textContent = gens;

  const years = FAMILY_DATA.members
    .map(m => parseInt((m.birth || '').match(/\d{4}/)?.[0]))
    .filter(Boolean);
  if (years.length) {
    const span = Math.max(...years) - Math.min(...years);
    document.getElementById('stat-years').textContent = span + '+';
  }
}

function rebuildLabels() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  // Gen labels
  document.querySelectorAll('.gen-label').forEach(el => {
    el.textContent = t('gen' + el.dataset.gen);
  });
}

/* ── EMOJI GRID ───────────────────────────────────────── */
function buildEmojiGrid() {
  const emojis = ['👴','👵','👨','👩','🧔','👧','🧑','👶','👨‍💼','👩‍💼',
    '👨‍⚕️','👩‍⚕️','👨‍🏫','👩‍🏫','👨‍🌾','👩‍🌾','👨‍🎨','👩‍🎨','🧕','👲',
    '👱','🧓','👩‍🦳','👨‍🦳','🧑‍💻','👩‍💻','👨‍🎬','👩‍🎬'];
  const grid = document.getElementById('emoji-grid');
  grid.innerHTML = '';
  emojis.forEach(e => {
    const d = document.createElement('div');
    d.className = 'emoji-opt'; d.textContent = e;
    d.addEventListener('click', () => {
      document.querySelectorAll('.emoji-opt').forEach(o => o.classList.remove('selected'));
      d.classList.add('selected');
      document.getElementById('f-emoji').value = e;
      document.getElementById('emoji-preview').textContent = e;
    });
    grid.appendChild(d);
  });
}

/* ── TOAST ────────────────────────────────────────────── */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

/* ── RIPPLE ───────────────────────────────────────────── */
function ripple(x, y) {
  const el = document.createElement('div');
  el.className = 'ripple';
  const s = 100;
  el.style.cssText = `width:${s}px;height:${s}px;left:${x-s/2}px;top:${y-s/2}px;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

/* ── LOADER ───────────────────────────────────────────── */
function hideLoader() {
  const l = document.getElementById('loader');
  if (l) l.classList.add('hidden');
}

function showFatalError(msg) {
  document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#020818;color:#e0f4ff;font-family:sans-serif;text-align:center;padding:20px;"><div><div style="font-size:3rem;margin-bottom:16px">⚠️</div><h2 style="color:#00d4ff;margin-bottom:10px">Error</h2><p style="color:rgba(224,244,255,.6)">${msg}</p><button onclick="location.reload()" style="margin-top:20px;padding:10px 24px;background:rgba(0,212,255,.15);border:1px solid rgba(0,212,255,.4);border-radius:8px;color:#00d4ff;cursor:pointer;font-size:1rem">Reload</button></div></div>`;
}

/* ── HELPERS ──────────────────────────────────────────── */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function hexRgba(hex, a) {
  return `rgba(${(hex>>16)&255},${(hex>>8)&255},${hex&255},${a})`;
}
