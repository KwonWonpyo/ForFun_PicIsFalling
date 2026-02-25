<script lang="ts">
  import { onMount } from 'svelte'
  import { Application } from 'pixi.js'
  import { ParticleSystem } from '../lib/engine/ParticleSystem'
  import { PixiRenderer } from '../lib/renderer/PixiRenderer'
  import { snowPreset } from '../lib/presets'

  let canvasContainer: HTMLDivElement

  onMount(async () => {
    const app = new Application()

    await app.init({
      resizeTo: window,
      background: 0x0d182c,
      antialias: true,
    })

    canvasContainer.appendChild(app.canvas)

    const system = new ParticleSystem()
    system.setBounds(window.innerWidth, window.innerHeight)
    system.loadPreset(snowPreset)

    const renderer = new PixiRenderer(app)

    window.addEventListener('resize', () => {
      system.setBounds(window.innerWidth, window.innerHeight)
    })

    app.ticker.add((ticker) => {
      const dt = ticker.deltaTime / 60
      system.update(dt)
      renderer.sync(system)
    })

    return () => {
      renderer.destroy()
      app.destroy(true)
    }
  })
</script>

<div bind:this={canvasContainer} class="canvas-container"></div>

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
