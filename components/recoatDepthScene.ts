import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Counts = { sands: number; recoats: number };

/** Builds the three.js depth model inside `stage`. Returns controls and a dispose() that frees everything. */
export function mountScene(stage: HTMLElement, onChange: (c: Counts) => void, STEPS: number) {
  const C = { steel: 0x143781, blue: 0x438ad4, amber: 0xe8a33d };
  const W = 2.4, D = 0.55;
  const TOTAL = 1.0, STRUCT_MIN = 0.52;
  const STEP = (TOTAL - STRUCT_MIN) / STEPS;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  camera.position.set(3.9, 2.7, 4.3);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = 0.75;
  controls.maxPolarAngle = 1.15;
  controls.minAzimuthAngle = -0.5;
  controls.maxAzimuthAngle = 0.5;
  controls.target.set(0, TOTAL * 0.42, 0);

  const root = new THREE.Group();
  scene.add(root);
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);
  const lineMat = (c: number, o = 1) => track(new THREE.LineBasicMaterial({ color: c, transparent: o < 1, opacity: o }));
  const edgesOf = (geo: THREE.BufferGeometry, c: number, o = 1) => new THREE.LineSegments(track(new THREE.EdgesGeometry(geo)), lineMat(c, o));

  // full-depth reference frame (the original, unsanded board)
  root.add(edgesOf(track(new THREE.BoxGeometry(W, TOTAL, D)), C.steel, 0.4));

  // structural-minimum zone: never sand into this
  const dangerGeo = track(new THREE.BoxGeometry(W, STRUCT_MIN, D));
  const danger = new THREE.Mesh(dangerGeo, track(new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.05 })));
  danger.position.y = STRUCT_MIN / 2;
  root.add(danger);
  const dangerEdges = edgesOf(dangerGeo, C.amber, 0.55);
  dangerEdges.position.y = STRUCT_MIN / 2;
  root.add(dangerEdges);

  // remaining wear layer: shrinks toward STRUCT_MIN with each full sand
  const wearGeo = track(new THREE.BoxGeometry(W, 1, D));
  const wearFill = new THREE.Mesh(wearGeo, track(new THREE.MeshBasicMaterial({ color: C.blue, transparent: true, opacity: 0.16 })));
  const wearEdges = edgesOf(wearGeo, C.blue, 0.6);
  root.add(wearFill, wearEdges);

  // current playing surface
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const surface = new THREE.LineLoop(
    track(new THREE.BufferGeometry().setFromPoints([v(-W / 2, 0, -D / 2), v(W / 2, 0, -D / 2), v(W / 2, 0, D / 2), v(-W / 2, 0, D / 2)])),
    lineMat(C.amber),
  );
  root.add(surface);
  const flashMat = track(new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  const flash = new THREE.Mesh(track(new THREE.PlaneGeometry(W, D)), flashMat);
  flash.rotation.x = -Math.PI / 2;
  root.add(flash);

  function layout(top: number) {
    const h = Math.max(top - STRUCT_MIN, 0.0001);
    wearFill.scale.y = h;
    wearFill.position.y = STRUCT_MIN + h / 2;
    wearEdges.scale.y = h;
    wearEdges.position.y = STRUCT_MIN + h / 2;
    surface.position.y = top;
    flash.position.y = top + 0.001;
  }
  layout(TOTAL);

  const state = { top: TOTAL, target: TOTAL, sands: 0, recoats: 0, flashUntil: 0 };
  const emit = () => onChange({ sands: state.sands, recoats: state.recoats });

  // labels (DOM overlay)
  const labelsEl = document.createElement("div");
  stage.appendChild(labelsEl);
  const defs = [
    { name: "Original depth", getY: () => TOTAL },
    { name: "Current surface", getY: () => state.top },
    { name: "Structural minimum", getY: () => STRUCT_MIN },
  ];
  const labelNodes = defs.map((d, i) => {
    const lead = document.createElement("div");
    lead.className = "rd-leader";
    const el = document.createElement("div");
    el.className = "rd-label";
    el.innerHTML = `<span class="num">0${i + 1}</span><span class="txt">${d.name}</span>`;
    labelsEl.append(lead, el);
    return { el, lead, def: d };
  });

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  const tmp = new THREE.Vector3();
  let raf = 0;
  let visible = true;
  const vis = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
  });
  vis.observe(stage);

  function tick() {
    raf = 0;
    if (!visible) return; // pause rendering while off-screen
    raf = requestAnimationFrame(tick);
    state.top += (state.target - state.top) * 0.08;
    layout(state.top);
    const remain = state.flashUntil - performance.now();
    flashMat.opacity = remain > 0 ? Math.max(0, remain / 550) * 0.55 : 0;
    controls.update();
    renderer.render(scene, camera);
    const w = stage.clientWidth, h = stage.clientHeight;
    const hideOriginal = (name: string) => name === "Original depth" && TOTAL - state.top < 0.03;
    for (const n of labelNodes) {
      tmp.set(W / 2 + 0.03, n.def.getY(), 0).applyMatrix4(root.matrixWorld).project(camera);
      const sx = (tmp.x * 0.5 + 0.5) * w, sy = (-tmp.y * 0.5 + 0.5) * h;
      const hidden = hideOriginal(n.def.name);
      n.el.style.top = `${sy}px`;
      n.el.style.opacity = hidden ? "0" : "1";
      const labelLeft = w - 14 - n.el.offsetWidth;
      const okLead = sx < labelLeft - 10 && tmp.z < 1 && !hidden;
      n.lead.style.opacity = okLead ? "1" : "0";
      if (okLead) {
        n.lead.style.left = `${sx}px`;
        n.lead.style.top = `${sy}px`;
        n.lead.style.width = `${labelLeft - sx - 8}px`;
      }
    }
  }
  raf = requestAnimationFrame(tick);
  emit();

  return {
    recoat() {
      state.recoats++;
      state.flashUntil = performance.now() + 550;
      emit();
    },
    sand() {
      if (state.sands >= STEPS) return;
      state.sands++;
      state.target = TOTAL - state.sands * STEP;
      emit();
    },
    reset() {
      state.sands = 0;
      state.recoats = 0;
      state.target = TOTAL;
      emit();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      vis.disconnect();
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      labelsEl.remove();
    },
  };
}
