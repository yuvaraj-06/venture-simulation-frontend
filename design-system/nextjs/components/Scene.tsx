'use client';

/**
 * Share Ventures — persistent teaching object + HUD (scene mode).
 * Spec: design-system/graphics-3d.md §6. Visual truth: demo/index.html.
 *
 * Mount ONCE in app/layout.tsx (inside <body>). The root layout keeps the
 * scene available across routes; sections hide it whenever it has no job.
 *
 * Sections opt in via markup (server components, no client code needed):
 *   <section data-scene='{"x":0.28,"y":0.02,"s":1,"o":1,"tone":0}'
 *            data-scene-label="Overview">
 * Keys: x/y viewport-fraction offset · s scale · o opacity · tone 0 dark↔1 light
 *       ry/rx authored pose radians (defaults 0/0.18)
 *       · split separates the S paths, 0 interlocked → 1 apart (default 0).
 * Every visible state must show a section rule. Use o:0 when it cannot.
 * Requires: npm i three
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

type SceneState = {
  x: number; y: number; s: number; o: number; tone: number;
  ry: number; rx: number; split: number;
};
const DEF = { ry: 0, rx: 0.18, split: 0 };

const SYMBOL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">
<path d="M414.15,448.29l414.15,239.11v62.53l-288.3,166.45-414.15-239.11v102.25c0,26.56,14.29,51.32,37.29,64.6l339.56,196.04c11.5,6.64,24.4,9.96,37.29,9.96s25.8-3.32,37.3-9.96l353.28-203.97c14.54-8.4,23.57-24.04,23.57-40.83v-180.62l-414.15-239.11-125.85,72.66Z"/>
<path d="M916.86,322.84l-339.56-196.04c-23.01-13.28-51.59-13.29-74.59,0l-345.4,199.41c-19.41,11.21-31.46,32.09-31.46,54.5v171.51l414.15,239.11,125.85-72.66-414.15-239.11v-62.53l288.3-166.45,414.15,239.11v-102.25c0-26.56-14.29-51.32-37.29-64.6Z"/>
</svg>`;

export default function Scene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const remeasure = useRef<() => void>(() => {});
  const [hud, setHud] = useState({ label: '', onLight: false, visible: false });

  /* Current-section readout + scene tracking (plain DOM — works even if WebGL fails) */
  useEffect(() => {
    let tops: number[] = [];
    let sections: { el: Element; cfg: Partial<SceneState>; label: string }[] = [];
    const measure = () => {
      sections = [...document.querySelectorAll<HTMLElement>('[data-scene]')].map(el => ({
        el, cfg: JSON.parse(el.dataset.scene || '{}'), label: el.dataset.sceneLabel || '',
      }));
      tops = sections.map(s => (s.el as HTMLElement).offsetTop);
      (window as any).__svSceneSections = { sections, tops }; // shared with the 3D driver
      dispatchEvent(new Event('sv-scenechange'));
    };
    remeasure.current = measure;
    let active = -1;
    const onScroll = () => {
      if (!sections.length) return;
      const ref = scrollY + innerHeight * 0.35;
      let i = 0;
      while (i < tops.length - 1 && ref >= tops[i + 1]) i++;
      if (i !== active) {
        active = i;
        setHud({
          label: sections[i].label,
          onLight: (sections[i].cfg.tone ?? 0) > 0.5,
          visible: true,
        });
      }
    };
    measure(); onScroll();
    setTimeout(() => { measure(); onScroll(); }, 1200);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure, { passive: true });
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', measure); };
  }, [pathname]); // re-collect sections on every route change

  /* 3D companion */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cleanup = () => {};
    (() => {
      try {
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        const scene = new THREE.Scene();
        const room = new RoomEnvironment(renderer);
        const pmrem = new THREE.PMREMGenerator(renderer);
        const environmentMap = pmrem.fromScene(room, 0.02).texture;
        scene.environment = environmentMap;
        room.dispose();
        pmrem.dispose();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        camera.position.set(0, 0, 7);

        const group = new THREE.Group();
        const GRAPHITE = new THREE.Color(0x2b3033), ALUMINUM = new THREE.Color(0xc8cbcc);
        const faceMaterial = new THREE.MeshPhysicalMaterial({
          color: GRAPHITE.clone(), metalness: 1, roughness: 0.22, envMapIntensity: 1.8,
        });
        const edgeMaterial = new THREE.MeshPhysicalMaterial({
          color: GRAPHITE.clone(), metalness: 1, roughness: 0.12, envMapIntensity: 2.1,
        });
        const materials = [faceMaterial, edgeMaterial];
        for (const p of new SVGLoader().parse(SYMBOL_SVG).paths)
          for (const shape of SVGLoader.createShapes(p))
            group.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {
              depth: 150, bevelEnabled: true, bevelThickness: 10, bevelSize: 10, bevelSegments: 3, curveSegments: 10,
            }), materials));
        const box = new THREE.Box3().setFromObject(group);
        const c = box.getCenter(new THREE.Vector3());
        group.children.forEach(m => (m as any).geometry.translate(-c.x, -c.y, -c.z));
        const baseS = 3.4 / Math.max(...box.getSize(new THREE.Vector3()).toArray());
        const [pathA, pathB] = group.children;
        const PART_SPLIT = { x: 180, y: 70, z: 50 };
        const rig = new THREE.Group();
        rig.add(group); scene.add(rig);

        const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-3, 4, 5);
        const rim = new THREE.DirectionalLight(0xffffff, 3.2); rim.position.set(4, 1.5, -4);
        const fill = new THREE.AmbientLight(0xffffff, 0.22);
        scene.add(key, rim, fill);

        const size = () => {
          renderer.setSize(mount.clientWidth, mount.clientHeight);
          camera.aspect = mount.clientWidth / mount.clientHeight;
          camera.updateProjectionMatrix();
        };


        const smooth = (t: number) => t * t * (3 - 2 * t);
        const stateAt = (): SceneState => {
          const shared = (window as any).__svSceneSections;
          if (!shared?.sections.length) return { ...DEF, x: 0, y: 0, s: 0, o: 0, tone: 0 };
          const { sections, tops } = shared;
          const ref = scrollY + innerHeight * 0.35;
          let i = 0;
          while (i < tops.length - 1 && ref >= tops[i + 1]) i++;
          const a = { ...DEF, x: 0, y: 0, s: 1, o: 1, tone: 0, ...sections[i].cfg };
          const b = { ...DEF, x: 0, y: 0, s: 1, o: 1, tone: 0, ...(sections[i + 1] || sections[i]).cfg };
          const span = (tops[i + 1] ?? tops[i] + 1) - tops[i];
          const f = smooth(Math.min(Math.max((ref - tops[i]) / span, 0), 1));
          const mix = (k: keyof SceneState) => a[k] + (b[k] - a[k]) * f;
          return { x: mix('x'), y: mix('y'), s: mix('s'), o: mix('o'), tone: mix('tone'),
                   rx: mix('rx'), split: mix('split'), ry: mix('ry') };
        };

        const cur = stateAt();
        let raf = 0;
        const render = () => {
          const compact = innerWidth < 900;
          const visH = 2 * camera.position.z * Math.tan(camera.fov * Math.PI / 360);
          const visW = visH * camera.aspect;
          const sceneX = compact && cur.s <= 0.5 ? Math.abs(cur.x) : cur.x;
          const edgeBias = compact && cur.s > 0.5 ? Math.sign(sceneX || 1) * visW * 0.16 : 0;
          rig.position.x = sceneX * visW * (compact ? 0.8 : 1) + edgeBias;
          const lift = compact ? visH * (cur.s > 0.5 ? 0.18 : 0.36) : 0;
          rig.position.y = -cur.y * visH + lift;
          const sc = baseS * cur.s * (compact ? 0.42 : 1);
          group.scale.set(sc, -sc, sc);
          pathA.position.set(-PART_SPLIT.x * cur.split, PART_SPLIT.y * cur.split, PART_SPLIT.z * cur.split);
          pathB.position.set(PART_SPLIT.x * cur.split, -PART_SPLIT.y * cur.split, -PART_SPLIT.z * cur.split);
          renderer.domElement.style.opacity = String(cur.o * (compact ? 0.8 : 1));
          faceMaterial.color.lerpColors(GRAPHITE, ALUMINUM, cur.tone);
          edgeMaterial.color.copy(faceMaterial.color);
          rim.intensity = 3.2 + (1.2 - 3.2) * cur.tone;
          key.intensity = 2.4 + (2.8 - 2.4) * cur.tone;
          fill.intensity = 0.22 + (0.7 - 0.22) * cur.tone;
          group.rotation.y = cur.ry;
          group.rotation.x = cur.rx;
          renderer.render(scene, camera);
        };
        const frame = () => {
          raf = 0;
          if (document.hidden) return;
          const tgt = stateAt();
          let unsettled = false;
          for (const k of Object.keys(cur) as (keyof SceneState)[]) {
            const delta = tgt[k] - cur[k];
            if (reduced || Math.abs(delta) < 0.0001) cur[k] = tgt[k];
            else {
              cur[k] += delta * 0.08;
              unsettled = true;
            }
          }
          render();
          if (unsettled) raf = requestAnimationFrame(frame);
        };
        const scheduleFrame = () => {
          if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
        };
        const onResize = () => {
          size();
          scheduleFrame();
        };
        const onVisibilityChange = () => {
          if (!document.hidden) scheduleFrame();
        };

        mount.appendChild(renderer.domElement);
        size();
        addEventListener('scroll', scheduleFrame, { passive: true });
        addEventListener('resize', onResize, { passive: true });
        addEventListener('sv-scenechange', scheduleFrame);
        document.addEventListener('visibilitychange', onVisibilityChange);
        scheduleFrame();
        mount.classList.add('is-ready');

        cleanup = () => {
          cancelAnimationFrame(raf);
          removeEventListener('scroll', scheduleFrame);
          removeEventListener('resize', onResize);
          removeEventListener('sv-scenechange', scheduleFrame);
          document.removeEventListener('visibilitychange', onVisibilityChange);
          environmentMap.dispose();
          renderer.dispose();
          group.children.forEach(m => (m as any).geometry.dispose());
          materials.forEach(material => material.dispose());
          renderer.domElement.remove();
        };
      } catch {
        /* WebGL initialization failure: page works without the companion */
      }
    })();
    return cleanup;
  }, []);

  return (
    <>
      <div ref={mountRef} className="sv-scene" aria-hidden="true" />
      {hud.visible && (
        <div className={`sv-hud${hud.onLight ? ' on-light' : ''}`} aria-hidden="true">
          <span className="sv-hud__label">{hud.label}</span>
        </div>
      )}
    </>
  );
}
