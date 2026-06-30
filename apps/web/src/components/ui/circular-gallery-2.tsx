/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-spread */
'use client';

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';
import {
  feedCarouselPlaneFactors,
} from '@/lib/feed-carousel-layout';

function debounce(func: any, wait: number) {
  let timeout: any;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key: string) => {
    if (key !== 'constructor' && typeof (instance as any)[key] === 'function') {
      (instance as any)[key] = (instance as any)[key].bind(instance);
    }
  });
}

interface GalleryItem {
  image: string;
  text: string;
}

export type { GalleryItem };

interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
  activeIndex?: number;
  interactive?: boolean;
  centerHovered?: boolean;
  reduceMotion?: boolean;
  onActiveIndexChange?: (index: number) => void;
}

const PLANE_PADDING = 2;

class Media {
  app: any;
  extra: number;
  geometry: any;
  gl: any;
  image: string;
  index: number;
  length: number;
  renderer: any;
  scene: any;
  screen: any;
  viewport: any;
  bend: number;
  borderRadius: number;
  program: any;
  plane: any;
  x: any;
  speed: any;
  widthTotal: any;
  isBefore: any;
  isAfter: any;
  scale: any;
  padding: any;
  width: any;
  baseScaleX: number;
  baseScaleY: number;
  hoverScale: number;

