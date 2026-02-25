<script lang="ts" module>
  export interface CanvasApi {
    apply: () => void
    clear: () => void
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { Application } from 'pixi.js'
  import { ParticleSystem } from '../lib/engine/ParticleSystem'
  import { PixiRenderer } from '../lib/renderer/PixiRenderer'
  import { RepelForce } from '../lib/engine/physics/Forces'
  import { Vector2 } from '../lib/engine/physics/Vector2'
  import { livePreset } from '../stores/particleConfig'
  import { backgroundColor, backgroundImage, useBackgroundImage } from '../stores/appState'

  let canvasContainer: HTMLDivElement
  let system: ParticleSystem | null = null
  let renderer: PixiRenderer | null = null
  let pixiApp: Application | null = null
  let mouseForce: RepelForce | null = null

  export function apply(): void {
    if (!system) return
    system.clear()
    system.loadPreset($livePreset)
    if (mouseForce) system.addForce(mouseForce)
  }

  export function clear(): void {
    if (!system) return
    for (const emitter of system.emitters) {
      emitter.clear()
    }
    renderer?.clear()
  }

  $effect(() => {
    const preset = $livePreset
    if (system && system.emitters.length > 0) {
      system.emitters[0].config = { ...preset.emitter }
    }
  })

  $effect(() => {
    const color = $backgroundColor
    const useBg = $useBackgroundImage
    if (pixiApp && !useBg) {
      pixiApp.renderer.background.color = parseInt(color.replace('#', ''), 16)
    }
  })

  onMount(async () => {
    pixiApp = new Application()
    const initBg = parseInt($backgroundColor.replace('#', ''), 16)

    await pixiApp.init({
      resizeTo: window,
      background: initBg,
      antialias: true,
    })

    canvasContainer.appendChild(pixiApp.canvas)

    system = new ParticleSystem()
    system.setBounds(window.innerWidth, window.innerHeight)
    system.loadPreset($livePreset)

    renderer = new PixiRenderer(pixiApp)

    const mousePos = new Vector2(-9999, -9999)
    mouseForce = new RepelForce(mousePos, 120, 100)
    system.addForce(mouseForce)

    window.addEventListener('resize', () => {
      system?.setBounds(window.innerWidth, window.innerHeight)
    })

    window.addEventListener('mousemove', (e) => {
      mousePos.set(e.clientX, e.clientY)
    })

    window.addEventListener('mouseleave', () => {
      mousePos.set(-9999, -9999)
    })

    pixiApp.ticker.add((ticker) => {
      const dt = ticker.deltaTime / 60
      system?.update(dt)
      if (system) renderer?.sync(system)
    })

    return () => {
      renderer?.destroy()
      pixiApp?.destroy(true)
    }
  })
</script>

<div
  bind:this={canvasContainer}
  class="canvas-container"
  style:background-image={$useBackgroundImage && $backgroundImage ? `url(${$backgroundImage})` : 'none'}
  style:background-size="cover"
  style:background-position="center"
></div>

<style>
  .canvas-container {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
  }

  .canvas-container :global(canvas) {
    display: block;
  }
</style>
