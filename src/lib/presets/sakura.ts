import type { PresetConfig } from '../engine/types'

export const sakuraPreset: PresetConfig = {
  name: 'sakura',
  label: '🌸 벚꽃',
  emitter: {
    spawnRate: 15,
    maxParticles: 300,
    spawnArea: { type: 'line', x1: -1, y1: -20, x2: -1, y2: -20 },
    particleLifetime: [10, 20],
    initialSpeed: [10, 35],
    initialDirection: [Math.PI * 0.3, Math.PI * 0.7],
    initialSize: [3, 7],
    initialRotation: [0, Math.PI * 2],
    initialOpacity: [0.6, 1.0],
    color: [0xffb7c5, 0xff99aa, 0xffc0cb, 0xffaabb, 0xffe0e8],
  },
  forces: [
    { type: 'gravity', strength: 8 },
    { type: 'wind', strength: 12, angle: -0.3, variability: 15 },
    { type: 'turbulence', frequency: 0.3, amplitude: 35 },
  ],
}