  constructor({
    app,
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    viewport,
    bend,
    borderRadius = 0,
  }: any) {
    this.app = app;
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;
    this.borderRadius = borderRadius;
    this.baseScaleX = 1;
    this.baseScaleY = 1;
    this.hoverScale = 1;
    this.createShader();
    this.createMesh();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = 0.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }
  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }
  update(scroll: any, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }

    const isCenter = Math.abs(this.plane.position.x) < this.width * 0.15;
    const targetHover =
      !this.app.reduceMotion && this.app.centerHovered && isCenter ? 1.04 : 1;
    this.hoverScale = lerp(this.hoverScale, targetHover, 0.15);
    this.plane.scale.x = this.baseScaleX * this.hoverScale;
    this.plane.scale.y = this.baseScaleY * this.hoverScale;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
  }
  onResize({ screen, viewport }: any = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    const planeFactors = this.app?.planeFactors ?? feedCarouselPlaneFactors(window.innerWidth);
    this.scale = this.screen.height / 1500;
    this.baseScaleY =
      (this.viewport.height * (planeFactors.height * this.scale)) / this.screen.height;
    this.baseScaleX =
      (this.viewport.width * (planeFactors.width * this.scale)) / this.screen.width;
    this.hoverScale = 1;
    this.plane.scale.y = this.baseScaleY;
    this.plane.scale.x = this.baseScaleX;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = PLANE_PADDING;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: any;
  onCheckDebounce: any;
  renderer: any;
  gl: any;
  camera: any;
  scene: any;
  planeGeometry: any;
  mediasImages: any;
  medias: any;
  isDown: any;
  start: any;
  raf: any;
  boundOnResize: any;
  boundOnWheel: any;
  boundOnTouchDown: any;
  boundOnTouchMove: any;
  boundOnTouchUp: any;
  screen: any;
  viewport: any;
  lastTime: number;
  itemCount: number;
  lastActiveIndex: number;
  interactive: boolean;
  interactionListenersAttached: boolean;
  onActiveIndexChange?: (index: number) => void;
  planeFactors: { height: number; width: number };
  centerHovered: boolean;
  reduceMotion: boolean;

  constructor(
    container: HTMLElement,
    {
      items,
      bend,
      borderRadius = 0,
      scrollSpeed = 2,
      scrollEase = 0.08,
      onActiveIndexChange,
    }: {
      items?: GalleryItem[];
      bend?: number;
      borderRadius?: number;
      scrollSpeed?: number;
      scrollEase?: number;
      onActiveIndexChange?: (index: number) => void;
    } = {},
  ) {
    document.documentElement.classList.remove("no-js");
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.lastTime = performance.now();
    this.itemCount = 0;
    this.lastActiveIndex = -1;
    this.interactive = true;
    this.interactionListenersAttached = false;
    this.onActiveIndexChange = onActiveIndexChange;
    this.planeFactors = feedCarouselPlaneFactors(window.innerWidth);
    this.centerHovered = false;
    this.reduceMotion = false;
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, borderRadius);
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    });
  }
  createMedias(items: GalleryItem[] | undefined, bend = 1, borderRadius: number) {
    const defaultItems: GalleryItem[] = [
      { image: `https://picsum.photos/seed/1/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/2/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/3/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/4/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/5/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/16/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/17/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/8/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/9/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/10/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/21/800/600?grayscale`, text: '' },
      { image: `https://picsum.photos/seed/12/800/600?grayscale`, text: '' }
    ];
    const sourceItems = items && items.length ? items : defaultItems;
    this.itemCount = sourceItems.length;
    this.mediasImages = sourceItems.concat(sourceItems);
    this.medias = this.mediasImages.map((data: GalleryItem, index: number) => {
      return new Media({
        app: this,
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
        bend,
        borderRadius,
      });
    });
  }
  onTouchDown(e: any) {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
      return;
    }
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }
  onTouchMove(e: any) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }
  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }
  onWheel(e: any) {
    const delta = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  scrollToIndex(index: number) {
    if (!this.medias || !this.medias[0] || this.itemCount <= 0) return;
    const width = this.medias[0].width;
    const clamped = Math.max(0, Math.min(index, this.itemCount - 1));
    this.scroll.target = clamped * width;
    this.scroll.position = this.scroll.current;
    this.onCheck();
    this.lastActiveIndex = clamped;
  }
  onResize() {
    this.planeFactors = feedCarouselPlaneFactors(window.innerWidth);
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach((media: any) =>
        media.onResize({ screen: this.screen, viewport: this.viewport }),
      );
    }
  }
  update() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 16.667, 3);
    this.lastTime = now;

    const t = 1 - Math.pow(1 - this.scroll.ease, dt);
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, t);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach((media: any) => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;

    if (this.interactive && this.onActiveIndexChange && this.medias[0] && this.itemCount > 0) {
      const width = this.medias[0].width;
      const rawIndex = Math.round(Math.abs(this.scroll.current) / width);
      const index = rawIndex % this.itemCount;
      if (index !== this.lastActiveIndex) {
        this.lastActiveIndex = index;
        this.onActiveIndexChange(index);
      }
    }

    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    this.setInteractive(this.interactive);
  }
  addInteractionListeners() {
    if (this.interactionListenersAttached) return;
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener('mousewheel', this.boundOnWheel);
    window.addEventListener('wheel', this.boundOnWheel);
    window.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchstart', this.boundOnTouchDown, { passive: false });
    window.addEventListener('touchmove', this.boundOnTouchMove);
    window.addEventListener('touchend', this.boundOnTouchUp);
    this.interactionListenersAttached = true;
  }
  removeInteractionListeners() {
    if (!this.interactionListenersAttached) return;
    window.removeEventListener('mousewheel', this.boundOnWheel);
    window.removeEventListener('wheel', this.boundOnWheel);
    window.removeEventListener('mousedown', this.boundOnTouchDown);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchstart', this.boundOnTouchDown);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    this.interactionListenersAttached = false;
    this.isDown = false;
  }
  setInteractive(enabled: boolean) {
    this.interactive = enabled;
    if (enabled) this.addInteractionListeners();
    else this.removeInteractionListeners();
  }
  setCenterHovered(hovered: boolean) {
    this.centerHovered = hovered;
  }
  setReduceMotion(reduce: boolean) {
    this.reduceMotion = reduce;
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    this.removeInteractionListeners();
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export function CircularGallery({
  items = [],
  bend = 3,
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.08,
  activeIndex = 0,
  interactive = true,
  centerHovered = false,
  reduceMotion = false,
  onActiveIndexChange,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | undefined>(undefined);
  const onActiveRef = useRef(onActiveIndexChange);
  const activeFromWebGLRef = useRef(false);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  onActiveRef.current = onActiveIndexChange;

  useEffect(() => {
    let app: App | undefined;
    if (containerRef.current) {
      app = new App(containerRef.current, {
        items,
        bend,
        borderRadius,
        scrollSpeed,
        scrollEase,
        onActiveIndexChange: (index) => {
          activeFromWebGLRef.current = true;
          onActiveRef.current?.(index);
        },
      });
      appRef.current = app;
      app.scrollToIndex(activeIndexRef.current);
    }

    return () => {
      app?.destroy();
      appRef.current = undefined;
    };
  }, [items, bend, borderRadius, scrollSpeed, scrollEase]);

  useEffect(() => {
    if (activeFromWebGLRef.current) {
      activeFromWebGLRef.current = false;
      return;
    }
    appRef.current?.scrollToIndex(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    appRef.current?.setInteractive(interactive);
  }, [interactive]);

  useEffect(() => {
    appRef.current?.setCenterHovered(centerHovered);
  }, [centerHovered]);

  useEffect(() => {
    appRef.current?.setReduceMotion(reduceMotion);
  }, [reduceMotion]);

  return (
    <div
      className="h-full w-full touch-pan-y cursor-grab overflow-hidden active:cursor-grabbing"
      ref={containerRef}
    />
  );
}

export default CircularGallery;
