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
  import { PixiRenderer, type RenderLayerSource } from '../lib/renderer/PixiRenderer'
  import { RepelForce } from '../lib/engine/physics/Forces'
  import { Vector2 } from '../lib/engine/physics/Vector2'
  import type { EmitterConfig } from '../lib/engine/types'
  import { livePreset } from '../stores/particleConfig'
  import {
    backgroundImage,
    useBackgroundImage,
    ambientGradient,
    highPerformanceMode,
    adaptiveQualityEnabled,
    adaptiveQualityScale,
  } from '../stores/appState'
  import { downloadScreenshot } from '../lib/scene/screenshot'
  import { presetMap } from '../lib/presets'

  const MIN_ADAPTIVE_SCALE = 0.45
  const ADAPTIVE_STEP_DOWN = 0.1
  const ADAPTIVE_STEP_UP = 0.05
  const LOW_FPS_THRESHOLD = 55
  const HIGH_FPS_THRESHOLD = 59

  let canvasContainer: HTMLDivElement
  let system: ParticleSystem | null = null
  let renderer: PixiRenderer | null = null
  let pixiApp: Application | null = null
  let mouseForce: RepelForce | null = null
  let mousePos: Vector2 | null = null
  let mounted = false
  let reinitVersion = 0
  let tickerCallback: ((ticker: { deltaTime: number; FPS: number }) => void) | null = null
  let lastHighPerformanceMode = false
  let adaptiveScale = 1
  let fpsEma = 60
  let lastAdaptiveAdjustAt = 0

  interface Layer {
    id: number
    system: ParticleSystem
    preset: string
    baseEmitter: EmitterConfig
    renderLayer: RenderLayerSource
  }
  let extraLayers: Layer[] = []
  let nextLayerId = 1
  const baseRenderLayer: RenderLayerSource = { layerId: 0, emitters: [] }
  const activeRenderLayers: RenderLayerSource[] = []

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

  function cloneEmitterConfig(source: EmitterConfig): EmitterConfig {
    return {
      ...source,
      spawnArea: { ...source.spawnArea },
      particleLifetime: [source.particleLifetime[0], source.particleLifetime[1]],
      initialSpeed: [source.initialSpeed[0], source.initialSpeed[1]],
      initialDirection: [source.initialDirection[0], source.initialDirection[1]],
      initialSize: [source.initialSize[0], source.initialSize[1]],
      initialRotation: [source.initialRotation[0], source.initialRotation[1]],
      initialOpacity: [source.initialOpacity[0], source.initialOpacity[1]],
      color: Array.isArray(source.color) ? [...source.color] : source.color,
    }
  }

  function applyScaledEmitterConfig(targetSystem: ParticleSystem, baseEmitter: EmitterConfig): void {
    if (targetSystem.emitters.length === 0) return

    const next = cloneEmitterConfig(baseEmitter)
    next.targetOnScreenParticles = Math.max(20, Math.round(next.targetOnScreenParticles * adaptiveScale))
    next.safetyCap = Math.max(
      next.targetOnScreenParticles,
      Math.round((next.safetyCap ?? next.targetOnScreenParticles * 1.8) * adaptiveScale),
    )
    targetSystem.emitters[0].config = next
  }

  function applyAdaptiveScaleToAllSystems(): void {
    if (system) {
      applyScaledEmitterConfig(system, $livePreset.emitter)
    }

    for (let i = 0; i < extraLayers.length; i++) {
      const layer = extraLayers[i]
      applyScaledEmitterConfig(layer.system, layer.baseEmitter)
    }
  }

  function updateAdaptiveQuality(fps: number): void {
    if (!$adaptiveQualityEnabled) {
      if (adaptiveScale !== 1) {
        adaptiveScale = 1
        adaptiveQualityScale.set(1)
        applyAdaptiveScaleToAllSystems()
      }
      return
    }

    fpsEma = fpsEma * 0.9 + fps * 0.1
    const now = performance.now()
    if (now - lastAdaptiveAdjustAt < 1000) return
    lastAdaptiveAdjustAt = now

    let nextScale = adaptiveScale
    if (fpsEma < LOW_FPS_THRESHOLD) {
      nextScale = Math.max(MIN_ADAPTIVE_SCALE, adaptiveScale - ADAPTIVE_STEP_DOWN)
    } else if (fpsEma > HIGH_FPS_THRESHOLD) {
      nextScale = Math.min(1, adaptiveScale + ADAPTIVE_STEP_UP)
    }

    if (Math.abs(nextScale - adaptiveScale) > 0.0001) {
      adaptiveScale = nextScale
      adaptiveQualityScale.set(Number(adaptiveScale.toFixed(2)))
      applyAdaptiveScaleToAllSystems()
    }
  }

  function handleResize(): void {
    const width = window.innerWidth
    const height = window.innerHeight
    system?.setBounds(width, height)
    for (let i = 0; i < extraLayers.length; i++) {
      extraLayers[i].system.setBounds(width, height)
    }
  }

  function handleMouseMove(e: MouseEvent): void {
    mousePos?.set(e.clientX, e.clientY)
  }

  function handleMouseLeave(): void {
    mousePos?.set(-9999, -9999)
  }

  function teardownRenderer(): void {
    if (pixiApp && tickerCallback) {
      pixiApp.ticker.remove(tickerCallback)
    }
    tickerCallback = null
    renderer?.destroy()
    renderer = null
    pixiApp?.destroy(true)
    pixiApp = null
    if (canvasContainer) {
      canvasContainer.innerHTML = ''
    }
  }

  async function initRenderer(): Promise<void> {
    if (!mounted || !canvasContainer) return

    const currentVersion = ++reinitVersion
    teardownRenderer()

    const app = new Application()
    await app.init({
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: !$highPerformanceMode,
      resolution: $highPerformanceMode ? 1 : Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    })

    if (!mounted || currentVersion !== reinitVersion) {
      app.destroy(true)
      return
    }

    canvasContainer.appendChild(app.canvas)
    pixiApp = app
    renderer = new PixiRenderer(app)

    tickerCallback = (ticker) => {
      const dt = ticker.deltaTime / 60

      activeRenderLayers.length = 0
      if (system) {
        system.update(dt)
        baseRenderLayer.emitters = system.emitters
        activeRenderLayers.push(baseRenderLayer)
      }

      for (let i = 0; i < extraLayers.length; i++) {
        const layer = extraLayers[i]
        layer.system.update(dt)
        activeRenderLayers.push(layer.renderLayer)
      }

      renderer?.sync(activeRenderLayers)
      updateAdaptiveQuality(ticker.FPS || 60)
    }

    app.ticker.add(tickerCallback)
  }

  export function apply(): void {
    if (!system) return
    system.clear()
    system.loadPreset($livePreset)
    if (mouseForce) system.addForce(mouseForce)
    applyScaledEmitterConfig(system, $livePreset.emitter)
  }

  export function clear(): void {
    if (system) {
      for (const emitter of system.emitters) {
        emitter.clear()
      }
    }
    for (const layer of extraLayers) {
      layer.system.clear()
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

    const layerId = nextLayerId++
    const baseEmitter = cloneEmitterConfig(preset.emitter)
    const layerSystem = new ParticleSystem()
    layerSystem.setBounds(window.innerWidth, window.innerHeight)
    layerSystem.loadPreset(preset)
    if (mouseForce) layerSystem.addForce(mouseForce)
    applyScaledEmitterConfig(layerSystem, baseEmitter)

    extraLayers = [
      ...extraLayers,
      {
        id: layerId,
        system: layerSystem,
        preset: presetName,
        baseEmitter,
        renderLayer: {
          layerId,
          emitters: layerSystem.emitters,
        },
      },
    ]
  }

  export function removeLayer(index: number): void {
    if (index < 0 || index >= extraLayers.length) return
    const layer = extraLayers[index]
    layer.system.clear()
    renderer?.destroyLayer(layer.id)
    extraLayers = extraLayers.filter((_, i) => i !== index)
  }

  export function getLayerCount(): number {
    return extraLayers.length
  }

  $effect(() => {
    const preset = $livePreset
    if (system && system.emitters.length > 0) {
      applyScaledEmitterConfig(system, preset.emitter)
    }
  })

  $effect(() => {
    const highPerf = $highPerformanceMode
    if (!mounted) {
      lastHighPerformanceMode = highPerf
      return
    }

    if (highPerf !== lastHighPerformanceMode) {
      lastHighPerformanceMode = highPerf
      void initRenderer()
    }
  })

  $effect(() => {
    const adaptiveEnabled = $adaptiveQualityEnabled
    if (!adaptiveEnabled && adaptiveScale !== 1) {
      adaptiveScale = 1
      adaptiveQualityScale.set(1)
      applyAdaptiveScaleToAllSystems()
    }
  })

  onMount(() => {
    mounted = true
    system = new ParticleSystem()
    system.setBounds(window.innerWidth, window.innerHeight)
    system.loadPreset($livePreset)
    mousePos = new Vector2(-9999, -9999)
    mouseForce = new RepelForce(mousePos, 120, 100)
    system.addForce(mouseForce)
    adaptiveQualityScale.set(1)

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    void initRenderer()

    return () => {
      mounted = false
      reinitVersion += 1
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      teardownRenderer()
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
