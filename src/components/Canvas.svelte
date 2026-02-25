<script lang="ts">
  import { onMount } from 'svelte'
  import { Application, Container, Graphics } from 'pixi.js'

  let canvasContainer: HTMLDivElement

  onMount(async () => {
    const app = new Application()

    await app.init({
      resizeTo: window,
      background: 0x0d182c,
      antialias: true,
    })

    canvasContainer.appendChild(app.canvas)

    const particleContainer = new Container()
    app.stage.addChild(particleContainer)

    const PARTICLE_COUNT = 200

    interface SnowParticle {
      graphic: Graphics
      x: number
      y: number
      speed: number
      wobbleSpeed: number
      wobblePhase: number
      size: number
      opacity: number
    }

    const particles: SnowParticle[] = []

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const size = Math.random() * 6 + 2
      const graphic = new Graphics()
        .circle(0, 0, size)
        .fill({ color: 0xffffff, alpha: Math.random() * 0.5 + 0.5 })

      graphic.x = Math.random() * window.innerWidth
      graphic.y = Math.random() * window.innerHeight

      particleContainer.addChild(graphic)

      particles.push({
        graphic,
        x: graphic.x,
        y: graphic.y,
        speed: Math.random() * 1.5 + 0.5,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        wobblePhase: Math.random() * Math.PI * 2,
        size,
        opacity: Math.random() * 0.5 + 0.5,
      })
    }

    app.ticker.add((ticker) => {
      const dt = ticker.deltaTime

      for (const p of particles) {
        p.y += p.speed * dt
        p.wobblePhase += p.wobbleSpeed * dt
        p.x += Math.sin(p.wobblePhase) * 0.5 * dt

        if (p.y > window.innerHeight + 10) {
          p.y = -10
          p.x = Math.random() * window.innerWidth
        }

        p.graphic.x = p.x
        p.graphic.y = p.y
      }
    })
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
