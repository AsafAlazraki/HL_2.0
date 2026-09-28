/* ============================================================
   THE WATER — board A's graft onto board C (the judge, 2026-09-28):
   "the live WebGL water ... becomes the ground of C's blue band only
   (Entry, Home's head, the mark) ... That gives the logo its
   showpiece and gives C its one living surface, where decoration is
   allowed."

   A fragment shader of about two kilobytes and no library: four
   crossed sine swells, bent by a slow drift and raised to the fifth
   power into caustic threads, lit by a soft cone where the name
   stands. It is DECORATION AND NOTHING IN IT IS A FIGURE.

   ITS COLOURS ARE THE TOKENS'. `--water-deep` and `--water-lit` are
   derived from `--color-accent` (tokens.css), read off the canvas's
   own computed style and turned into RGB by a one-pixel 2D canvas —
   so Northside's accent sets the water, and a literal colour never
   appears here.

   WHITE TYPE ON IT IS MEASURED BY CONSTRUCTION. Board A capped each
   channel at 0.43, which holds white at 5.1 : 1 on a navy ground but
   turns a blue band teal wherever the blue channel is clipped. This
   caps LUMINANCE instead, in linear light, keeping the hue: no pixel
   is brighter than 0.13 — the accent's own, blue-600's 0.132 — so
   white on the brightest ripple is at least (1.05 / 0.18) = 5.8 : 1
   and blue-50 at least 5.2 : 1, whatever the ripple does.

   IT STOPS: one still frame under reduced motion; no frames while the
   tab is hidden, while the band is off the screen, or while a caret
   is in a field (`data-still`, src/ui/MotionRoot.tsx). Under reduced
   transparency the canvas is not drawn at all and the band's own
   gradient stands (water.css). Drawn at half resolution: board A
   measured 11.7 ms a frame at 1440 × 900 on this desk's software
   renderer at half, 28.6 at full; the band is a sixth of that area.
   ============================================================ */

const VERTEX = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

const FRAGMENT = `precision mediump float;
uniform vec2 R;uniform float T;uniform vec3 D;uniform vec3 L;uniform vec2 C;uniform float CAP;uniform float S;
float w(vec2 p,float a,float k,float s){return sin(dot(p,vec2(cos(a),sin(a)))*k+T*s);}
vec3 lin(vec3 c){return pow(c,vec3(2.2));}
vec3 enc(vec3 c){return pow(c,vec3(1./2.2));}
void main(){
  vec2 f=gl_FragCoord.xy;vec2 p=f/S;
  p+=.35*vec2(sin(p.y*1.7+T*.23),cos(p.x*1.3-T*.19));
  float h=w(p,.3,3.1,.9)+w(p,1.9,2.7,-.7)+w(p,3.4,3.6,.6)+w(p,4.8,2.3,-.8);
  float c=pow(1.-abs(h)/4.,5.);
  vec2 q=(f-C)/R.y;float cone=exp(-dot(q*vec2(1.,1.6),q*vec2(1.,1.6))*2.2);
  float room=.28+.72*cone;
  vec3 col=mix(lin(D),lin(L),clamp(c*room*1.5+cone*.3,0.,1.));
  float y=dot(col,vec3(.2126,.7152,.0722));
  col*=min(1.,CAP/max(y,.0001));
  gl_FragColor=vec4(enc(col),1.);
}`

/** The luminance no pixel of the water exceeds: the accent's own. */
export const WATER_CAP = 0.13

/** The half of the pixels the water draws: soft light needs no more. */
const SCALE = 0.5

/**
 * HOW WIDE ONE SWELL IS, IN CSS PIXELS, BY THE SURFACE IT GROUNDS (2026-09-28, the components
 * critique, major 7). The shader measured its swell in drawn pixels, 110 of them at half
 * resolution — 220px of page — which suits a band as wide as a register and shows a 192px flag
 * less than half of one swell: "a faint diagonal sheen behind two letterspaced words". A band
 * keeps its broad swell; a flag or a crest takes the close one, so it holds two or three
 * swells and the caustic threads they cross into, and reads as water rather than a gradient.
 */
