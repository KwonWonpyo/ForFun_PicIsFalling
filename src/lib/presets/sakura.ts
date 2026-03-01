import type { PresetConfig } from '../engine/types'

export const sakuraPreset: PresetConfig = {
  name: 'sakura',
  label: '🌸 벚꽃',
  emitter: {
    targetOnScreenParticles: 300,
    safetyCap: 900,
    estimatedVerticalAcceleration: 4.5,
    topSpawnBandHeight: 20,
    spawnArea: { type: 'line', x1: -1, y1: -20, x2: -1, y2: -20 },
    particleLifetime: [10, 20],
    initialSpeed: [10, 35],
    initialDirection: [Math.PI * 0.3, Math.PI * 0.7],
    initialSize: [3, 7],
    initialRotation: [0, Math.PI * 2],
    initialOpacity: [0.6, 1.0],
    color: [0xffb7c5, 0xff99aa, 0xffc0cb, 0xffaabb, 0xffe0e8],
    texture: 'sakura',
  },
  forces: [
    { type: 'gravity', strength: 8 },
    { type: 'wind', strength: 12, angle: -0.3, variability: 15 },
    { type: 'turbulence', frequency: 0.3, amplitude: 35 },
  ],
  background: {
    type: 'gradient',
    gradient: 'linear-gradient(180deg, #e8c4d0 0%, #f0d4dd 20%, #fce4ec 45%, #e8b4c8 70%, #5d8a66 85%, #4a7a5a 100%)',
  },
}
