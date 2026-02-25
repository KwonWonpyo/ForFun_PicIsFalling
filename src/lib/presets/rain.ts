import type { PresetConfig } from '../engine/types'

export const rainPreset: PresetConfig = {
  name: 'rain',
  label: '🌧️ 비',
  emitter: {
    spawnRate: 120,
    maxParticles: 2000,
    spawnArea: { type: 'line', x1: -1, y1: -30, x2: -1, y2: -30 },
    particleLifetime: [2, 5],
    initialSpeed: [150, 250],
    initialDirection: [Math.PI * 0.47, Math.PI * 0.53],
    initialSize: [1, 3],
    initialRotation: [0, 0],
    initialOpacity: [0.3, 0.7],
    color: [0xaaccff, 0x88aadd, 0x99bbee],
  },
  forces: [
    { type: 'gravity', strength: 80 },
    { type: 'wind', strength: 15, angle: 0, variability: 8 },
  ],
}