export const SWELL = { broad: 220, close: 76 } as const
export type Swell = keyof typeof SWELL

/** A token's colour as the graphics card wants it, 0–1 per channel, read off the element's style. */
function rgbOf(el: Element, name: string): [number, number, number] | null {
  const value = getComputedStyle(el).getPropertyValue(name).trim()
  if (!value) return null
  const probe = document.createElement('canvas')
  probe.width = 1
  probe.height = 1
  const ctx = probe.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0]! / 255, d[1]! / 255, d[2]! / 255]
}

export interface WaterOptions {
  /** Whether it should stand still right now — motion reduced, or its screen asking — and
   *  draw one frame and stop. */
  reduced: () => boolean
  /** The swell the surface is sized for; a band's broad one where none is named. */
  swell?: Swell
}

/** A running water: stop it for good, or wake it after whatever held it still has let go. */
export interface Flowing {
  stop: () => void
  wake: () => void
}

/**
 * Start the water on a canvas that fills its band. Returns how to stop and wake it, or null
 * where the browser has no WebGL — and then the band's own gradient is what stands.
 */
export function startWater(canvas: HTMLCanvasElement, options: WaterOptions): Flowing | null {
  const gl = canvas.getContext('webgl', {
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  })
  if (!gl) return null
  const shader = (type: number, source: string): WebGLShader | null => {
    const s = gl.createShader(type)
    if (!s) return null
    gl.shaderSource(s, source)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = shader(gl.VERTEX_SHADER, VERTEX)
  const fs = shader(gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const at = gl.getAttribLocation(program, 'p')
  gl.enableVertexAttribArray(at)
  gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0)
  const u = (name: string): WebGLUniformLocation | null => gl.getUniformLocation(program, name)

  const paint = (): void => {
    const deep = rgbOf(canvas, '--water-deep')
    const lit = rgbOf(canvas, '--water-lit')
    if (deep) gl.uniform3fv(u('D'), deep)
    if (lit) gl.uniform3fv(u('L'), lit)
  }
  const size = (): void => {
    const w = Math.max(1, Math.round(canvas.clientWidth * SCALE))
    const h = Math.max(1, Math.round(canvas.clientHeight * SCALE))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, w, h)
    gl.uniform2f(u('R'), w, h)
    /* the light stands where the name does: a third of the way in, a little above the middle */
    gl.uniform2f(u('C'), w * 0.3, h * 0.6)
  }
  gl.uniform1f(u('CAP'), WATER_CAP)
  gl.uniform1f(u('S'), SWELL[options.swell ?? 'broad'] * SCALE)
  paint()
  size()

  let frame = 0
  let seen = true
  const began = performance.now()
  const still = (): boolean =>
    options.reduced() ||
    document.hidden ||
    !seen ||
    document.documentElement.hasAttribute('data-still')
  const draw = (now: number): void => {
    gl.uniform1f(u('T'), 8 + (now - began) / 1000)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  const tick = (now: number): void => {
    draw(now)
    frame = still() ? 0 : requestAnimationFrame(tick)
  }
  const wake = (): void => {
    if (frame === 0 && !still()) frame = requestAnimationFrame(tick)
  }

  /* one frame always, so a still band is still water and not a blank */
  draw(performance.now())
  wake()

  const resize = new ResizeObserver(() => {
    size()
    draw(performance.now())
  })
  resize.observe(canvas)
  const sight = new IntersectionObserver(([entry]) => {
    seen = entry?.isIntersecting ?? true
    wake()
  })
  sight.observe(canvas)
  const caret = new MutationObserver(wake)
  caret.observe(document.documentElement, { attributes: true, attributeFilter: ['data-still'] })
  document.addEventListener('visibilitychange', wake)

  return {
    wake,
    stop: () => {
      cancelAnimationFrame(frame)
      frame = 0
      resize.disconnect()
      sight.disconnect()
      caret.disconnect()
      document.removeEventListener('visibilitychange', wake)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
