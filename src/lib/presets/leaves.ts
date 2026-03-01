import type { PresetConfig } from '../engine/types'

export const leavesPreset: PresetConfig = {
  name: 'leaves',
  label: '🍂 낙엽',
  emitter: {
    targetOnScreenParticles: 200,
    safetyCap: 700,
    estimatedVerticalAcceleration: 6.5,
    topSpawnBandHeight: 20,
    spawnArea: { type: 'line', x1: -1, y1: -20, x2: -1, y2: -20 },
    particleLifetime: [12, 25],
    initialSpeed: [15, 40],
    initialDirection: [Math.PI * 0.25, Math.PI * 0.75],
    initialSize: [4, 10],
    initialRotation: [0, Math.PI * 2],
    initialOpacity: [0.7, 1.0],
    color: [0xcc6633, 0xdd8844, 0xbb5522, 0xee9955, 0xaa4411, 0xcc7733],
    texture: 'leaf',
  },
  forces: [
    { type: 'gravity', strength: 10 },
    { type: 'wind', strength: 18, angle: -0.2, variability: 20 },
    { type: 'turbulence', frequency: 0.25, amplitude: 45 },
  ],
  background: {
    type: 'gradient',
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #b8d4e3 25%, #d4a574 50%, #c4813d 70%, #8b6914 85%, #5a4a2a 100%)',
  },
}
