import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * InteractiveNeuralBackground (Performance-Optimized)
 * ---------------------------------------------------------------------------
 * High-performance 3D-projected generative canvas environment for ASCEND AI.
 * Optimized for 60fps zero-jank scrolling:
 * - Zero layout queries (scrollHeight cached outside rAF)
 * - Bounded arc fills instead of full-screen multi-pass fillRect overdraw
 * - Batched path drawing for wave nodes & filaments
 * - Zero per-particle CanvasGradient allocations in the render loop
 * - Single persistent animation instance across route transitions
 * - Adaptive particle density for lower-powered & mobile devices
 */

function createIcosahedron() {
  const t = (1 + Math.sqrt(5)) / 2;
  const rawVertices = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
  ];
  const vertices = rawVertices.map(([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [x / len, y / len, z / len];
  });
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];
  const edges = [];
  const edgeSet = new Set();
  faces.forEach(([a, b, c]) => {
    [[a, b], [b, c], [c, a]].forEach(([u, v]) => {
      const key = u < v ? `${u}-${v}` : `${v}-${u}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([u, v]);
      }
    });
  });
  return { vertices, faces, edges };
}

function createOctahedron() {
  const vertices = [
    [1, 0, 0], [-1, 0, 0],
    [0, 1, 0], [0, -1, 0],
    [0, 0, 1], [0, 0, -1]
  ];
  const faces = [
    [0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4],
    [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]
  ];
  const edges = [
    [0, 2], [2, 1], [1, 3], [3, 0],
    [0, 4], [1, 4], [2, 4], [3, 4],
    [0, 5], [1, 5], [2, 5], [3, 5]
  ];
  return { vertices, faces, edges };
}

function rotate3D(x, y, z, rx, ry, rz) {
  const cosX = Math.cos(rx), sinX = Math.sin(rx);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;

  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const x2 = x * cosY + z1 * sinY;
  const z2 = -x * sinY + z1 * cosY;

  const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
  const x3 = x2 * cosZ - y1 * sinZ;
  const y3 = x2 * sinZ + y1 * cosZ;
  return [x3, y3, z2];
}

export default function InteractiveNeuralBackground({ mode = 'auto' }) {
  const canvasRef = useRef(null);
  const location = useLocation();
  const isLanding = mode === 'hero' || (mode === 'auto' && location.pathname === '/');
  const isLandingRef = useRef(isLanding);

  useEffect(() => {
    isLandingRef.current = isLanding;
  }, [isLanding]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    const onMotionChange = (e) => {
      prefersReducedMotion = e.matches;
    };
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', onMotionChange);
    }

    // Detect lower-powered devices to scale particle density smoothly
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const isLowPower = cores <= 4 || memory <= 4;

    let width = window.innerWidth;
    let height = window.innerHeight;
    // Cap DPR at 1.25 to avoid 4x Retina fill-rate bottlenecks during scroll
    let dpr = Math.min(window.devicePixelRatio || 1, isLowPower ? 1 : 1.25);
    let cachedMaxScroll = Math.max(document.documentElement.scrollHeight - height, 1);

    const pointer = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
      vx: 0,
      vy: 0,
      active: false
    };

    const scroll = {
      y: window.scrollY || 0,
      targetY: window.scrollY || 0,
      progress: 0
    };

    let animationFrameId = null;
    let isTabVisible = !document.hidden;

    const icosa = createIcosahedron();
    const octa = createOctahedron();

    const palette = [
      { r: 119, g: 101, b: 232 },
      { r: 143, g: 169, b: 254 },
      { r: 165, g: 180, b: 252 },
      { r: 196, g: 181, b: 253 },
      { r: 147, g: 197, b: 253 },
      { r: 255, g: 255, b: 255 }
    ];

    const particles = [];
    let waveCols = 36;
    let waveRows = 11;

    const initParticles = () => {
      const isMobile = width < 768;
      const maxCount = isMobile
        ? 110
        : isLowPower
        ? 190
        : 310;

      waveCols = isMobile ? 20 : isLowPower ? 28 : 38;
      waveRows = isMobile ? 7 : isLowPower ? 9 : 12;

      particles.length = 0;
      for (let i = 0; i < maxCount; i++) {
        const z = Math.random() * 900 - 250;
        const col = palette[i % palette.length];
        const band = i % 3;
        const homeX = (Math.random() - 0.5) * width * 1.6;
        const homeY =
          (Math.random() - 0.5) * height * 1.5 +
          Math.sin((homeX / width) * Math.PI * 2 + band) * 120;

        particles.push({
          x: homeX,
          y: homeY,
          z,
          ox: homeX,
          oy: homeY,
          oz: z,
          vx: 0,
          vy: 0,
          size: Math.random() * 2.4 + 1.1,
          color: col,
          alpha: Math.random() * 0.55 + 0.25,
          phase: Math.random() * Math.PI * 2,
          speed: (Math.random() * 0.42 + 0.18) * (band === 0 ? 1 : band === 1 ? -0.8 : 0.6),
          band,
          isHub: i % 16 === 0
        });
      }
    };

    const ribbons = [
      {
        yOffset: -0.14,
        amplitude: 64,
        frequency: 0.0022,
        speed: 0.012,
        thickness: 92,
        colorTop: 'rgba(143, 169, 254, 0.20)',
        colorBottom: 'rgba(196, 181, 253, 0.01)',
        stroke: 'rgba(255, 255, 255, 0.72)',
        phase: 0.4
      },
      {
        yOffset: 0.08,
        amplitude: 80,
        frequency: 0.0018,
        speed: -0.009,
        thickness: 115,
        colorTop: 'rgba(119, 101, 232, 0.15)',
        colorBottom: 'rgba(143, 169, 254, 0.01)',
        stroke: 'rgba(255, 255, 255, 0.62)',
        phase: 2.1
      },
      {
        yOffset: 0.28,
        amplitude: 52,
        frequency: 0.0026,
        speed: 0.015,
        thickness: 82,
        colorTop: 'rgba(196, 181, 253, 0.22)',
        colorBottom: 'rgba(224, 231, 255, 0.01)',
        stroke: 'rgba(255, 255, 255, 0.68)',
        phase: 4.2
      }
    ];

    const getStructures = (mobile) => [
      {
        geom: icosa,
        anchorX: -0.34,
        anchorY: -0.14,
        z: 110,
        radius: mobile ? 55 : 88,
        rx: 0.3,
        ry: 0.6,
        rz: 0.1,
        drx: 0.003,
        dry: 0.0045,
        drz: 0.0016,
        parallax: 0.25,
        tint: { r: 119, g: 101, b: 232 }
      },
      {
        geom: octa,
        anchorX: 0.35,
        anchorY: -0.10,
        z: 90,
        radius: mobile ? 50 : 80,
        rx: 0.8,
        ry: 0.2,
        rz: 0.4,
        drx: -0.0035,
        dry: 0.004,
        drz: 0.0022,
        parallax: 0.38,
        tint: { r: 143, g: 169, b: 254 }
      },
      {
        geom: icosa,
        anchorX: 0.26,
        anchorY: 0.32,
        z: 240,
        radius: mobile ? 42 : 64,
        rx: 1.1,
        ry: 0.9,
        rz: 0.2,
        drx: 0.0022,
        dry: -0.0032,
        drz: 0.0028,
        parallax: 0.16,
        tint: { r: 165, g: 180, b: 252 }
      },
      {
        geom: octa,
        anchorX: -0.28,
        anchorY: 0.35,
        z: 280,
        radius: mobile ? 38 : 58,
        rx: 0.5,
        ry: 1.4,
        rz: 0.7,
        drx: -0.0025,
        dry: -0.003,
        drz: 0.0018,
        parallax: 0.20,
        tint: { r: 196, g: 181, b: 253 }
      }
    ];

    let structures = getStructures(width < 768);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, isLowPower ? 1 : 1.25);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cachedMaxScroll = Math.max(document.documentElement.scrollHeight - height, 1);
      structures = getStructures(width < 768);
      initParticles();
    };

    resize();

    const onMouseMove = (e) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        pointer.targetX = e.touches[0].clientX;
        pointer.targetY = e.touches[0].clientY;
        pointer.active = true;
      }
    };

    const onTouchEnd = () => {
      pointer.active = false;
    };

    const onMouseLeave = () => {
      pointer.active = false;
    };

    const onScroll = () => {
      scroll.targetY = window.scrollY || 0;
    };

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    let time = 0;
    const fov = 560;
    const projectedParticles = [];

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      if (!isTabVisible) return;

      const activeLanding = isLandingRef.current;
      const dt = prefersReducedMotion ? 0.15 : 1;
      time += 0.013 * dt;

      const prevX = pointer.x;
      const prevY = pointer.y;
      if (!pointer.active) {
        pointer.targetX = width * 0.5 + Math.cos(time * 0.55) * (width * 0.22);
        pointer.targetY = height * 0.42 + Math.sin(time * 0.8) * (height * 0.16);
      }
      pointer.x += (pointer.targetX - pointer.x) * 0.085;
      pointer.y += (pointer.targetY - pointer.y) * 0.085;
      pointer.vx = pointer.x - prevX;
      pointer.vy = pointer.y - prevY;

      scroll.y += (scroll.targetY - scroll.y) * 0.1;
      scroll.progress = Math.min(Math.max(scroll.y / cachedMaxScroll, 0), 1);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const normMX = (pointer.x - cx) / (width * 0.5);
      const normMY = (pointer.y - cy) / (height * 0.5);
      const globalOpacity = activeLanding ? 1.0 : 0.46;
      const forceRadius = activeLanding ? 240 : 170;

      // =====================================================================
      // STEP 1: ATMOSPHERIC BASE & BOUNDED VOLUMETRIC POOLS (NO FULL OVERDRAW)
      // =====================================================================
      const baseGrad = ctx.createLinearGradient(0, 0, width * 0.7, height);
      if (scroll.progress < 0.5) {
        baseGrad.addColorStop(0, '#F5F2FF');
        baseGrad.addColorStop(0.4, '#ECE7FE');
        baseGrad.addColorStop(0.75, '#E5EEFF');
        baseGrad.addColorStop(1, '#F6F5FD');
      } else {
        baseGrad.addColorStop(0, '#EEF2FF');
        baseGrad.addColorStop(0.45, '#EAE4FD');
        baseGrad.addColorStop(0.8, '#E0ECFF');
        baseGrad.addColorStop(1, '#F4F1FE');
      }
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      const poolRadius = Math.min(width, height) * 0.46;
      const pools = [
        {
          x: width * (0.22 + Math.sin(time * 0.4) * 0.07) - normMX * 30,
          y: height * (0.26 + Math.cos(time * 0.35) * 0.07),
          c0: `rgba(165, 148, 254, ${0.20 * globalOpacity})`
        },
        {
          x: width * (0.78 + Math.cos(time * 0.32) * 0.08) + normMX * 30,
          y: height * (0.34 + Math.sin(time * 0.45) * 0.07),
          c0: `rgba(143, 185, 255, ${0.22 * globalOpacity})`
        }
      ];

      for (let i = 0; i < pools.length; i++) {
        const p = pools[i];
        const g = ctx.createRadialGradient(p.x, p.y, 8, p.x, p.y, poolRadius);
        g.addColorStop(0, p.c0);
        g.addColorStop(1, 'rgba(165, 148, 254, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, poolRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bounded Cursor Spotlight
      const cursorLightRadius = activeLanding ? 360 : 240;
      const cursorGrad = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        6,
        pointer.x,
        pointer.y,
        cursorLightRadius
      );
      cursorGrad.addColorStop(0, `rgba(255, 255, 255, ${0.58 * globalOpacity})`);
      cursorGrad.addColorStop(0.35, `rgba(143, 169, 254, ${0.18 * globalOpacity})`);
      cursorGrad.addColorStop(1, 'rgba(119, 101, 232, 0)');
      ctx.fillStyle = cursorGrad;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, cursorLightRadius, 0, Math.PI * 2);
      ctx.fill();

      // =====================================================================
      // STEP 2: FLOWING LIQUID-GLASS RIBBONS
      // =====================================================================
      const ribbonCount = activeLanding ? ribbons.length : 2;
      const stepX = 36;

      for (let rIdx = 0; rIdx < ribbonCount; rIdx++) {
        const rib = ribbons[rIdx];
        const baseY =
          cy +
          rib.yOffset * height -
          scroll.y * (0.1 + rIdx * 0.04) +
          Math.sin(scroll.progress * Math.PI) * 35;

        const topPoints = [];
        const bottomPoints = [];

        for (let x = -36; x <= width + 36; x += stepX) {
          const wave1 = Math.sin(x * rib.frequency + time * (rib.speed * 60) + rib.phase) * rib.amplitude;
          const wave2 = Math.cos(x * rib.frequency * 1.7 - time * 0.8 + rIdx) * (rib.amplitude * 0.35);

          const dx = x - pointer.x;
          const dy = baseY + wave1 - pointer.y;
          const distSq = dx * dx + dy * dy;
          let influence = 0;
          let cursorBend = 0;
          if (distSq < 102400) {
            influence = 1 - Math.sqrt(distSq) / 320;
            cursorBend =
              influence * influence * ((pointer.y - (baseY + wave1)) * -0.38 + pointer.vy * 1.5);
          }

          const yTop = baseY + wave1 + wave2 + cursorBend;
          const thicknessMod =
            rib.thickness + Math.sin(x * 0.004 + time + rIdx) * 24 + influence * 24;

          topPoints.push({ x, y: yTop });
          bottomPoints.push({ x, y: yTop + thicknessMod });
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(topPoints[0].x, topPoints[0].y);
        for (let i = 1; i < topPoints.length; i++) {
          const prev = topPoints[i - 1];
          const curr = topPoints[i];
          ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) * 0.5, (prev.y + curr.y) * 0.5);
        }
        for (let i = bottomPoints.length - 1; i >= 0; i--) {
          ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
        }
        ctx.closePath();

        const ribGrad = ctx.createLinearGradient(0, baseY - 90, 0, baseY + 170);
        ribGrad.addColorStop(0, rib.colorTop);
        ribGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
        ribGrad.addColorStop(1, rib.colorBottom);
        ctx.fillStyle = ribGrad;
        ctx.globalAlpha = globalOpacity;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(topPoints[0].x, topPoints[0].y);
        for (let i = 1; i < topPoints.length; i++) {
          const prev = topPoints[i - 1];
          const curr = topPoints[i];
          ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) * 0.5, (prev.y + curr.y) * 0.5);
        }
        ctx.strokeStyle = rib.stroke;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      }

      // =====================================================================
      // STEP 3: ORGANIC 3D WAVE FORMATION (BATCHED DRAW CALLS)
      // =====================================================================
      if (activeLanding) {
        const spacingX = (width * 1.45) / waveCols;
        const spacingZ = 38;
        const pitchAngle = (0.42 + scroll.progress * 0.16 + normMY * 0.04) * 0.15;
        const yawAngle = normMX * 0.07 + Math.sin(time * 0.2) * 0.03;
        const scrollWaveShift = (scroll.y * 0.16) % 240;

        ctx.save();
        ctx.strokeStyle = `rgba(119, 101, 232, ${0.12 * globalOpacity})`;
        ctx.lineWidth = 0.85;
        ctx.beginPath();

        const normalNodes = [];
        const energizedNodes = [];

        for (let r = 0; r < waveRows; r++) {
          let rowStarted = false;
          const wz = r * spacingZ + 40;
          const roughScale = fov / (fov + wz);

          for (let c = 0; c < waveCols; c++) {
            const wx = (c - waveCols * 0.5) * spacingX;
            const waveElevation =
              Math.sin(c * 0.24 + time * 1.4 + r * 0.3) * 26 +
              Math.cos(r * 0.45 - time * 1.0 + c * 0.12) * 18;

            let wy = height * 0.30 + waveElevation - scrollWaveShift;

            const roughSX = cx + wx * roughScale;
            const roughSY = cy + wy * roughScale;
            const cdx = roughSX - pointer.x;
            const cdy = roughSY - pointer.y;
            const cDistSq = cdx * cdx + cdy * cdy;

            let energized = 0;
            if (cDistSq < 52900) {
              const cDist = Math.sqrt(cDistSq);
              const factor = 1 - cDist / 230;
              energized = factor;
              wy += Math.cos((cDist / 230) * Math.PI * 1.5 - time * 3) * factor * factor * 42;
            }

            const [rx, ry, rz] = rotate3D(wx, wy, wz, pitchAngle, yawAngle, 0);
            const depth = fov + rz;
            if (depth > 40) {
              const scale = fov / depth;
              const sx = cx + rx * scale;
              const sy = cy + ry * scale;

              if (!rowStarted) {
                ctx.moveTo(sx, sy);
                rowStarted = true;
              } else {
                ctx.lineTo(sx, sy);
              }

              const radius = Math.max(0.8, (1.5 + energized * 1.6) * scale);
              if (energized > 0.2) {
                energizedNodes.push({ sx, sy, radius });
              } else {
                normalNodes.push({ sx, sy, radius });
              }
            }
          }
        }
        ctx.stroke();

        // Batch fill standard wave nodes in 1 draw call
        ctx.fillStyle = `rgba(143, 169, 254, ${0.32 * globalOpacity})`;
        ctx.beginPath();
        for (let i = 0; i < normalNodes.length; i++) {
          const n = normalNodes[i];
          ctx.moveTo(n.sx + n.radius, n.sy);
          ctx.arc(n.sx, n.sy, n.radius, 0, Math.PI * 2);
        }
        ctx.fill();

        // Batch fill cursor-energized wave nodes in 1 draw call
        if (energizedNodes.length > 0) {
          ctx.fillStyle = `rgba(119, 101, 232, ${0.68 * globalOpacity})`;
          ctx.beginPath();
          for (let i = 0; i < energizedNodes.length; i++) {
            const n = energizedNodes[i];
            ctx.moveTo(n.sx + n.radius, n.sy);
            ctx.arc(n.sx, n.sy, n.radius, 0, Math.PI * 2);
          }
          ctx.fill();
        }
        ctx.restore();
      }

      // =====================================================================
      // STEP 4: 3D TRANSLUCENT GEOMETRIC STRUCTURES
      // =====================================================================
      if (activeLanding || width > 1024) {
        const activeStructures = activeLanding ? structures : structures.slice(0, 2);

        for (let sIdx = 0; sIdx < activeStructures.length; sIdx++) {
          const st = activeStructures[sIdx];
          st.rx += st.drx * dt + pointer.vy * 0.0002;
          st.ry += st.dry * dt + pointer.vx * 0.0002;
          st.rz += st.drz * dt;

          const worldX = st.anchorX * width - normMX * (30 * st.parallax);
          const worldY =
            st.anchorY * height -
            scroll.y * st.parallax +
            Math.sin(time * 0.9 + sIdx * 1.7) * 16 -
            normMY * (22 * st.parallax);
          const worldZ = st.z + Math.sin(scroll.progress * Math.PI) * 55;

          const centerScale = fov / Math.max(fov + worldZ, 60);
          const screenCX = cx + worldX * centerScale;
          const screenCY = cy + worldY * centerScale;

          // Skip offscreen 3D structures
          if (screenCY < -140 || screenCY > height + 140) continue;

          const distToMouse = Math.hypot(screenCX - pointer.x, screenCY - pointer.y);
          const structureGlow = Math.max(0, 1 - distToMouse / 300);

          const projectedVerts = st.geom.vertices.map(([vx, vy, vz]) => {
            const [rx, ry, rz] = rotate3D(
              vx * st.radius,
              vy * st.radius,
              vz * st.radius,
              st.rx,
              st.ry,
              st.rz
            );
            const px = worldX + rx;
            const py = worldY + ry;
            const pz = worldZ + rz;
            const scale = fov / Math.max(fov + pz, 60);
            return {
              x: cx + px * scale,
              y: cy + py * scale,
              z: pz,
              rx,
              ry,
              rz,
              scale
            };
          });

          const lx = -0.4 + normMX * 0.3;
          const ly = -0.6 + normMY * 0.3;
          const lz = -0.7;
          const lLen = Math.hypot(lx, ly, lz);

          const sortedFaces = st.geom.faces
            .map(([i0, i1, i2]) => {
              const v0 = projectedVerts[i0];
              const v1 = projectedVerts[i1];
              const v2 = projectedVerts[i2];
              const avgZ = (v0.z + v1.z + v2.z) / 3;

              const ux = v1.rx - v0.rx, uy = v1.ry - v0.ry, uz = v1.rz - v0.rz;
              const wx = v2.rx - v0.rx, wy = v2.ry - v0.ry, wz = v2.rz - v0.rz;
              const nx = uy * wz - uz * wy;
              const ny = uz * wx - ux * wz;
              const nz = ux * wy - uy * wx;
              const nLen = Math.hypot(nx, ny, nz) || 1;
              const dot = Math.max(0, (nx * lx + ny * ly + nz * lz) / (nLen * lLen));

              return { v0, v1, v2, avgZ, light: dot };
            })
            .sort((a, b) => b.avgZ - a.avgZ);

          ctx.save();
          for (let f = 0; f < sortedFaces.length; f++) {
            const { v0, v1, v2, light } = sortedFaces[f];
            ctx.beginPath();
            ctx.moveTo(v0.x, v0.y);
            ctx.lineTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.closePath();

            const alphaBase = (0.045 + light * 0.13 + structureGlow * 0.08) * globalOpacity;
            ctx.fillStyle = `rgba(${st.tint.r}, ${st.tint.g}, ${st.tint.b}, ${alphaBase})`;
            ctx.fill();
          }

          // Batch all edges of the polyhedron into 1 stroke call
          ctx.beginPath();
          for (let e = 0; e < st.geom.edges.length; e++) {
            const [u, v] = st.geom.edges[e];
            const p1 = projectedVerts[u];
            const p2 = projectedVerts[v];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.48 + structureGlow * 0.3) * globalOpacity})`;
          ctx.lineWidth = 1.05;
          ctx.stroke();

          // Batch all vertices into 1 fill call
          ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * globalOpacity})`;
          ctx.beginPath();
          for (let v = 0; v < projectedVerts.length; v++) {
            const pt = projectedVerts[v];
            const r = (1.9 + structureGlow * 1.2) * pt.scale;
            ctx.moveTo(pt.x + r, pt.y);
            ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
          }
          ctx.fill();

          // Orbital ring
          ctx.beginPath();
          const orbitRadius = st.radius * 1.42 * centerScale;
          ctx.ellipse(
            screenCX,
            screenCY,
            orbitRadius,
            orbitRadius * 0.36,
            st.rz * 0.6 + 0.4,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = `rgba(119, 101, 232, ${(0.16 + structureGlow * 0.2) * globalOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
      }

      // =====================================================================
      // STEP 5: 3D PARTICLE STREAMS & NEURAL PLEXUS CONNECTIONS
      // =====================================================================
      projectedParticles.length = 0;
      const streamFlowAngle = scroll.progress * Math.PI * 0.42;
      const cosFlow = Math.cos(streamFlowAngle);
      const sinFlow = Math.sin(streamFlowAngle);
      const activeParticleLimit = activeLanding
        ? particles.length
        : Math.floor(particles.length * 0.55);

      const forceRadiusSq = forceRadius * forceRadius;
      const boundX = width * 0.85;
      const boundY = height * 0.85;

      for (let i = 0; i < activeParticleLimit; i++) {
        const p = particles[i];

        const flowSpeed = p.speed * dt * 1.35;
        p.ox += flowSpeed * cosFlow;
        p.oy += flowSpeed * sinFlow + Math.sin(time * 0.9 + p.phase) * 0.25;

        if (p.ox > boundX) p.ox = -boundX;
        else if (p.ox < -boundX) p.ox = boundX;
        if (p.oy > boundY) p.oy = -boundY;
        else if (p.oy < -boundY) p.oy = boundY;

        const zScrolled = ((p.oz - scroll.y * 0.32) % 900 + 900) % 900 - 250;
        const scale = fov / Math.max(fov + zScrolled, 50);

        const targetScreenX = cx + (p.ox - normMX * 24) * scale;
        const targetScreenY =
          cy +
          (p.oy + Math.sin(p.ox * 0.004 + time + p.band) * 38 - normMY * 24) * scale;

        const dx = p.x + cx - pointer.x;
        const dy = p.y + cy - pointer.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < forceRadiusSq && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const normDist = 1 - dist / forceRadius;
          const force = normDist * normDist * 2.4;
          const invDist = 1 / dist;

          const rx = dx * invDist * force;
          const tx = -dy * invDist * force * 0.42;
          const ry = dy * invDist * force;
          const ty = dx * invDist * force * 0.42;

          p.vx += (rx + tx) * 1.35 + pointer.vx * 0.035 * normDist;
          p.vy += (ry + ty) * 1.35 + pointer.vy * 0.035 * normDist;
        }

        p.vx += (targetScreenX - cx - p.x) * 0.055;
        p.vy += (targetScreenY - cy - p.y) * 0.055;
        p.vx *= 0.86;
        p.vy *= 0.86;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const sx = cx + p.x;
        const sy = cy + p.y;

        if (sx >= -30 && sx <= width + 30 && sy >= -30 && sy <= height + 30) {
          const cDistSq = (sx - pointer.x) * (sx - pointer.x) + (sy - pointer.y) * (sy - pointer.y);
          const maxBoostRadius = forceRadius * 1.3;
          const cursorBoost =
            cDistSq < maxBoostRadius * maxBoostRadius
              ? 1 - Math.sqrt(cDistSq) / maxBoostRadius
              : 0;
          const depthAlpha = Math.min(1, Math.max(0.12, (650 - zScrolled) / 850));

          projectedParticles.push({
            sx,
            sy,
            scale,
            p,
            cursorBoost,
            alpha: p.alpha * depthAlpha * globalOpacity
          });
        }
      }

      // Draw Neural Constellation Connections
      const maxConnectDist = activeLanding ? 120 : 90;
      const maxConnectDistSq = maxConnectDist * maxConnectDist;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = `rgba(143, 169, 254, ${0.16 * globalOpacity})`;
      ctx.lineWidth = 0.7;

      for (let i = 0; i < projectedParticles.length; i++) {
        const a = projectedParticles[i];
        if (!a.p.isHub && a.cursorBoost < 0.15) continue;

        let connections = 0;
        for (let j = i + 1; j < projectedParticles.length; j++) {
          const b = projectedParticles[j];
          const dx = a.sx - b.sx;
          const dy = a.sy - b.sy;
          const dSq = dx * dx + dy * dy;

          if (dSq < maxConnectDistSq) {
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            connections++;
            if (connections >= 4) break;
          }
        }
      }
      ctx.stroke();

      // Highlighted cursor synapses in a single batched path
      ctx.beginPath();
      ctx.strokeStyle = `rgba(119, 101, 232, ${0.28 * globalOpacity})`;
      ctx.lineWidth = 0.85;
      for (let i = 0; i < projectedParticles.length; i++) {
        const a = projectedParticles[i];
        if (a.cursorBoost > 0.55) {
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(pointer.x, pointer.y);
        }
      }
      ctx.stroke();

      // Draw Particles (Fast halo + core circles without per-frame gradient allocations)
      for (let i = 0; i < projectedParticles.length; i++) {
        const { sx, sy, scale, p, cursorBoost, alpha } = projectedParticles[i];
        const r = Math.max(0.9, p.size * scale * (1 + cursorBoost * 0.6));
        const finalAlpha = Math.min(0.95, alpha + cursorBoost * 0.35);

        if (p.isHub || cursorBoost > 0.35) {
          ctx.beginPath();
          ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${finalAlpha * 0.18})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${finalAlpha})`;
        ctx.fill();
      }
      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', onMotionChange);
      }
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
