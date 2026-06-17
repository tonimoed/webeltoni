"use client";

import { useEffect, useRef } from "react";

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Additive blend (blendFunc SRC_ALPHA, ONE): this layer can ONLY add warm light,
// never subtract — so the moving wave illuminates the red background, it never
// darkens it. A travelling field of bright bands lifts the deep red toward a
// warm red-orange; neutral areas add nothing and the background shows untouched.
const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_res;
  uniform vec3 u_color;
  void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - u_res) / u_res.y;
    float a = 0.0;
    float d = 0.0;
    for (int i = 0; i < 4; i++) {
      a += cos(float(i) - d + u_time * 0.5 - a * uv.x);
      d += sin(float(i) * uv.y + a);
    }
    float wave = (sin(a) + cos(d)) * 0.5; // -1..1
    float light = wave * 0.5 + 0.5;       // 0..1 fluid moving field

    // additive light tint; alpha = how much light this pixel adds (gentle)
    gl_FragColor = vec4(u_color, light * 0.55);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

// Render at half resolution — the wave is soft, so the downscale is invisible
// but cuts fragment-shader work ~4×. CSS stretches the canvas back to full size.
const RES_SCALE = 0.5;
const TARGET_FPS = 30; // a background wave doesn't need 60fps; halves GPU/CPU cost
const FRAME_MS = 1000 / TARGET_FPS;

export default function DynamicWaveBackground({
  color = [0.55, 0.18, 0.06], // default warm red-orange (page 2)
}: {
  color?: [number, number, number];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // alpha:true → the canvas is transparent where the shader adds no light
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uColor = gl.getUniformLocation(prog, "u_color");
    gl.uniform3f(uColor, color[0], color[1], color[2]);

    // Additive blending — the layer only ever brightens the background.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    let animId = 0;
    let lastFrame = 0;
    let visible = true; // section on screen
    let active = true; // tab/window not hidden
    const t0 = performance.now();

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * RES_SCALE);
      canvas.height = Math.round(window.innerHeight * RES_SCALE);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      if (now - lastFrame < FRAME_MS) return; // throttle to TARGET_FPS
      lastFrame = now;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, (now - t0) * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const start = () => {
      if (animId || !visible || !active) return;
      lastFrame = 0;
      animId = requestAnimationFrame(render);
    };
    const stop = () => {
      cancelAnimationFrame(animId);
      animId = 0;
    };

    // Pause when the section scrolls off screen (frees the GPU for the rest of
    // the page) and when the tab is hidden.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      active = !document.hidden;
      if (active) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      stop();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 h-full w-full"
    />
  );
}
