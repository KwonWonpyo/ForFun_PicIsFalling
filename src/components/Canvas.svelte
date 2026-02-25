<script lang="ts" module>
  export interface CanvasApi {
    apply: () => void
    clear: () => void
    screenshot: () => void
    addLayer: (presetName: string) => void
    removeLayer: (index: number) => void
    getLayerCount: () => number
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
  import { backgroundImage, useBackgroundImage, ambientGradient } from '../stores/appState'
  import { downloadScreenshot } from '../lib/scene/screenshot'
  import { presetMap } from '../lib/presets'

  let canvasContainer: HTMLDivElement
  let system: ParticleSystem | null = null
  let renderer: PixiRenderer | null = null
  let pixiApp: Application | null = null
  let mouseForce: RepelForce | null = null

  interface Layer {
    system: ParticleSystem
    renderer: PixiRenderer
    preset: string
  }
  let extraLayers: Layer[] = []

  let bgStyle = $derived.by(() => {
    const ambient = $ambientGradient
    if (ambient) return ambient

    const preset = $livePreset

    if ($useBackgroundImage && $backgroundImage) {
      return `url(${$backgroundImage})`
    }

    if (preset.background?.type === 'gradient' && preset.background.gradient) {
      return preset.background.gradient
    }

    return 'none'
  })

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

  export function screenshot(): void {
    if (pixiApp) downloadScreenshot(pixiApp)
  }

  export function addLayer(presetName: string): void {
    if (!pixiApp) return
    const preset = presetMap[presetName]
    if (!preset) return

    const layerSystem = new ParticleSystem()
    layerSystem.setBounds(window.innerWidth, window.innerHeight)
    layerSystem.loadPreset(preset)
    if (mouseForce) layerSystem.addForce(mouseForce)

    const layerRenderer = new PixiRenderer(pixiApp)
    extraLayers = [...extraLayers, { system: layerSystem, renderer: layerRenderer, preset: presetName }]
  }

  export function removeLayer(index: number): void {
    if (index < 0 || index >= extraLayers.length) return
    const layer = extraLayers[index]
    layer.system.clear()
    layer.renderer.clear()
    layer.renderer.destroy()
    extraLayers = extraLayers.filter((_, i) => i !== index)
  }

  export function getLayerCount(): number {
    return extraLayers.length
  }

  $effect(() => {
    const preset = $livePreset
    if (system && system.emitters.length > 0) {
      system.emitters[0].config = { ...preset.emitter }
    }
  })

  onMount(async () => {
    pixiApp = new Application()

    await pixiApp.init({
      resizeTo: window,
      backgroundAlpha: 0,
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
      for (const layer of extraLayers) {
        layer.system.setBounds(window.innerWidth, window.innerHeight)
      }
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

      for (const layer of extraLayers) {
        layer.system.update(dt)
        layer.renderer.sync(layer.system)
      }
    })

    return () => {
      for (const layer of extraLayers) {
        layer.renderer.destroy()
      }
      renderer?.destroy()
      pixiApp?.destroy(true)
    }
  })
</script>

<div
  bind:this={canvasContainer}
  class="canvas-container"
  style:background-image={bgStyle}
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
    transition: background-image 0.8s ease;
  }

  .canvas-container :global(canvas) {
    display: block;
  }
</style>
