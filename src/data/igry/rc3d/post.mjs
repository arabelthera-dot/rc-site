// rc3d · Постобработка: сглаживание MSAA, затенение в складках (GTAO), мягкое свечение ярких мест (bloom),
// виньетка, ACES и sRGB на выходе. "env":{"post":{"bloom":0.25,"ao":true,"vignette":0.3}}.
// Качество подстраивается само: если кадров меньше 24 в секунду, сначала отключается AO, потом свечение —
// на слабом телефоне игра идёт плавно, на нормальной видеокарте всё включено.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SLAB } from './chasticy.mjs';

const Vignette = {
  uniforms: { tDiffuse: { value: null }, uK: { value: 0.3 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uK; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - 0.5; c.rgb *= 1.0 - uK * smoothstep(0.25, 0.85, dot(d, d) * 2.2); gl_FragColor = c; }',
};

export class Post {
  constructor(renderer, camera, o = {}) {
    this.r = renderer; this.o = o; this.camera = camera;
    const s = renderer.getSize(new THREE.Vector2()), pr = renderer.getPixelRatio();
    const rt = new THREE.WebGLRenderTarget(s.x * pr || 800, s.y * pr || 500, { type: THREE.HalfFloatType, samples: SLAB ? 0 : (o.msaa ?? 4) });
    this.c = new EffectComposer(renderer, rt);
    this.rp = new RenderPass(null, camera); this.c.addPass(this.rp);
    if (o.ao && !SLAB) { this.ao = new GTAOPass(null, camera, s.x, s.y); this.ao.output = GTAOPass.OUTPUT.Default; this.ao.blendIntensity = o.ao === true ? 0.8 : o.ao; this.ao.updateGtaoMaterial({ radius: o.aoRadius ?? 0.6, distanceExponent: 1, thickness: 1, scale: 1, samples: 12 }); this.c.addPass(this.ao); }
    if (o.bloom) { this.bloom = new UnrealBloomPass(new THREE.Vector2(s.x / 2, s.y / 2), o.bloom, o.bloomRadius ?? 0.5, o.bloomThreshold ?? 0.92); this.c.addPass(this.bloom); }
    this.c.addPass(new OutputPass());
    if (o.vignette) { this.vig = new ShaderPass(Vignette); this.vig.uniforms.uK.value = o.vignette; this.c.addPass(this.vig); }
    this.level = 2; this.fpsT = 0; this.fpsN = 0; this.slow = 0;
  }
  setSize(w, h) { this.c.setPixelRatio(this.r.getPixelRatio()); this.c.setSize(w, h); }
  render(scene, camera, dt) {
    this.rp.scene = scene; this.rp.camera = camera; if (this.ao) { this.ao.scene = scene; this.ao.camera = camera; }
    this.c.render(dt);
    // Самоподстройка: по 2 секунды замера.
    if (this.o.adapt === false) return;
    this.fpsT += dt; this.fpsN++;
    if (this.fpsT >= 2) { const fps = this.fpsN / this.fpsT; this.fpsT = 0; this.fpsN = 0;
      if (fps < 24 && this.level > 0) { this.level--; if (this.level === 1 && this.ao) this.ao.enabled = false; else if (this.bloom) this.bloom.enabled = false; console.info('rc3d: качество снижено до', this.level, 'кадров', Math.round(fps)); } }
  }
}
