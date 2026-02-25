import type { PresetConfig } from '../engine/types'

export const snowPreset: PresetConfig = {
  name: 'snow',
  label: '❄️ 눈',
  emitter: {
    spawnRate: 40,
    maxParticles: 800,
    spawnArea: { type: 'line', x1: -1, y1: -20, x2: -1, y2: -20 },
    particleLifetime: [8, 16],
    initialSpeed: [20, 60],
    initialDirection: [Math.PI * 0.4, Math.PI * 0.6],
    initialSize: [2, 8],
    initialRotation: [0, 0],
    initialOpacity: [0.4, 1.0],
    color: 0xffffff,
  },
  forces: [
    { type: 'gravity', strength: 15 },
    { type: 'turbulence', frequency: 0.4, amplitude: 25 },
  ],
}
