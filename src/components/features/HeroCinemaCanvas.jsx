import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 centered = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 mouseCentered = (uMouse - 0.5) * vec2(aspect, 1.0);

    float dist = length(centered - mouseCentered * 0.35);
    float anamorphicStreak = exp(-abs(centered.y - mouseCentered.y * 0.25) * 9.5) *
                             exp(-abs(centered.x - mouseCentered.x * 0.35) * 1.4);

    float weave = sin(uTime * 1.4 + uv.y * 4.0) * 0.015;
    float radialGlow = exp(-dist * 2.1);

    // Desaturated Cinnabar Vermilion (#c83a2b) and Archival Brass (#b87d24)
    vec3 vermilion = vec3(0.784, 0.227, 0.169);
    vec3 tungsten = vec3(0.722, 0.490, 0.141);
    vec3 obsidian = vec3(0.047, 0.047, 0.055);

    vec3 color = obsidian;
    color += vermilion * (radialGlow * 0.24 + anamorphicStreak * 0.30);
    color += tungsten * (anamorphicStreak * 0.20 + max(0.0, weave));

    float grain = (hash(uv * uResolution * 0.25 + fract(uTime)) - 0.5) * 0.03;
    color += grain;

    float vignette = smoothstep(1.35, 0.25, length(centered));
    gl_FragColor = vec4(color * vignette, 0.48);
  }
`;

/**
 * Purpose-built Three.js WebGL Anamorphic Projection Light-Leak & Film-Weave Shader Canvas.
 * Detects software WebGL (SwiftShader/llvmpipe) to use on-demand rendering so headless browsers never stall.
 */
const HeroCinemaCanvas = () => {
  const mountRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || typeof window === 'undefined') return undefined;

    const motionQuery = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    if (motionQuery?.matches) {
      return undefined;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch {
      setWebglSupported(false);
      return undefined;
    }

    // Detect software GL (SwiftShader / llvmpipe) to avoid CPU saturation
    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererInfo = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
      : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(rendererInfo);

    const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    const initialWidth = container.clientWidth || window.innerWidth;
    const initialHeight = container.clientHeight || 680;
    renderer.setSize(initialWidth, initialHeight);

    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'w-full h-full block pointer-events-none';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uTime: { value: 1.2 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(initialWidth, initialHeight) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Always draw initial frame immediately
    renderer.render(scene, camera);

    const targetMouse = { x: 0.5, y: 0.5 };
    let lastPointerTime = 0;
    let isVisibleInViewport = true;
    let isDocumentVisible = !document.hidden;
    let isContextLost = false;
    let rafId = null;
    const startTime = performance.now();

    const renderLoop = (now) => {
      if (isSoftwareGl || !isVisibleInViewport || !isDocumentVisible || isContextLost) {
        rafId = null;
        return;
      }

      uniforms.uTime.value = (now - startTime) * 0.001;
      uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.06;
      uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.06;

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(renderLoop);
    };

    const startLoop = () => {
      if (isSoftwareGl) {
        renderer.render(scene, camera);
        return;
      }
      if (rafId === null && isVisibleInViewport && isDocumentVisible && !isContextLost) {
        rafId = window.requestAnimationFrame(renderLoop);
      }
    };

    const stopLoop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handlePointerMove = (e) => {
      const now = performance.now();
      if (now - lastPointerTime < 32) return;
      lastPointerTime = now;
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        targetMouse.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        targetMouse.y = Math.min(1, Math.max(0, 1.0 - (e.clientY - rect.top) / rect.height));
        if (isSoftwareGl && !isContextLost) {
          uniforms.uMouse.value.set(targetMouse.x, targetMouse.y);
          renderer.render(scene, camera);
        }
      }
    };

    const handleResize = () => {
      if (!container || isContextLost) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 680;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
      if (isSoftwareGl) {
        renderer.render(scene, camera);
      }
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };

    const handleContextLost = (e) => {
      e.preventDefault();
      isContextLost = true;
      stopLoop();
    };

    const handleContextRestored = () => {
      isContextLost = false;
      startLoop();
    };

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              isVisibleInViewport = Boolean(entry?.isIntersecting);
              if (isVisibleInViewport) {
                startLoop();
              } else {
                stopLoop();
              }
            },
            { threshold: 0.05 }
          )
        : null;

    if (observer) observer.observe(container);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    startLoop();

    return () => {
      stopLoop();
      if (observer) observer.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  if (!webglSupported) return null;

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
    />
  );
};

export default HeroCinemaCanvas;
